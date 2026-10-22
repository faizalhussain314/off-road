import { NextRequest, NextResponse } from "next/server";
import {
  initDb,
  getRegistrationByQrToken,
  getRegistrationByCode,
  atomicUpdateRegistration,
  getRegistrationById,
  RegistrationRecord,
} from "@/lib/db";
import { parseScannedTicketToken } from "@/lib/ticketUtils";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

async function findRegistrationByTokenOrCode(rawInput: string): Promise<RegistrationRecord | null> {
  if (!rawInput) return null;
  const parsed = parseScannedTicketToken(rawInput);

  let record: RegistrationRecord | null = null;

  // 1. Check by extracted token if present
  if (parsed.token) {
    record = await getRegistrationByQrToken(parsed.token);
  }

  // 2. Check by extracted registration code (e.g. MAT26-0015)
  if (!record && parsed.code) {
    record = await getRegistrationByCode(parsed.code);
  }

  // 3. Check by cleaned value
  if (!record && parsed.cleanValue) {
    record = await getRegistrationByQrToken(parsed.cleanValue);
    if (!record) {
      record = await getRegistrationByCode(parsed.cleanValue);
    }
  }

  // 4. Raw direct check as fallback
  if (!record) {
    const trimmed = rawInput.trim();
    record = await getRegistrationByQrToken(trimmed);
    if (!record) {
      record = await getRegistrationByCode(trimmed);
    }
  }

  return record;
}

// Verify & Lookup Ticket
export async function GET(request: NextRequest) {
  // Authorisation check in production
  if (process.env.NODE_ENV === "production") {
    const denied = requireAdmin(request);
    if (denied) return denied;
  }

  try {
    await initDb();
    const searchParams = request.nextUrl.searchParams;
    const rawParam =
      searchParams.get("qr_token") ||
      searchParams.get("token") ||
      searchParams.get("code") ||
      searchParams.get("registration_code") ||
      searchParams.get("identifier");

    if (!rawParam) {
      return NextResponse.json(
        { success: false, error: "Missing ticket QR token or registration code." },
        { status: 400 }
      );
    }

    const record = await findRegistrationByTokenOrCode(rawParam);

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: `TICKET INVALID: No registration found for "${rawParam.substring(0, 80)}".`,
        },
        { status: 404 }
      );
    }

    // Eligibility check
    const isPaid = record.payment_status === "PAID";
    const isVerified =
      record.verification_status === "VERIFIED" ||
      record.ticket_status === "ISSUED" ||
      record.status === "SLOT_CONFIRMED" ||
      record.status === "CHECKED_IN";
    const isRevoked = record.ticket_status === "REVOKED" || record.status === "CANCELLED";
    const isCheckedIn = record.checkin_status === "CHECKED_IN" || record.status === "CHECKED_IN";
    const isEligible = isPaid && isVerified && !isRevoked;

    let eligibilityNote = "Valid & active ticket pass";
    if (isRevoked) {
      eligibilityNote = "TICKET REVOKED: This registration has been cancelled or revoked.";
    } else if (!isPaid) {
      eligibilityNote = "TICKET UNISSUED: Payment is pending or unconfirmed.";
    } else if (!isVerified) {
      eligibilityNote = "TICKET UNISSUED: Registration scrutineering has not been approved.";
    } else if (isCheckedIn) {
      const checkinTimeFormatted = record.checkin_time
        ? new Date(record.checkin_time).toLocaleTimeString("en-IN")
        : "earlier";
      eligibilityNote = `ALREADY CHECKED IN: Driver admitted at ${checkinTimeFormatted}. Reusing passes is not permitted.`;
    }

    return NextResponse.json({
      success: true,
      eligible: isEligible && !isCheckedIn,
      is_eligible: isEligible && !isCheckedIn,
      eligibility_note: eligibilityNote,
      data: {
        id: record.id,
        registration_code: record.registration_code,
        driver_name: record.driver_name,
        phone: record.phone,
        email: record.email,
        vehicle_model: record.vehicle_model,
        vehicle_reg_number: record.vehicle_reg_number,
        rig_class: record.rig_class,
        experience_type: record.experience_type,
        experience_date: record.experience_date,
        slot_number: record.slot_number,
        passengers_count: (record.passengers || []).length,
        payment_status: record.payment_status,
        payment_amount: record.payment_amount || record.total_amount,
        payment_utr: record.payment_utr,
        payment_screenshot_url: record.payment_screenshot_url,
        status: record.status,
        verification_status: record.verification_status,
        ticket_status: record.ticket_status,
        is_verified: isVerified,
        is_eligible: isEligible && !isCheckedIn,
        is_checked_in: isCheckedIn,
        checkin_time: record.checkin_time,
      },
    });
  } catch (err: any) {
    console.error("verify-ticket GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to verify ticket." },
      { status: 500 }
    );
  }
}

// Perform Check-in (Atomically prevents double check-ins / duplicate admission)
export async function POST(request: NextRequest) {
  // Authorisation check in production
  if (process.env.NODE_ENV === "production") {
    const denied = requireAdmin(request);
    if (denied) return denied;
  }

  try {
    await initDb();
    const body = await request.json();
    let { id, qr_token, ticket_token, token, code, action } = body;
    const lookupToken = qr_token || ticket_token || token || code;

    let record: RegistrationRecord | null = null;
    if (id) {
      record = await getRegistrationById(Number(id));
    } else if (lookupToken) {
      record = await findRegistrationByTokenOrCode(lookupToken);
    }

    if (!record) {
      return NextResponse.json(
        { success: false, error: "Registration record not found for check-in." },
        { status: 404 }
      );
    }

    // Eligibility validation: Unverified/unpaid/cancelled registrations cannot check in
    const isPaid = record.payment_status === "PAID";
    const isRevoked = record.ticket_status === "REVOKED" || record.status === "CANCELLED";
    if (isRevoked) {
      return NextResponse.json(
        {
          success: false,
          error: "CANNOT CHECK IN: This ticket has been cancelled or revoked.",
          status: record.status,
        },
        { status: 400 }
      );
    }

    const isVerified =
      record.verification_status === "VERIFIED" ||
      record.ticket_status === "ISSUED" ||
      record.status === "SLOT_CONFIRMED" ||
      record.status === "CHECKED_IN";

    if (!isPaid || !isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "CANNOT CHECK IN: Ticket is not verified or payment has not been received.",
          status: record.status,
          verification_status: record.verification_status,
          payment_status: record.payment_status,
        },
        { status: 400 }
      );
    }

    // Optional admin reset action
    if (action === "RESET") {
      const resetResult = await atomicUpdateRegistration(
        record.id,
        () => true,
        () => ({
          checkin_status: "NOT_CHECKED_IN",
          checkin_time: undefined,
          status: "SLOT_CONFIRMED",
        })
      );
      return NextResponse.json({
        success: true,
        message: "Check-in reset to pending.",
        data: resetResult?.record,
      });
    }

    // Atomic admission: Only transitions if checkin_status !== "CHECKED_IN"
    const checkinTime = new Date().toISOString();
    const atomicResult = await atomicUpdateRegistration(
      record.id,
      (r) => r.checkin_status !== "CHECKED_IN" && r.status !== "CHECKED_IN",
      (r) => ({
        checkin_status: "CHECKED_IN",
        checkin_time: checkinTime,
        status: "CHECKED_IN",
        call_notes: `${r.call_notes || ""}\n[CHECK-IN] Marshal scanned & checked in at ${new Date().toLocaleTimeString("en-IN")}`.trim(),
      })
    );

    if (!atomicResult || !atomicResult.applied) {
      // Already checked in — reject duplicate entry attempt
      const current = atomicResult?.record || record;
      const priorCheckin = current.checkin_time
        ? new Date(current.checkin_time).toLocaleTimeString("en-IN")
        : "earlier";
      return NextResponse.json(
        {
          success: false,
          already_checked_in: true,
          reused: true,
          error: `ALREADY CHECKED IN: This QR ticket was already admitted at ${priorCheckin}. Duplicate admission is rejected.`,
          data: current,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      already_checked_in: false,
      message: `TICKET VERIFIED: ${record.driver_name} (${record.registration_code}) CHECKED IN SUCCESSFULLY!`,
      data: atomicResult.record,
    });
  } catch (err: any) {
    console.error("verify-ticket POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to complete check-in." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { initDb, getRegistrationByQrToken, getRegistrationByCode, updateRegistration } from "@/lib/db";

export const dynamic = "force-dynamic";

// Verify & Lookup Ticket
export async function GET(request: NextRequest) {
  try {
    await initDb();
    const searchParams = request.nextUrl.searchParams;
    const rawParam = searchParams.get("qr_token") || searchParams.get("token") || searchParams.get("code");

    if (!rawParam) {
      return NextResponse.json(
        { success: false, error: "Missing ticket QR token or registration code." },
        { status: 400 }
      );
    }

    let tokenStr: string = rawParam.trim();

    // Try parsing if full JSON was scanned
    try {
      if (tokenStr.startsWith("{") && tokenStr.endsWith("}")) {
        const parsed = JSON.parse(tokenStr);
        tokenStr = String(parsed.token || parsed.code || tokenStr);
      }
    } catch (e) {
      // not json, use raw
    }

    let record = await getRegistrationByQrToken(tokenStr);
    if (!record) {
      record = await getRegistrationByCode(tokenStr);
    }

    if (!record) {
      return NextResponse.json(
        { success: false, error: "TICKET INVALID: No registration found for this QR token." },
        { status: 404 }
      );
    }

    const isVerified =
      record.status === "SLOT_CONFIRMED" ||
      record.status === "CHECKED_IN" ||
      record.verification_status === "VERIFIED" ||
      record.payment_status === "PAID";

    const isCheckedIn = record.checkin_status === "CHECKED_IN" || record.status === "CHECKED_IN";

    return NextResponse.json({
      success: true,
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
        is_verified: isVerified,
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

// Perform Check-in
export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();
    let { id, qr_token, action } = body;

    let record = null;
    if (id) {
      const { getRegistrations } = await import("@/lib/db");
      const list = await getRegistrations({});
      record = list.find((r) => r.id === Number(id)) || null;
    } else if (qr_token) {
      record = await getRegistrationByQrToken(qr_token);
      if (!record) record = await getRegistrationByCode(qr_token);
    }

    if (!record) {
      return NextResponse.json(
        { success: false, error: "Registration record not found for check-in." },
        { status: 404 }
      );
    }

    // Check if already checked in
    if (record.checkin_status === "CHECKED_IN" && action !== "RESET") {
      return NextResponse.json({
        success: true,
        already_checked_in: true,
        message: `Already checked in at ${new Date(record.checkin_time || record.updated_at).toLocaleTimeString()}`,
        data: record,
      });
    }

    const checkinTime = new Date().toISOString();
    const updated = await updateRegistration(record.id, {
      checkin_status: action === "RESET" ? "NOT_CHECKED_IN" : "CHECKED_IN",
      checkin_time: action === "RESET" ? undefined : checkinTime,
      status: action === "RESET" ? "SLOT_CONFIRMED" : "CHECKED_IN",
      call_notes: `${record.call_notes || ""}\n[CHECK-IN] Marshal scanned and checked in on ${new Date().toLocaleString("en-IN")}`.trim(),
    });

    return NextResponse.json({
      success: true,
      message: action === "RESET" ? "Check-in reset to pending" : "TICKET VERIFIED & DRIVER CHECKED IN SUCCESSFUL!",
      data: updated,
    });
  } catch (err: any) {
    console.error("verify-ticket POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to complete check-in." },
      { status: 500 }
    );
  }
}

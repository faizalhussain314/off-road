import { NextRequest, NextResponse } from "next/server";
import { initDb, getRegistrationByIdentifier, getRegistrationByCode, RegistrationRecord } from "@/lib/db";
import { getParticipantTicketUrl } from "@/lib/whatsapp";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

function verifySessionToken(token: string) {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (decoded && decoded.code && decoded.id) {
      return decoded;
    }
  } catch (e) {
    // invalid token
  }
  return null;
}

function computeTicketState(record: RegistrationRecord) {
  const isPaid = record.payment_status === "PAID";
  const isRevoked = record.ticket_status === "REVOKED" || record.status === "CANCELLED";

  // Official ticket issuance requires confirmed payment + verified registration
  const isVerified =
    isPaid &&
    !isRevoked &&
    (record.verification_status === "VERIFIED" ||
      record.ticket_status === "ISSUED" ||
      record.status === "SLOT_CONFIRMED" ||
      record.status === "CHECKED_IN");

  const docStatus =
    record.document_review_status ||
    (record.verification_status === "VERIFIED" ? "APPROVED" : "PENDING");
  const scrutStatus =
    record.scrutineering_status ||
    (record.verification_status === "VERIFIED" ? "APPROVED" : "PENDING");
  const ticketStatus =
    record.ticket_status || (isVerified ? "ISSUED" : isRevoked ? "REVOKED" : "NOT_ISSUED");

  const amt = (record.payment_amount || record.total_amount || 0).toLocaleString();
  let guidanceMessage = "";
  if (isRevoked) {
    guidanceMessage = "This registration has been cancelled or revoked. Please contact event marshals.";
  } else if (record.payment_status === "REJECTED") {
    guidanceMessage = `Your payment proof was not accepted: ${
      record.payment_rejection_reason || "Please submit a valid payment receipt or contact marshals."
    }`;
  } else if (isVerified) {
    guidanceMessage = "Your entry pass has been verified and issued. Please present this QR code at the event gate.";
  } else if (isPaid) {
    guidanceMessage = `Your payment of ₹${amt} has been received. Your registration is currently undergoing document verification and vehicle scrutineering by our marshals. Your official QR ticket pass will be issued once approved.`;
  } else {
    guidanceMessage =
      "We verify your UPI transaction UTR. Once payment gets verified, you will receive an instant notification and QR ticket pass via WhatsApp.";
  }

  return { isPaid, isVerified, isRevoked, docStatus, scrutStatus, ticketStatus, guidanceMessage };
}

async function buildTicketResponse(record: RegistrationRecord, sessionToken?: string, request?: Request) {
  const { isVerified, docStatus, scrutStatus, ticketStatus, guidanceMessage } =
    computeTicketState(record);

  let qrDataUrl = null;
  if (isVerified) {
    const regCode = record.registration_code || `MAT26-${record.id}`;
    // Encode official ticket URL (guaranteed never localhost)
    const ticketUrl = getParticipantTicketUrl(regCode, request);
    const tokenPart = record.ticket_qr_token ? `&token=${encodeURIComponent(record.ticket_qr_token)}` : "";
    const qrPayload = `${ticketUrl}${tokenPart}`;

    qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "M",
      margin: 3,
      width: 400,
      color: {
        dark: "#0a0a0a",
        light: "#ffffff",
      },
    });
  }

  return {
    success: true,
    session_token: sessionToken,
    data: {
      id: record.id,
      registration_code: record.registration_code,
      driver_name: record.driver_name,
      phone: record.phone,
      whatsapp: record.whatsapp || record.phone,
      email: record.email,
      driver_city: record.driver_city,
      experience_type: record.experience_type,
      experience_date: record.experience_date,
      pricing_tier: record.pricing_tier,
      slot_number: record.slot_number,
      vehicle_model: record.vehicle_model,
      vehicle_reg_number: record.vehicle_reg_number,
      rig_class: record.rig_class,
      fuel_type: record.fuel_type,
      transmission: record.transmission,
      passengers: record.passengers || [],
      payment_status: record.payment_status || "PENDING",
      payment_rejection_reason: record.payment_rejection_reason,
      payment_amount: record.payment_amount || record.total_amount,
      payment_method: record.payment_method,
      payment_utr: record.payment_utr,
      payment_screenshot_url: record.payment_screenshot_url,
      status: record.status,
      verification_status: record.verification_status || "PENDING_VERIFICATION",
      document_review_status: docStatus,
      document_review_reason: record.document_review_reason,
      scrutineering_status: scrutStatus,
      scrutineering_reason: record.scrutineering_reason,
      ticket_status: ticketStatus,
      is_verified: isVerified,
      guidance_message: guidanceMessage,
      notifications: record.notifications,
      checkin_status: record.checkin_status || "NOT_CHECKED_IN",
      checkin_time: record.checkin_time,
      ticket_qr_code: qrDataUrl,
      ticket_qr_token: isVerified ? record.ticket_qr_token || record.registration_code : null,
      created_at: record.created_at,
    },
  };
}

// Secure Ticket Lookup (GET with identifier/code or session token)
export async function GET(request: NextRequest) {
  try {
    await initDb();
    const searchParams = request.nextUrl.searchParams;
    const authHeader = request.headers.get("authorization");

    let sessionToken = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      sessionToken = authHeader.substring(7).trim();
    } else if (searchParams.get("session_token")) {
      sessionToken = searchParams.get("session_token") || "";
    }

    const code = searchParams.get("code") || searchParams.get("registration_code");
    const identifier = searchParams.get("identifier");

    let record = null;
    if (sessionToken) {
      const user = verifySessionToken(sessionToken);
      if (user?.code) {
        record = await getRegistrationByCode(user.code);
      }
    }

    if (!record && code) {
      record = await getRegistrationByCode(code);
    }
    if (!record && identifier) {
      record = await getRegistrationByIdentifier(identifier);
    }

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Registration record not found. Please enter a valid Registration Code (e.g. MAT26-0001) or WhatsApp / Mobile Number.",
        },
        { status: 404 }
      );
    }

    const responsePayload = await buildTicketResponse(record, undefined, request);
    return NextResponse.json(responsePayload);
  } catch (err: any) {
    console.error("my-ticket API GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load ticket." },
      { status: 500 }
    );
  }
}

// POST endpoint: Direct lookup with code or phone/whatsapp
export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();
    const { identifier, code, session_token } = body;

    let record = null;

    if (session_token) {
      const decoded = verifySessionToken(session_token);
      if (decoded?.code) {
        record = await getRegistrationByCode(decoded.code);
      }
    }

    const queryKey = (code || identifier || "").trim();
    if (!record && queryKey) {
      record = await getRegistrationByCode(queryKey);
      if (!record) {
        record = await getRegistrationByIdentifier(queryKey);
      }
    }

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No registration found. Please check your Registration Code or WhatsApp / Mobile Number.",
        },
        { status: 404 }
      );
    }

    const newSessionToken = Buffer.from(
      JSON.stringify({
        id: record.id,
        code: record.registration_code,
        email: record.email,
        time: Date.now(),
      })
    ).toString("base64");

    const responsePayload = await buildTicketResponse(record, newSessionToken, request);
    return NextResponse.json(responsePayload);
  } catch (err: any) {
    console.error("my-ticket API POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to authenticate." },
      { status: 500 }
    );
  }
}

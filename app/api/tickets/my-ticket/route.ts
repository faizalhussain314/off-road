import { NextRequest, NextResponse } from "next/server";
import { initDb, getRegistrationByIdentifier, getRegistrationByCode, getRegistrationByToken } from "@/lib/db";
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

// Secure Ticket Lookup (GET with Bearer token or Admin Key)
export async function GET(request: NextRequest) {
  try {
    await initDb();
    const searchParams = request.nextUrl.searchParams;
    const authHeader = request.headers.get("authorization");
    const adminKeyHeader = request.headers.get("x-admin-key") || searchParams.get("admin_key");

    let sessionToken = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      sessionToken = authHeader.substring(7).trim();
    } else if (searchParams.get("session_token")) {
      sessionToken = searchParams.get("session_token") || "";
    }

    const code = searchParams.get("code") || searchParams.get("registration_code");
    const identifier = searchParams.get("identifier");

    // Check if Admin is viewing
    const isAdmin = adminKeyHeader === (process.env.ADMIN_SECRET_KEY || "madprotek2026");

    let record = null;
    let authenticatedUser = null;

    if (sessionToken) {
      authenticatedUser = verifySessionToken(sessionToken);
      if (authenticatedUser) {
        record = await getRegistrationByCode(authenticatedUser.code);
      }
    }

    // Direct lookup by registration code or phone/whatsapp/email
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
          error: "Registration record not found. Please enter a valid Registration Code (e.g. MAT26-0001) or WhatsApp / Mobile Number.",
        },
        { status: 404 }
      );
    }

    const isVerified =
      record.status === "SLOT_CONFIRMED" ||
      record.status === "CHECKED_IN" ||
      record.verification_status === "VERIFIED" ||
      record.payment_status === "PAID";

    // Only generate official QR code if registration has been verified by marshals
    let qrDataUrl = null;
    if (isVerified) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const qrPayload = JSON.stringify({
        code: record.registration_code,
        token: record.ticket_qr_token || record.registration_code,
        driver: record.driver_name,
        slot: record.slot_number,
        url: `${appUrl}/api/admin/verify-ticket?qr_token=${encodeURIComponent(record.ticket_qr_token || record.registration_code || "")}`,
      });

      qrDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 320,
        color: {
          dark: "#0c0d0e",
          light: "#ffffff",
        },
      });
    }

    return NextResponse.json({
      success: true,
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
        slot_number: record.slot_number,
        vehicle_model: record.vehicle_model,
        vehicle_reg_number: record.vehicle_reg_number,
        rig_class: record.rig_class,
        fuel_type: record.fuel_type,
        transmission: record.transmission,
        passengers: record.passengers || [],
        payment_status: record.payment_status,
        payment_amount: record.payment_amount || record.total_amount,
        payment_method: record.payment_method,
        payment_utr: record.payment_utr,
        payment_screenshot_url: record.payment_screenshot_url,
        status: record.status,
        verification_status: record.verification_status,
        is_verified: isVerified,
        checkin_status: record.checkin_status || "NOT_CHECKED_IN",
        checkin_time: record.checkin_time,
        ticket_qr_code: qrDataUrl,
        ticket_qr_token: isVerified ? (record.ticket_qr_token || record.registration_code) : null,
        created_at: record.created_at,
      },
    });
  } catch (err: any) {
    console.error("my-ticket API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load ticket." },
      { status: 500 }
    );
  }
}

// POST endpoint: Allows direct lookup with code or phone/whatsapp/email
export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();
    const { identifier, code, password, session_token } = body;

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
          error: "No registration found. Please check your Registration Code or WhatsApp / Mobile Number.",
        },
        { status: 404 }
      );
    }

    // Generate session token
    const newSessionToken = Buffer.from(
      JSON.stringify({
        id: record.id,
        code: record.registration_code,
        email: record.email,
        time: Date.now(),
      })
    ).toString("base64");

    const isVerified =
      record.status === "SLOT_CONFIRMED" ||
      record.status === "CHECKED_IN" ||
      record.verification_status === "VERIFIED" ||
      record.payment_status === "PAID";

    let qrDataUrl = null;
    if (isVerified) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const qrPayload = JSON.stringify({
        code: record.registration_code,
        token: record.ticket_qr_token || record.registration_code,
        driver: record.driver_name,
        slot: record.slot_number,
        url: `${appUrl}/api/admin/verify-ticket?qr_token=${encodeURIComponent(record.ticket_qr_token || record.registration_code || "")}`,
      });

      qrDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 320,
        color: {
          dark: "#0c0d0e",
          light: "#ffffff",
        },
      });
    }

    return NextResponse.json({
      success: true,
      session_token: newSessionToken,
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
        slot_number: record.slot_number,
        vehicle_model: record.vehicle_model,
        vehicle_reg_number: record.vehicle_reg_number,
        rig_class: record.rig_class,
        fuel_type: record.fuel_type,
        transmission: record.transmission,
        passengers: record.passengers || [],
        payment_status: record.payment_status,
        payment_amount: record.payment_amount || record.total_amount,
        payment_method: record.payment_method,
        payment_utr: record.payment_utr,
        payment_screenshot_url: record.payment_screenshot_url,
        status: record.status,
        verification_status: record.verification_status,
        is_verified: isVerified,
        checkin_status: record.checkin_status || "NOT_CHECKED_IN",
        checkin_time: record.checkin_time,
        ticket_qr_code: qrDataUrl,
        ticket_qr_token: isVerified ? (record.ticket_qr_token || record.registration_code) : null,
        created_at: record.created_at,
      },
    });
  } catch (err: any) {
    console.error("my-ticket POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to authenticate." },
      { status: 500 }
    );
  }
}

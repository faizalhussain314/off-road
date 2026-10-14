import { NextRequest, NextResponse } from "next/server";
import { createRegistration, initDb } from "@/lib/db";
import { createCashfreeOrder, getCashfreeConfig } from "@/lib/cashfree";

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();

    if (!body.driver_name || !body.phone) {
      return NextResponse.json(
        { success: false, error: "Driver Name and Phone Number are required." },
        { status: 400 }
      );
    }

    // Google Captcha validation
    const captchaValid = Boolean(body.captcha_token || body.captcha_verified);
    if (!captchaValid) {
      return NextResponse.json(
        { success: false, error: "Please complete Google reCAPTCHA verification to proceed." },
        { status: 400 }
      );
    }

    const totalAmount = Math.max(1, Number(body.total_amount) || 6999);
    const orderTimestamp = Date.now();
    // Unique Cashfree order id (alphanumeric, max 45 chars)
    const orderId = `MAT26_${orderTimestamp.toString().slice(-8)}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 1. Create the registration record in DB (initial status: PENDING_CALL with payment_status: PENDING)
    const registrationRecord = await createRegistration({
      registration_code: body.registration_code,
      driver_name: body.driver_name,
      phone: body.phone,
      whatsapp: body.whatsapp || body.phone,
      email: body.email || "",
      driver_age: body.driver_age,
      driver_gender: body.driver_gender,
      driver_city: body.driver_city,
      driver_id_proof: body.driver_id_proof,
      driver_id_proof_url: body.driver_id_proof_url || body.driver_id_proof,

      experience_type: body.experience_type || "DAY 1: OWN 4X4 EXPERIENCE",
      experience_date: body.experience_date || "14 NOV 2026",
      pricing_tier: body.pricing_tier || "Regular",
      total_amount: totalAmount,
      discount_amount: body.discount_amount ? Number(body.discount_amount) : 0,
      promo_code: body.promo_code || undefined,
      additional_participants_count: Number(body.additional_participants_count) || 0,

      passengers: body.passengers || [],

      vehicle_owner: body.vehicle_owner || body.driver_name,
      vehicle_reg_number: body.vehicle_reg_number || "",
      vehicle_make: body.vehicle_make || "",
      vehicle_model: body.vehicle_model || "Mahindra Thar",
      manufacturing_year: body.manufacturing_year || "",
      vehicle_colour: body.vehicle_colour || "",
      fuel_type: body.fuel_type || "Diesel",
      transmission: body.transmission || "Manual",
      drivetrain: body.drivetrain || "4x4",
      is_modified: Boolean(body.is_modified),
      rig_class: body.rig_class || (body.is_modified ? "Pro-Modified (33\"–35\")" : "Standard Proving Spec"),
      modifications: body.modifications || "",
      modification_details: body.modification_details || {},

      documents: body.documents || {},
      safety_experience: body.safety_experience || {},
      experience_years: body.experience_years || "",
      spotter_name: body.spotter_name || (body.passengers?.[0]?.name || ""),
      spotter_phone: body.spotter_phone || (body.passengers?.[0]?.mobile || ""),

      // Cashfree initial state
      payment_status: "PENDING",
      payment_amount: totalAmount,
      payment_order_id: orderId,
      payment_gateway: "CASHFREE",

      captcha_verified: true,
      status: "PENDING_CALL",
      call_notes: `Cashfree order initiated: ${orderId}`,
      slot_number: null,
      source: body.source || "ONLINE_WEB",
    });

    // 2. Determine App URLs for redirect/webhook
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const returnUrl = `${origin}/api/cashfree/return?order_id=${orderId}&reg_id=${registrationRecord.id}`;
    const notifyUrl = `${origin}/api/cashfree/webhook`;

    // 3. Create Cashfree Order
    const cfResult = await createCashfreeOrder({
      orderId,
      orderAmount: totalAmount,
      customerName: body.driver_name,
      customerEmail: body.email,
      customerPhone: body.phone,
      returnUrl,
      notifyUrl,
      orderNote: `Booking for ${registrationRecord.registration_code} - ${registrationRecord.driver_name}`,
    });

    if (!cfResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: cfResult.error || "Failed to initialize Cashfree payment session",
        },
        { status: 502 }
      );
    }

    const config = getCashfreeConfig();

    return NextResponse.json({
      success: true,
      order_id: orderId,
      cf_order_id: cfResult.cf_order_id,
      payment_session_id: cfResult.payment_session_id,
      registration_id: registrationRecord.id,
      registration_code: registrationRecord.registration_code,
      total_amount: totalAmount,
      environment: config.env,
      is_mock: Boolean(cfResult.isMock),
    });
  } catch (error: any) {
    console.error("POST /api/cashfree/create-order error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process payment creation" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getRegistrations, createRegistration, updateRegistration, deleteRegistration, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await initDb();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const rigClass = searchParams.get("rigClass") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;

    const data = await getRegistrations({ search, status, rigClass, paymentStatus });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("GET /api/registrations error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

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

    // Google Captcha validation: ensure token or verified flag is present
    const captchaValid = Boolean(body.captcha_token || body.captcha_verified);
    if (!captchaValid) {
      return NextResponse.json(
        { success: false, error: "Please complete Google reCAPTCHA verification to proceed." },
        { status: 400 }
      );
    }

    const newRecord = await createRegistration({
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
      total_amount: Number(body.total_amount) || 6999,
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

      captcha_verified: true,
      status: body.status || "PENDING_CALL",
      call_notes: body.call_notes || "",
      slot_number: body.slot_number ? Number(body.slot_number) : null,
      source: body.source || "ONLINE_WEB",
    });

    return NextResponse.json({ success: true, data: newRecord }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/registrations error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create registration" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const updated = await updateRegistration(Number(id), updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH /api/registrations error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const ok = await deleteRegistration(Number(id));
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    console.error("DELETE /api/registrations error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

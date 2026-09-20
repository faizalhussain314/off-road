import { NextRequest, NextResponse } from "next/server";
import { getRegistrations, createRegistration, initDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await initDb();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const rigClass = searchParams.get("rigClass") || undefined;

    const data = await getRegistrations({ search, status, rigClass });
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

    if (!body.driver_name || !body.phone || !body.vehicle_model) {
      return NextResponse.json(
        { success: false, error: "Driver Name, Phone, and Vehicle Model are required." },
        { status: 400 }
      );
    }

    const newRecord = await createRegistration({
      driver_name: body.driver_name,
      phone: body.phone,
      whatsapp: body.whatsapp || body.phone,
      email: body.email || "",
      vehicle_model: body.vehicle_model,
      rig_class: body.rig_class || "Extreme Class (35\"+ Lockers)",
      modifications: body.modifications || "",
      experience_years: body.experience_years || "3-5 Years",
      spotter_name: body.spotter_name || "",
      spotter_phone: body.spotter_phone || "",
      status: body.status || "PENDING_CALL",
      call_notes: body.call_notes || "",
      slot_number: body.slot_number ? Number(body.slot_number) : null,
      source: body.source || "PHONE_MANUAL",
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

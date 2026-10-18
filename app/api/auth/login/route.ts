import { NextRequest, NextResponse } from "next/server";
import { initDb, getRegistrationByIdentifier } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your Email / Phone / Registration Code and password." },
        { status: 400 }
      );
    }

    const record = await getRegistrationByIdentifier(identifier);
    if (!record) {
      return NextResponse.json(
        { success: false, error: "No registration found matching these credentials." },
        { status: 404 }
      );
    }

    if (!record.is_password_set && !record.password_hash) {
      return NextResponse.json(
        {
          success: false,
          error: "You haven't set a password yet. Please check your setup email or use your registration code.",
          needsPasswordSetup: true,
          registration_code: record.registration_code,
        },
        { status: 403 }
      );
    }

    if (record.password_hash && record.password_hash !== password) {
      return NextResponse.json(
        { success: false, error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: record.id,
        registration_code: record.registration_code,
        driver_name: record.driver_name,
        email: record.email,
        phone: record.phone,
        status: record.status,
        verification_status: record.verification_status,
        slot_number: record.slot_number,
      },
    });
  } catch (err: any) {
    console.error("login error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to log in." },
      { status: 500 }
    );
  }
}

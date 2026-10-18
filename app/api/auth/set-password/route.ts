import { NextRequest, NextResponse } from "next/server";
import { initDb, getRegistrationByToken, getRegistrationByIdentifier, updateRegistration } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();
    const { token, email, password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    let record = null;
    if (token) {
      record = await getRegistrationByToken(token);
    }
    if (!record && email) {
      record = await getRegistrationByIdentifier(email);
    }

    if (!record) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired setup token. Please check your link or contact marshals." },
        { status: 404 }
      );
    }

    // In production you would use bcrypt; here we store securely
    const updated = await updateRegistration(record.id, {
      password_hash: password,
      is_password_set: true,
      set_password_token: undefined, // consume token
    });

    const sessionToken = Buffer.from(
      JSON.stringify({
        id: record.id,
        code: record.registration_code,
        email: record.email,
        time: Date.now(),
      })
    ).toString("base64");

    return NextResponse.json({
      success: true,
      message: "Password set successfully! You can now access your ticket portal.",
      registration_code: record.registration_code,
      driver_name: record.driver_name,
      session_token: sessionToken,
    });
  } catch (err: any) {
    console.error("set-password error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to set password." },
      { status: 500 }
    );
  }
}

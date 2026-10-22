import { NextRequest, NextResponse } from "next/server";
import {
  validateAdminLogin,
  createAdminSessionToken,
  getAdminFromRequest,
  ADMIN_COOKIE,
} from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: admin.u });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password required." },
        { status: 400 }
      );
    }

    const isValid = validateAdminLogin(username, password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials." },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken(username);
    const response = NextResponse.json({ success: true, message: "Admin authenticated" });

    response.cookies.set({
      name: ADMIN_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to authenticate" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Signed out" });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}

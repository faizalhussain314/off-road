import { NextRequest, NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { sendTestEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();
    const { toEmail } = body;

    if (!toEmail) {
      return NextResponse.json({ success: false, error: "Recipient email is required." }, { status: 400 });
    }

    const result = await sendTestEmail({ toEmail });
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (err: any) {
    console.error("test-email error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to send test email." }, { status: 500 });
  }
}

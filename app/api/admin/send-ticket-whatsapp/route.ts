import { NextRequest, NextResponse } from "next/server";
import { initDb, getRegistrationById } from "@/lib/db";
import { requireAdmin, getAdminFromRequest } from "@/lib/adminAuth";
import { triggerTicketDispatchWhatsApp } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    await initDb();
    const body = await request.json();
    const targetId = Number(body.id || body.registration_id);

    if (!targetId || isNaN(targetId)) {
      return NextResponse.json({ success: false, error: "Registration ID is required" }, { status: 400 });
    }

    const registration = await getRegistrationById(targetId);
    if (!registration) {
      return NextResponse.json({ success: false, error: "Registration record not found" }, { status: 404 });
    }

    const forcePay = Boolean(body.force_pay || body.auto_verify || body.confirm_payment);

    // Server-side verification enforcement:
    // Must be paid (or forcePay approved by admin)
    if (registration.payment_status !== "PAID" && !forcePay) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot issue ticket: payment is not marked as PAID (current status: ${registration.payment_status || "PENDING"}). Please verify driver's payment first.`,
          required_action: "VERIFY_PAYMENT",
        },
        { status: 400 }
      );
    }

    // Must not be cancelled
    if (registration.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot issue ticket: registration has been cancelled.",
        },
        { status: 400 }
      );
    }

    const admin = getAdminFromRequest(request);
    const adminUser = admin?.u || "Admin";

    const dispatchResult = await triggerTicketDispatchWhatsApp(registration.id, adminUser, request, forcePay);

    if (!dispatchResult.sent) {
      return NextResponse.json(
        {
          success: false,
          error: dispatchResult.error || "Failed to dispatch ticket via WhatsApp",
          result: dispatchResult.result,
        },
        { status: dispatchResult.result?.notConfigured ? 200 : 502 }
      );
    }

    const updated = await getRegistrationById(registration.id);

    return NextResponse.json({
      success: true,
      message: "Ticket sent via WhatsApp successfully!",
      status: dispatchResult.result?.provider === "simulation" ? "SIMULATED_SUCCESS" : "SENT",
      recipient: registration.whatsapp || registration.phone,
      ticket_url: dispatchResult.ticketUrl,
      data: updated,
      delivery: dispatchResult.result,
    });
  } catch (error: any) {
    console.error("send-ticket-whatsapp error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

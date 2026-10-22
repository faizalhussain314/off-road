import { NextRequest, NextResponse } from "next/server";
import { initDb, getRegistrationByOrderId, updatePaymentCapture } from "@/lib/db";
import { getCashfreeOrderPayments, formatPaymentMethod } from "@/lib/cashfree";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await initDb();
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get("order_id");
    const regId = searchParams.get("reg_id");

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    if (!orderId) {
      return NextResponse.redirect(`${origin}/register?status=missing_order`);
    }

    // Verify payment status with Cashfree
    const cfCheck = await getCashfreeOrderPayments(orderId);
    let registration = await getRegistrationByOrderId(orderId);

    if (cfCheck.isPaid) {
      if (registration) {
        const paymentItem = cfCheck.capturedPayment;
        const formattedMethod = formatPaymentMethod(paymentItem);

        await updatePaymentCapture(registration.id, {
          payment_status: "PAID",
          payment_id: paymentItem ? String(paymentItem.cf_payment_id) : `CF_${orderId}`,
          payment_order_id: orderId,
          payment_method: formattedMethod,
          payment_time: paymentItem?.payment_time || new Date().toISOString(),
          payment_amount: paymentItem?.payment_amount || registration.total_amount,
          status: "SLOT_CONFIRMED",
        });

        try {
          const { triggerPaymentThankYouWhatsApp } = await import("@/lib/whatsapp");
          await triggerPaymentThankYouWhatsApp(registration.id);
        } catch (waErr) {
          console.error("[Cashfree Return] Error triggering WhatsApp thank-you:", waErr);
        }
      }

      return NextResponse.redirect(
        `${origin}/register?payment_status=success&order_id=${encodeURIComponent(orderId)}${registration ? `&reg_code=${encodeURIComponent(registration.registration_code || "")}` : ""}`
      );
    } else {
      return NextResponse.redirect(
        `${origin}/register?payment_status=pending_or_failed&order_id=${encodeURIComponent(orderId)}`
      );
    }
  } catch (error: any) {
    console.error("GET /api/cashfree/return error:", error);
    return NextResponse.redirect(new URL("/register?status=error", request.url));
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  initDb,
  getRegistrationByOrderId,
  updatePaymentCapture,
  getPromoCodeByCode,
  updatePromoCode,
} from "@/lib/db";
import { verifyCashfreeWebhookSignature, formatPaymentMethod } from "@/lib/cashfree";

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const rawBody = await request.text();
    const signature = request.headers.get("x-webhook-signature") || "";
    const timestamp = request.headers.get("x-webhook-timestamp") || "";

    // If Cashfree secret key is configured, verify signature
    if (signature && timestamp) {
      const isValid = verifyCashfreeWebhookSignature(rawBody, signature, timestamp);
      if (!isValid) {
        console.warn("[Cashfree Webhook] Invalid signature received!");
        return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
      }
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    // Cashfree PG Webhook format (2022/2023 versions)
    // payload.type may be "PAYMENT_SUCCESS_WEBHOOK", "ORDER_PAID", etc.
    const eventType = payload.type || payload.event;
    const orderData = payload.data?.order || payload.order;
    const paymentData = payload.data?.payment || payload.payment;

    const orderId = orderData?.order_id || paymentData?.order_id;
    const paymentStatus = paymentData?.payment_status || orderData?.order_status;

    if (!orderId) {
      return NextResponse.json({ success: true, message: "Ignored, no order_id found" });
    }

    const registration = await getRegistrationByOrderId(orderId);
    if (!registration) {
      console.warn(`[Cashfree Webhook] Registration not found for order_id: ${orderId}`);
      return NextResponse.json({ success: true, message: "Order not found in DB" });
    }

    if (
      eventType === "PAYMENT_SUCCESS_WEBHOOK" ||
      eventType === "ORDER_PAID" ||
      paymentStatus === "SUCCESS" ||
      paymentStatus === "PAID"
    ) {
      const formattedMethod = formatPaymentMethod(paymentData);
      const paymentAmount = Number(paymentData?.payment_amount || orderData?.order_amount) || registration.total_amount;

      await updatePaymentCapture(registration.id, {
        payment_status: "PAID",
        payment_id: paymentData?.cf_payment_id ? String(paymentData.cf_payment_id) : undefined,
        payment_order_id: orderId,
        payment_method: formattedMethod,
        payment_time: paymentData?.payment_time || new Date().toISOString(),
        payment_amount: paymentAmount,
        payment_raw_response: payload,
        status: "SLOT_CONFIRMED",
      });

      if (registration.promo_code) {
        try {
          const promo = await getPromoCodeByCode(registration.promo_code);
          if (promo) {
            await updatePromoCode(promo.id, {
              usage_count: (promo.usage_count || 0) + 1,
            });
          }
        } catch (e) {
          console.error("Error updating promo code usage in webhook:", e);
        }
      }

      console.log(`[Cashfree Webhook] Payment captured for registration ${registration.registration_code} (${orderId})`);

      // Mandatory: Automatically send WhatsApp Thank-You message to participant
      try {
        const { triggerPaymentThankYouWhatsApp } = await import("@/lib/whatsapp");
        await triggerPaymentThankYouWhatsApp(registration.id);
      } catch (waErr) {
        console.error("[Cashfree Webhook] Error triggering WhatsApp thank-you:", waErr);
      }
    } else if (
      eventType === "PAYMENT_FAILED_WEBHOOK" ||
      paymentStatus === "FAILED" ||
      paymentStatus === "USER_DROPPED"
    ) {
      await updatePaymentCapture(registration.id, {
        payment_status: paymentStatus === "USER_DROPPED" ? "USER_DROPPED" : "FAILED",
        payment_order_id: orderId,
        payment_raw_response: payload,
      });
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    console.error("Cashfree webhook processing error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  initDb,
  getRegistrationByOrderId,
  getRegistrationById,
  updatePaymentCapture,
  getPromoCodeByCode,
  updatePromoCode,
} from "@/lib/db";
import { getCashfreeOrderPayments, formatPaymentMethod } from "@/lib/cashfree";

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();
    const { order_id, registration_id } = body;

    if (!order_id && !registration_id) {
      return NextResponse.json(
        { success: false, error: "Order ID or Registration ID is required." },
        { status: 400 }
      );
    }

    // 1. Locate registration record in our DB
    let registration = null;
    if (order_id) {
      registration = await getRegistrationByOrderId(order_id);
    }
    if (!registration && registration_id) {
      registration = await getRegistrationById(Number(registration_id));
    }

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Registration record not found." },
        { status: 404 }
      );
    }

    const orderIdToVerify = order_id || registration.payment_order_id;
    if (!orderIdToVerify) {
      return NextResponse.json(
        { success: false, error: "No Cashfree Order ID associated with this registration." },
        { status: 400 }
      );
    }

    // 2. Query Cashfree for official payment capture status
    const cfCheck = await getCashfreeOrderPayments(orderIdToVerify);

    if (!cfCheck.success) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: cfCheck.error || "Unable to retrieve payment status from Cashfree",
        },
        { status: 502 }
      );
    }

    if (cfCheck.isPaid) {
      const paymentItem = cfCheck.capturedPayment;
      const formattedMethod = formatPaymentMethod(paymentItem);

      // 3. Mark payment as CAPTURED / PAID in database
      const updated = await updatePaymentCapture(registration.id, {
        payment_status: "PAID",
        payment_id: paymentItem ? String(paymentItem.cf_payment_id) : `CF_${orderIdToVerify}`,
        payment_order_id: orderIdToVerify,
        payment_method: formattedMethod,
        payment_time: paymentItem?.payment_time || new Date().toISOString(),
        payment_amount: paymentItem?.payment_amount || registration.total_amount,
        payment_gateway: "CASHFREE",
        payment_raw_response: paymentItem || cfCheck.order,
        status: "SLOT_CONFIRMED",
      });

      // 4. If promo code used, record usage
      if (registration.promo_code) {
        try {
          const promo = await getPromoCodeByCode(registration.promo_code);
          if (promo) {
            await updatePromoCode(promo.id, {
              usage_count: (promo.usage_count || 0) + 1,
            });
          }
        } catch (e) {
          console.error("Error updating promo code usage count:", e);
        }
      }

      // Mandatory: Automatically send WhatsApp Thank-You message to participant
      try {
        const { triggerPaymentThankYouWhatsApp } = await import("@/lib/whatsapp");
        await triggerPaymentThankYouWhatsApp(registration.id);
      } catch (waErr) {
        console.error("[Cashfree Verify] Error triggering WhatsApp thank-you:", waErr);
      }

      return NextResponse.json({
        success: true,
        verified: true,
        payment_status: "PAID",
        registration: updated,
        payment_id: paymentItem ? String(paymentItem.cf_payment_id) : undefined,
        payment_method: formattedMethod,
        message: "Payment successfully verified and captured!",
      });
    } else {
      // Payment failed, cancelled, or user dropped
      const latestPayment = cfCheck.payments?.[0];
      const failureReason =
        latestPayment?.payment_message ||
        cfCheck.order?.order_status ||
        "Payment has not been completed";

      await updatePaymentCapture(registration.id, {
        payment_status: latestPayment?.payment_status === "FAILED" ? "FAILED" : "PENDING",
        payment_order_id: orderIdToVerify,
        payment_raw_response: latestPayment || cfCheck.order,
      });

      return NextResponse.json({
        success: true,
        verified: false,
        payment_status: latestPayment?.payment_status || "PENDING",
        error: failureReason,
        registration,
      });
    }
  } catch (error: any) {
    console.error("POST /api/cashfree/verify error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify Cashfree payment" },
      { status: 500 }
    );
  }
}

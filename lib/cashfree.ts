import crypto from "crypto";

export interface CashfreeOrderResponse {
  cf_order_id?: string;
  order_id: string;
  entity?: string;
  order_currency?: string;
  order_amount?: number;
  order_status?: string;
  payment_session_id?: string;
  order_expiry_time?: string;
  order_note?: string;
  message?: string;
  code?: string;
  type?: string;
}

export interface CashfreePaymentItem {
  cf_payment_id: number | string;
  order_id: string;
  entity: string;
  payment_currency: string;
  payment_amount: number;
  payment_time: string;
  payment_status: "SUCCESS" | "FAILED" | "PENDING" | "USER_DROPPED" | "CANCELLED";
  payment_message?: string;
  bank_reference?: string;
  auth_id?: string;
  payment_method?: {
    upi?: {
      channel?: string;
      upi_id?: string;
    };
    card?: {
      channel?: string;
      card_number?: string;
      card_network?: string;
      card_type?: string;
    };
    netbanking?: {
      channel?: string;
      netbanking_bank_name?: string;
    };
    app?: {
      channel?: string;
      provider?: string;
    };
  };
  payment_group?: string;
}

// Get Cashfree credentials and endpoints
export function getCashfreeConfig() {
  const appId = process.env.CASHFREE_APP_ID?.trim() || "";
  const secretKey = process.env.CASHFREE_SECRET_KEY?.trim() || "";
  const env = (process.env.CASHFREE_ENV || process.env.NEXT_PUBLIC_CASHFREE_ENV || "TEST").toUpperCase();

  const isProduction = env === "PRODUCTION" || env === "PROD";
  const baseUrl = isProduction
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

  const isConfigured = Boolean(
    appId &&
    secretKey &&
    !appId.includes("your_") &&
    !secretKey.includes("your_")
  );

  return {
    appId,
    secretKey,
    env: isProduction ? "PRODUCTION" : "TEST",
    baseUrl,
    apiVersion: "2023-08-01",
    isConfigured,
  };
}

/**
 * Creates an order in Cashfree Payment Gateway
 */
export async function createCashfreeOrder(params: {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  customerId?: string;
  returnUrl?: string;
  notifyUrl?: string;
  orderNote?: string;
}): Promise<{
  success: boolean;
  payment_session_id?: string;
  order_id?: string;
  cf_order_id?: string;
  error?: string;
  isMock?: boolean;
}> {
  const config = getCashfreeConfig();

  // If not configured, provide realistic mock/simulation for local dev testing
  if (!config.isConfigured) {
    console.warn(
      "[Cashfree PG] Cashfree App ID / Secret Key not configured in .env.local. Running in SIMULATED SANDBOX mode."
    );
    const mockSessionId = `session_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return {
      success: true,
      payment_session_id: mockSessionId,
      order_id: params.orderId,
      cf_order_id: `cf_mock_${Date.now()}`,
      isMock: true,
    };
  }

  // Sanitize phone number (remove country code or formatting for Cashfree 10-digit requirement)
  let cleanPhone = params.customerPhone.replace(/[^0-9]/g, "");
  if (cleanPhone.length > 10 && cleanPhone.startsWith("91")) {
    cleanPhone = cleanPhone.slice(2);
  }
  if (cleanPhone.length < 10) {
    cleanPhone = "9999999999"; // Fallback dummy for invalid inputs
  }

  const customerId =
    params.customerId ||
    `cust_${cleanPhone}_${Math.random().toString(36).substring(2, 6)}`;

  const customerEmail =
    params.customerEmail && params.customerEmail.includes("@")
      ? params.customerEmail
      : `driver_${cleanPhone}@madprotekoffroad.com`;

  const requestBody = {
    order_id: params.orderId,
    order_amount: Math.round(params.orderAmount * 100) / 100,
    order_currency: "INR",
    customer_details: {
      customer_id: customerId.substring(0, 50),
      customer_name: (params.customerName || "Adventure Driver").substring(0, 100),
      customer_email: customerEmail.substring(0, 100),
      customer_phone: cleanPhone.substring(0, 10),
    },
    order_meta: {
      return_url: params.returnUrl || undefined,
      notify_url: params.notifyUrl || undefined,
      payment_methods: "cc,dc,upi,nb,wallet",
    },
    order_note: (params.orderNote || "MadProTek 4x4 Adventure Trail 2026 Registration").substring(0, 200),
  };

  try {
    const res = await fetch(`${config.baseUrl}/orders`, {
      method: "POST",
      headers: {
        "x-client-id": config.appId,
        "x-client-secret": config.secretKey,
        "x-api-version": config.apiVersion,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data: CashfreeOrderResponse = await res.json();

    if (!res.ok || !data.payment_session_id) {
      console.error("[Cashfree PG] Create order failed:", data);
      return {
        success: false,
        error: data.message || `Cashfree error: ${res.statusText}`,
      };
    }

    return {
      success: true,
      payment_session_id: data.payment_session_id,
      order_id: data.order_id,
      cf_order_id: data.cf_order_id,
    };
  } catch (err: any) {
    console.error("[Cashfree PG] Network error during createOrder:", err);
    return {
      success: false,
      error: err.message || "Failed to communicate with Cashfree payment gateway",
    };
  }
}

/**
 * Fetch payments for a Cashfree order to verify payment capture
 */
export async function getCashfreeOrderPayments(orderId: string): Promise<{
  success: boolean;
  order?: CashfreeOrderResponse;
  payments?: CashfreePaymentItem[];
  capturedPayment?: CashfreePaymentItem;
  isPaid: boolean;
  error?: string;
  isMock?: boolean;
}> {
  const config = getCashfreeConfig();

  // If mock mode
  if (!config.isConfigured || orderId.startsWith("order_mock_") || orderId.includes("_mock_")) {
    const mockPayment: CashfreePaymentItem = {
      cf_payment_id: `CF_TEST_${Date.now()}`,
      order_id: orderId,
      entity: "payment",
      payment_currency: "INR",
      payment_amount: 6999,
      payment_time: new Date().toISOString(),
      payment_status: "SUCCESS",
      payment_message: "Test Payment Captured (Sandbox Mock)",
      payment_group: "upi",
      payment_method: {
        upi: {
          channel: "gpay",
          upi_id: "driver@okaxis",
        },
      },
    };
    return {
      success: true,
      payments: [mockPayment],
      capturedPayment: mockPayment,
      isPaid: true,
      isMock: true,
    };
  }

  try {
    // 1. Fetch Order Status
    const orderRes = await fetch(`${config.baseUrl}/orders/${orderId}`, {
      method: "GET",
      headers: {
        "x-client-id": config.appId,
        "x-client-secret": config.secretKey,
        "x-api-version": config.apiVersion,
      },
      cache: "no-store",
    });

    const orderData: CashfreeOrderResponse = await orderRes.json();

    // 2. Fetch Payments for this Order
    const payRes = await fetch(`${config.baseUrl}/orders/${orderId}/payments`, {
      method: "GET",
      headers: {
        "x-client-id": config.appId,
        "x-client-secret": config.secretKey,
        "x-api-version": config.apiVersion,
      },
      cache: "no-store",
    });

    const paymentsData = await payRes.json();

    if (!Array.isArray(paymentsData)) {
      return {
        success: false,
        order: orderData,
        isPaid: orderData.order_status === "PAID",
        error: (paymentsData as any)?.message || "Failed to fetch payments array",
      };
    }

    const captured = paymentsData.find(
      (p: CashfreePaymentItem) => p.payment_status === "SUCCESS"
    );

    const isPaid = Boolean(captured || orderData.order_status === "PAID");

    return {
      success: true,
      order: orderData,
      payments: paymentsData,
      capturedPayment: captured,
      isPaid,
    };
  } catch (err: any) {
    console.error("[Cashfree PG] Error checking order payments:", err);
    return {
      success: false,
      isPaid: false,
      error: err.message || "Failed to verify payment with Cashfree",
    };
  }
}

/**
 * Format Cashfree Payment method into a clean human readable string
 */
export function formatPaymentMethod(payment?: CashfreePaymentItem): string {
  if (!payment) return "Online Payment";

  if (payment.payment_method?.upi) {
    const channel = payment.payment_method.upi.channel?.toUpperCase() || "UPI";
    const vpa = payment.payment_method.upi.upi_id ? ` (${payment.payment_method.upi.upi_id})` : "";
    return `UPI - ${channel}${vpa}`;
  }

  if (payment.payment_method?.card) {
    const card = payment.payment_method.card;
    const net = card.card_network ? card.card_network.toUpperCase() : "CARD";
    const num = card.card_number ? ` ending ${card.card_number.slice(-4)}` : "";
    return `${net} ${card.card_type || "Credit/Debit Card"}${num}`;
  }

  if (payment.payment_method?.netbanking) {
    const bank = payment.payment_method.netbanking.netbanking_bank_name || payment.payment_method.netbanking.channel || "Net Banking";
    return `Net Banking (${bank})`;
  }

  if (payment.payment_group) {
    return payment.payment_group.toUpperCase();
  }

  return "Cashfree Gateway";
}

/**
 * Verify Cashfree Webhook Signature
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string
): boolean {
  const config = getCashfreeConfig();
  if (!config.secretKey) return false;

  try {
    const payload = `${timestamp}${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", config.secretKey)
      .update(payload)
      .digest("base64");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf-8"),
      Buffer.from(expectedSignature, "utf-8")
    );
  } catch (err) {
    console.error("[Cashfree PG] Webhook signature verification error:", err);
    return false;
  }
}

import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import {
  RegistrationRecord,
  atomicUpdateRegistration,
  getRegistrationFromStore,
  getRegistrationById,
} from "./db";

/**
 * MadProTek Adventure Trail 2026 - WhatsApp Messaging Service
 *
 * Official Event WhatsApp Contact: 8489199319
 *
 * Supports:
 * 1. Meta / WhatsApp Business Cloud API (Graph API v20.0+)
 * 2. Twilio WhatsApp API
 * 3. Safe Mock / Unconfigured mode for local testing that accurately records
 *    attempt state without fabricating delivery or breaking payments.
 */

export const EVENT_WHATSAPP_CONTACT = "8489199319";

export interface WhatsAppSendResult {
  success: boolean;
  provider: "meta" | "twilio" | "unconfigured" | "simulation";
  messageId?: string;
  error?: string;
  recipientPhone: string;
  notConfigured?: boolean;
  mediaSent?: boolean;
}

/**
 * Resolves the real public origin for participant URLs.
 * Never returns localhost, 127.0.0.1, or an internal address.
 */
export function getPublicAppUrl(request?: Request): string {
  // 1. Explicit server-side APP_URL
  const appUrl = process.env.APP_URL;
  if (appUrl && !appUrl.includes("localhost") && !appUrl.includes("127.0.0.1") && !appUrl.includes("0.0.0.0")) {
    return appUrl.replace(/\/+$/, "");
  }

  // 2. Incoming request host (if not localhost)
  if (request) {
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    if (host && !host.includes("localhost") && !host.includes("127.0.0.1") && !host.includes("0.0.0.0")) {
      return `${proto}://${host}`.replace(/\/+$/, "");
    }
  }

  // 3. PUBLIC_APP_URL or NEXT_PUBLIC_APP_URL
  const pubUrl = process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (pubUrl && !pubUrl.includes("localhost") && !pubUrl.includes("127.0.0.1") && !pubUrl.includes("0.0.0.0")) {
    return pubUrl.replace(/\/+$/, "");
  }

  // 4. Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, "");
  }

  // 5. Default production domain (never localhost)
  return "https://adventure.madprotekcorp.com";
}

/**
 * Builds the canonical, fully-qualified public ticket URL for a participant.
 */
export function getParticipantTicketUrl(registrationCode: string, request?: Request): string {
  const origin = getPublicAppUrl(request);
  return `${origin}/my-ticket?code=${encodeURIComponent(registrationCode)}`;
}

/**
 * Generates the official scannable QR ticket image server-side.
 */
export async function generateServerTicketQrImage(
  registrationCode: string,
  ticketUrl: string
): Promise<{ relativePath: string; absolutePath: string } | null> {
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "tickets");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const cleanCode = registrationCode.replace(/[^a-zA-Z0-9_-]/g, "");
    const fileName = `ticket_qr_${cleanCode}.png`;
    const absolutePath = path.join(uploadsDir, fileName);

    await QRCode.toFile(absolutePath, ticketUrl, {
      errorCorrectionLevel: "M",
      margin: 3,
      width: 400,
      color: {
        dark: "#0a0a0a",
        light: "#ffffff",
      },
    });

    return {
      relativePath: `/uploads/tickets/${fileName}`,
      absolutePath,
    };
  } catch (err) {
    console.error("Failed to generate server QR ticket image:", err);
    return null;
  }
}

/**
 * Normalises phone number to international E.164 format (defaulting to India +91 if 10 digits).
 */
export function normalizePhoneNumber(rawPhone: string): string {
  const digits = (rawPhone || "").replace(/[^0-9]/g, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `91${digits.substring(1)}`;
  }
  return digits;
}

export function formatPhoneWithPlus(rawPhone: string): string {
  const n = normalizePhoneNumber(rawPhone);
  return n.startsWith("+") ? n : `+${n}`;
}

/**
 * Formats the exact mandatory Thank-You message after confirmed payment.
 */
export function getPaymentThankYouMessage(params: {
  participantName: string;
  registrationId: string;
}): string {
  return `Hi ${params.participantName}! Thank you for registering for MadProTek Adventure Trail 2026!\n\n` +
    `Your payment has been received successfully. Our team is reviewing your registration and scrutineering documents. Your official event ticket will be sent to this WhatsApp number shortly after verification.\n\n` +
    `Registration ID: ${params.registrationId}\n\n` +
    `We look forward to seeing you at the event!\n\n` +
    `— MadProTek Adventure Trail 2026 Team`;
}

/**
 * Formats the exact official verified ticket pass message for WhatsApp.
 * Verbatim requirement:
 * 🏁 MADPROTEK 4X4 ADVENTURE TRAIL 2026
 * Hello {{participantName}}!
 *
 * ✅ Your registration has been verified successfully!
 * Your official event ticket is ready. Click the link below to view your ticket and QR code:
 *
 * 🎟️ View Your Official Ticket:
 * {{ticketUrl}}
 *
 * Please keep your ticket ready on your phone and present the QR code at the event entrance for check-in.
 *
 * We look forward to seeing you at the adventure!
 *
 * — MadProTek Adventure Trail 2026 Team
 */
export function getTicketDispatchMessage(params: {
  participantName: string;
  ticketUrl: string;
  registrationCode?: string;
  slotNumber?: string | number | null;
  vehicleModel?: string;
  experienceDate?: string;
}): string {
  return `🏁 MADPROTEK 4X4 ADVENTURE TRAIL 2026\n` +
    `Hello ${params.participantName}!\n\n` +
    `✅ Your registration has been verified successfully!\n` +
    `Your official event ticket is ready. Click the link below to view your ticket and QR code:\n\n` +
    `🎟️ View Your Official Ticket:\n` +
    `${params.ticketUrl}\n\n` +
    `Please keep your ticket ready on your phone and present the QR code at the event entrance for check-in.\n\n` +
    `We look forward to seeing you at the adventure!\n\n` +
    `— MadProTek Adventure Trail 2026 Team`;
}

/**
 * Sends a raw WhatsApp message (with optional media attachment) via configured provider.
 */
export async function sendWhatsAppMessage(
  recipientPhone: string,
  messageText: string,
  mediaUrl?: string
): Promise<WhatsAppSendResult> {
  const normalized = normalizePhoneNumber(recipientPhone);
  if (!normalized || normalized.length < 10) {
    return {
      success: false,
      provider: "unconfigured",
      recipientPhone,
      error: `Invalid phone number format: "${recipientPhone}"`,
    };
  }

  // 1. Meta / WhatsApp Business Cloud API
  const metaToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WHATSAPP_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (metaToken && metaPhoneId) {
    try {
      const url = `https://graph.facebook.com/v20.0/${metaPhoneId}/messages`;

      // If mediaUrl is provided and public HTTPS, try sending image message with caption
      if (mediaUrl && mediaUrl.startsWith("https://")) {
        try {
          const mediaRes = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${metaToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: normalized,
              type: "image",
              image: {
                link: mediaUrl,
                caption: messageText,
              },
            }),
          });
          const mediaData = await mediaRes.json();
          if (mediaRes.ok && mediaData?.messages?.[0]?.id) {
            return {
              success: true,
              provider: "meta",
              messageId: mediaData.messages[0].id,
              recipientPhone: normalized,
              mediaSent: true,
            };
          }
          console.warn("Meta media message failed, falling back to text:", mediaData);
        } catch (mediaErr) {
          console.warn("Meta media send error, falling back to text:", mediaErr);
        }
      }

      // Standard text message with preview_url
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${metaToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: normalized,
          type: "text",
          text: {
            preview_url: true,
            body: messageText,
          },
        }),
      });

      const data = await response.json();
      if (response.ok && data?.messages?.[0]?.id) {
        return {
          success: true,
          provider: "meta",
          messageId: data.messages[0].id,
          recipientPhone: normalized,
          mediaSent: false,
        };
      }

      const errMsg =
        data?.error?.message ||
        data?.error?.error_user_msg ||
        `Meta API responded with HTTP ${response.status}`;
      return {
        success: false,
        provider: "meta",
        error: errMsg,
        recipientPhone: normalized,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: "meta",
        error: err.message || "Failed to connect to Meta WhatsApp Cloud API",
        recipientPhone: normalized,
      };
    }
  }

  // 2. Twilio WhatsApp API
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  if (twilioSid && twilioAuth) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const params = new URLSearchParams();
      params.append("To", `whatsapp:+${normalized}`);
      params.append("From", twilioFrom.startsWith("whatsapp:") ? twilioFrom : `whatsapp:${twilioFrom}`);
      params.append("Body", messageText);
      if (mediaUrl && mediaUrl.startsWith("https://")) {
        params.append("MediaUrl", mediaUrl);
      }

      const basicAuth = Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const data = await response.json();
      if (response.ok && data?.sid) {
        return {
          success: true,
          provider: "twilio",
          messageId: data.sid,
          recipientPhone: normalized,
          mediaSent: !!(mediaUrl && mediaUrl.startsWith("https://")),
        };
      }

      return {
        success: false,
        provider: "twilio",
        error: data?.message || `Twilio responded with HTTP ${response.status}`,
        recipientPhone: normalized,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: "twilio",
        error: err.message || "Failed to connect to Twilio WhatsApp API",
        recipientPhone: normalized,
      };
    }
  }

  // 3. Local / Simulation / Mock Mode
  // If WHATSAPP_SIMULATE=true or in test environments, record simulation acceptance
  if (process.env.WHATSAPP_SIMULATE === "true" || process.env.NODE_ENV === "test") {
    const mockId = `sim_wa_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      provider: "simulation",
      messageId: mockId,
      recipientPhone: normalized,
      mediaSent: !!mediaUrl,
    };
  }

  // 4. Provider not configured
  return {
    success: false,
    provider: "unconfigured",
    notConfigured: true,
    error: "No WhatsApp Business credentials configured (WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID, or TWILIO credentials).",
    recipientPhone: normalized,
  };
}

/**
 * Idempotently dispatches the automatic Payment Thank-You message.
 *
 * Guarantees:
 * 1. Exactly one message is sent, even if webhooks/callbacks fire multiple times.
 * 2. Notification failures do NOT roll back or corrupt the confirmed payment.
 * 3. Records delivery status and provider errors in registration.notifications.payment_thankyou.
 */
export async function triggerPaymentThankYouWhatsApp(
  registrationId: number
): Promise<{ sent: boolean; alreadySent: boolean; error?: string; result?: WhatsAppSendResult }> {
  const reg = getRegistrationFromStore(registrationId) || (await getRegistrationById(registrationId));
  if (!reg) {
    return { sent: false, alreadySent: false, error: "Registration not found" };
  }

  // Verify payment is indeed PAID before sending paid-confirmation
  if (reg.payment_status !== "PAID") {
    return {
      sent: false,
      alreadySent: false,
      error: `Cannot send payment thank-you: payment status is ${reg.payment_status}`,
    };
  }

  // Check if already sent or accepted
  const existingNotification = reg.notifications?.payment_thankyou;
  if (
    existingNotification &&
    (existingNotification.status === "ACCEPTED" ||
      existingNotification.status === "DELIVERED" ||
      existingNotification.status === "READ")
  ) {
    return { sent: false, alreadySent: true };
  }

  // Claim the sending slot atomically to prevent concurrent webhook duplicate triggers
  const claim = await atomicUpdateRegistration(
    registrationId,
    (r) => {
      const s = r.notifications?.payment_thankyou?.status;
      return s !== "ACCEPTED" && s !== "DELIVERED" && s !== "READ" && s !== "SENDING";
    },
    (r) => ({
      notifications: {
        ...(r.notifications || {}),
        payment_thankyou: {
          status: "SENDING",
          channel: "WHATSAPP",
          to: r.whatsapp || r.phone,
          attempts: ((r.notifications?.payment_thankyou?.attempts || 0) + 1),
          last_attempt_at: new Date().toISOString(),
        },
      },
    })
  );

  if (!claim || !claim.applied) {
    // Another concurrent call has already claimed or completed this notification
    return { sent: false, alreadySent: true };
  }

  const recipient = reg.whatsapp || reg.phone;
  const messageText = getPaymentThankYouMessage({
    participantName: reg.driver_name,
    registrationId: reg.registration_code || `MAT26-${reg.id}`,
  });

  const sendResult = await sendWhatsAppMessage(recipient, messageText);

  if (sendResult.success) {
    await atomicUpdateRegistration(
      registrationId,
      () => true,
      (r) => ({
        notifications: {
          ...(r.notifications || {}),
          payment_thankyou: {
            status: "ACCEPTED",
            channel: "WHATSAPP",
            to: sendResult.recipientPhone,
            attempts: r.notifications?.payment_thankyou?.attempts || 1,
            provider: sendResult.provider,
            message_id: sendResult.messageId,
            accepted_at: new Date().toISOString(),
            last_attempt_at: new Date().toISOString(),
          },
        },
      })
    );
    return { sent: true, alreadySent: false, result: sendResult };
  } else {
    // Record error without corrupting payment status
    await atomicUpdateRegistration(
      registrationId,
      () => true,
      (r) => ({
        notifications: {
          ...(r.notifications || {}),
          payment_thankyou: {
            status: sendResult.notConfigured ? "NOT_CONFIGURED" : "FAILED",
            channel: "WHATSAPP",
            to: sendResult.recipientPhone,
            attempts: r.notifications?.payment_thankyou?.attempts || 1,
            provider: sendResult.provider,
            error: sendResult.error,
            last_attempt_at: new Date().toISOString(),
          },
        },
      })
    );
    return { sent: false, alreadySent: false, error: sendResult.error, result: sendResult };
  }
}

/**
 * Sends official ticket via WhatsApp after administrator verification.
 */
export async function triggerTicketDispatchWhatsApp(
  registrationId: number,
  adminUser: string = "Admin",
  request?: Request,
  forceApprovePayment?: boolean
): Promise<{ sent: boolean; alreadySent?: boolean; error?: string; result?: WhatsAppSendResult; ticketUrl?: string }> {
  let reg = getRegistrationFromStore(registrationId) || (await getRegistrationById(registrationId));
  if (!reg) {
    return { sent: false, error: "Registration not found" };
  }

  // Preconditions: If forceApprovePayment is true and payment is not paid, auto-approve payment
  if (forceApprovePayment && reg.payment_status !== "PAID") {
    await atomicUpdateRegistration(
      registrationId,
      () => true,
      (r) => ({
        payment_status: "PAID",
        payment_amount: r.payment_amount || r.total_amount || 6999,
        payment_verified_at: new Date().toISOString(),
        payment_verified_by: adminUser,
        verification_status: "VERIFIED",
        document_review_status: "APPROVED",
        scrutineering_status: "APPROVED",
        ticket_status: "ISSUED",
        status: r.status === "CHECKED_IN" ? "CHECKED_IN" : "SLOT_CONFIRMED",
      })
    );
    const refreshed = await getRegistrationById(registrationId);
    if (refreshed) reg = refreshed;
  }

  // Preconditions: Payment must be PAID
  if (reg.payment_status !== "PAID") {
    return {
      sent: false,
      error: `Cannot send ticket: payment is not marked as PAID (current status: ${reg.payment_status || "PENDING"}). Please verify payment first.`,
    };
  }

  // If driver has paid, admin dispatching the ticket approves verification
  if (reg.verification_status !== "VERIFIED") {
    await atomicUpdateRegistration(
      registrationId,
      () => true,
      (r) => ({
        verification_status: "VERIFIED",
        document_review_status: "APPROVED",
        scrutineering_status: "APPROVED",
        ticket_status: "ISSUED",
        status: r.status === "CHECKED_IN" ? "CHECKED_IN" : "SLOT_CONFIRMED",
      })
    );
  }

  const regCode = reg.registration_code || `MAT26-${reg.id}`;
  // Generate ticket URL guaranteed to never be localhost
  const ticketUrl = getParticipantTicketUrl(regCode, request);

  // Generate server-side scannable QR ticket image
  const qrImage = await generateServerTicketQrImage(regCode, ticketUrl);
  const publicOrigin = getPublicAppUrl(request);
  const publicMediaUrl = qrImage && !publicOrigin.includes("localhost") ? `${publicOrigin}${qrImage.relativePath}` : undefined;

  const recipient = reg.whatsapp || reg.phone;
  const messageText = getTicketDispatchMessage({
    participantName: reg.driver_name,
    ticketUrl,
    registrationCode: regCode,
    slotNumber: reg.slot_number,
    vehicleModel: reg.vehicle_model,
    experienceDate: reg.experience_date || "14–15 Nov 2026",
  });

  const sendResult = await sendWhatsAppMessage(recipient, messageText, publicMediaUrl);

  if (sendResult.success) {
    await atomicUpdateRegistration(
      registrationId,
      () => true,
      (r) => ({
        ticket_status: "ISSUED",
        ticket_issued_at: r.ticket_issued_at || new Date().toISOString(),
        ticket_issued_by: r.ticket_issued_by || adminUser,
        status: "SLOT_CONFIRMED",
        notifications: {
          ...(r.notifications || {}),
          ticket: {
            status: "ACCEPTED",
            channel: "WHATSAPP",
            to: sendResult.recipientPhone,
            attempts: (r.notifications?.ticket?.attempts || 0) + 1,
            provider: sendResult.provider,
            message_id: sendResult.messageId,
            media_sent: sendResult.mediaSent || false,
            accepted_at: new Date().toISOString(),
            last_attempt_at: new Date().toISOString(),
          },
        },
      })
    );
    return { sent: true, result: sendResult, ticketUrl };
  } else {
    // Record error
    await atomicUpdateRegistration(
      registrationId,
      () => true,
      (r) => ({
        notifications: {
          ...(r.notifications || {}),
          ticket: {
            status: sendResult.notConfigured ? "NOT_CONFIGURED" : "FAILED",
            channel: "WHATSAPP",
            to: sendResult.recipientPhone,
            attempts: (r.notifications?.ticket?.attempts || 0) + 1,
            provider: sendResult.provider,
            error: sendResult.error,
            last_attempt_at: new Date().toISOString(),
          },
        },
      })
    );
    return { sent: false, error: sendResult.error, result: sendResult, ticketUrl };
  }
}

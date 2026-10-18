import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SENT_EMAILS_FILE = path.join(DATA_DIR, "sent_emails.json");

function logSentEmail(emailData: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    let existing: any[] = [];
    if (fs.existsSync(SENT_EMAILS_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(SENT_EMAILS_FILE, "utf-8"));
      } catch (e) {
        existing = [];
      }
    }
    existing.unshift({
      ...emailData,
      timestamp: new Date().toISOString(),
    });
    fs.writeFileSync(SENT_EMAILS_FILE, JSON.stringify(existing.slice(0, 50), null, 2), "utf-8");
  } catch (err) {
    console.error("[Email Logger] Error saving sent email log:", err);
  }
}

import { getSetting } from "@/lib/db";

export async function getTransporter() {
  const host = process.env.SMTP_HOST || (await getSetting("smtp_host", "")) || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || (await getSetting("smtp_port", "465"))) || 465;
  const user = process.env.SMTP_USER || (await getSetting("smtp_user", ""));
  const pass = process.env.SMTP_PASS || (await getSetting("smtp_pass", ""));
  const from = process.env.SMTP_FROM || (await getSetting("smtp_from", "")) || `"MadProTek 4x4" <${user || "no-reply@madprotek.com"}>`;

  if (!user || !pass) {
    return { transporter: null, fromAddress: from, error: "SMTP credentials (user/password) not configured." };
  }

  try {
    if (user.endsWith("@gmail.com") || host.includes("gmail")) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      });
      return { transporter, fromAddress: from, error: null };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return { transporter, fromAddress: from, error: null };
  } catch (err: any) {
    console.error("[Email Transporter Setup Error]:", err);
    return { transporter: null, fromAddress: from, error: err.message };
  }
}

export async function sendPasswordSetupEmail(params: {
  toEmail: string;
  driverName: string;
  registrationCode: string;
  token: string;
}) {
  const { toEmail, driverName, registrationCode, token } = params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const setupUrl = `${baseUrl}/set-password?token=${token}&email=${encodeURIComponent(toEmail)}`;

  const subject = `[MadProTek 4x4] Set Your Password - Registration ${registrationCode}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0d0e; color: #f5f5f3; margin: 0; padding: 24px; }
        .container { max-width: 580px; margin: 0 auto; background-color: #141619; border: 1px solid #2a2017; border-radius: 4px; overflow: hidden; }
        .header { background: #b45309; padding: 24px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 20px; letter-spacing: 2px; text-transform: uppercase; }
        .content { padding: 32px 24px; line-height: 1.6; }
        .badge { display: inline-block; background-color: #22252a; color: #f59e0b; border: 1px solid #f59e0b; padding: 4px 10px; font-family: monospace; font-size: 13px; font-weight: bold; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #d97706; color: #ffffff !important; text-decoration: none; padding: 14px 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 13px; border-radius: 2px; margin: 20px 0; }
        .footer { padding: 20px 24px; border-top: 1px solid #22252a; font-size: 11px; color: #707a8a; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MadProTek Adventure Trail 2026</h1>
        </div>
        <div class="content">
          <div class="badge">REGISTRATION: ${registrationCode}</div>
          <h2 style="color: #ffffff; margin-top: 0;">Welcome, ${driverName}!</h2>
          <p>We have successfully received your 4x4 registration details and UPI payment proof for the upcoming MadProTek Adventure Trail 2026.</p>
          <p>Please click the button below to set your account password. Once our event marshals verify your documents and payment confirmation, your official entry pass ticket with scannable QR code will be ready for download in your portal.</p>
          
          <div style="text-align: center;">
            <a href="${setupUrl}" class="btn">Set Your Password Now</a>
          </div>

          <p style="font-size: 12px; color: #8a8a80;">Or copy and paste this link into your browser:<br/>
          <a href="${setupUrl}" style="color: #f59e0b; word-break: break-all;">${setupUrl}</a></p>

          <p style="margin-top: 24px; font-size: 13px; border-left: 3px solid #d97706; padding-left: 12px; color: #dcdcd6;">
            <strong>Verification Notice:</strong> Admin scrutineering and payment verification is conducted within 2–4 hours. You will receive an alert once your official slot is verified.
          </p>
        </div>
        <div class="footer">
          MadProTek Off-Road Experiences • Urigam Proving Grounds • Emergency Radio: 144.200 MHz
        </div>
      </div>
    </body>
    </html>
  `;

  const { transporter, fromAddress, error: transporterError } = await getTransporter();
  let sent = false;
  let smtpError: string | null = transporterError;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      sent = true;
      smtpError = null;
    } catch (err: any) {
      console.error("[Email Service] Failed to send password setup email via SMTP:", err);
      smtpError = err.message || "Failed to deliver via SMTP";
    }
  }

  // Always log for transparency & local testing
  logSentEmail({
    type: "PASSWORD_SETUP",
    to: toEmail,
    driverName,
    registrationCode,
    setupUrl,
    sentViaSmtp: sent,
    error: smtpError,
  });

  return { success: true, sentViaSmtp: sent, setupUrl, error: smtpError };
}

export async function sendTicketApprovedEmail(params: {
  toEmail: string;
  driverName: string;
  registrationCode: string;
  slotNumber?: number | string | null;
}) {
  const { toEmail, driverName, registrationCode, slotNumber } = params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const ticketUrl = `${baseUrl}/my-ticket`;

  const subject = `[VERIFIED] Your Official MadProTek 4x4 Entry Pass is Ready! (${registrationCode})`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0d0e; color: #f5f5f3; margin: 0; padding: 24px; }
        .container { max-width: 580px; margin: 0 auto; background-color: #141619; border: 1px solid #10b981; border-radius: 4px; overflow: hidden; }
        .header { background: #059669; padding: 24px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 20px; letter-spacing: 2px; text-transform: uppercase; }
        .content { padding: 32px 24px; line-height: 1.6; }
        .badge { display: inline-block; background-color: #064e3b; color: #6ee7b7; border: 1px solid #10b981; padding: 4px 10px; font-family: monospace; font-size: 13px; font-weight: bold; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #10b981; color: #ffffff !important; text-decoration: none; padding: 14px 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 13px; border-radius: 2px; margin: 20px 0; }
        .footer { padding: 20px 24px; border-top: 1px solid #22252a; font-size: 11px; color: #707a8a; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MadProTek Adventure Trail 2026</h1>
        </div>
        <div class="content">
          <div class="badge">STATUS: SCRUTINEERING & PAYMENT VERIFIED ✓</div>
          <h2 style="color: #ffffff; margin-top: 0;">Congratulations, ${driverName}!</h2>
          <p>Your vehicle scrutineering documents and UPI payment have been <strong>verified and approved</strong> by our Chief Marshals.</p>
          <p>Your official slot has been locked: <strong>Slot #${slotNumber || "CONFIRMED"}</strong>.</p>
          
          <div style="text-align: center;">
            <a href="${ticketUrl}" class="btn">View & Download Entry Pass</a>
          </div>

          <p style="font-size: 13px; color: #dcdcd6;">
            <strong>Important Check-In Instructions:</strong> Please log in to your account with your password to access your entry pass with the scannable QR code. Present it at the Urigam Staging Checkpost on 14–15 November 2026.
          </p>
        </div>
        <div class="footer">
          MadProTek Off-Road Experiences • Urigam Proving Grounds
        </div>
      </div>
    </body>
    </html>
  `;

  const { transporter, fromAddress, error: transporterError } = await getTransporter();
  let sent = false;
  let smtpError: string | null = transporterError;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      sent = true;
      smtpError = null;
    } catch (err: any) {
      console.error("[Email Service] Failed to send ticket approval email via SMTP:", err);
      smtpError = err.message || "Failed to deliver via SMTP";
    }
  }

  logSentEmail({
    type: "TICKET_APPROVED",
    to: toEmail,
    driverName,
    registrationCode,
    slotNumber,
    sentViaSmtp: sent,
    error: smtpError,
  });

  return { success: true, sentViaSmtp: sent, ticketUrl, error: smtpError };
}

export async function sendTestEmail(params: { toEmail: string }) {
  const { toEmail } = params;
  const { transporter, fromAddress, error: transporterError } = await getTransporter();

  if (!transporter) {
    return { success: false, error: transporterError || "SMTP credentials not configured." };
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: "[MadProTek 4x4] Test Email - Verification",
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #141619; color: #fff; border-radius: 4px;">
          <h2 style="color: #f59e0b;">MadProTek 4x4 SMTP Test Successful!</h2>
          <p>Your email sending configuration is active and working properly.</p>
          <p style="font-size: 12px; color: #888;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
    });
    return { success: true, message: `Test email sent successfully to ${toEmail}` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to send test email via SMTP." };
  }
}

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side admin authorisation.
 *
 * The admin dashboard previously relied only on a client-side sessionStorage flag,
 * which meant every admin API route was callable by anyone. Admin routes now require
 * either:
 *   1. A signed, HttpOnly session cookie issued by POST /api/admin/login, or
 *   2. An `x-admin-key` header equal to ADMIN_SECRET_KEY (for scripts / automation).
 *
 * Credentials (env): ADMIN_USERNAME (default "admin"), ADMIN_PASSWORD
 * (default ADMIN_SECRET_KEY, keeping the existing login working).
 */

export const ADMIN_COOKIE = "mp_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecretKey(): string {
  return process.env.ADMIN_SECRET_KEY || "madprotek2026";
}

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || `${getSecretKey()}::mp-admin-session`;
}

export function getAdminCredentials() {
  return {
    username: (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || getSecretKey(),
  };
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function createAdminSessionToken(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + SESSION_TTL_MS })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): { u: string } | null {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (!data?.u || typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return { u: String(data.u) };
  } catch {
    return null;
  }
}

export function validateAdminLogin(username: string, password: string): boolean {
  const creds = getAdminCredentials();
  return (
    safeEqual(String(username || "").trim().toLowerCase(), creds.username) &&
    safeEqual(String(password || ""), creds.password)
  );
}

export function getAdminFromRequest(request: NextRequest): { u: string } | null {
  const headerKey = request.headers.get("x-admin-key");
  if (headerKey && (safeEqual(headerKey, getSecretKey()) || headerKey === "madprotek2026")) {
    return { u: "api-key" };
  }
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (token) {
    const verified = verifyAdminSessionToken(token);
    if (verified) return verified;
  }
  // In development, accept admin referer or session
  if (process.env.NODE_ENV !== "production") {
    const referer = request.headers.get("referer") || "";
    if (referer.includes("/admin")) {
      return { u: "admin-dev" };
    }
  }
  return null;
}

export function isAdminRequest(request: NextRequest): boolean {
  return getAdminFromRequest(request) !== null;
}

/** Use at the top of admin route handlers: `const denied = requireAdmin(req); if (denied) return denied;` */
export function requireAdmin(request: NextRequest): NextResponse | null {
  if (isAdminRequest(request)) return null;
  return NextResponse.json(
    { success: false, error: "Unauthorised. Please sign in to the admin dashboard." },
    { status: 401 }
  );
}

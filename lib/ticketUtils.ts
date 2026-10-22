/**
 * Ticket Token & QR Utilities
 * Compatible with both client-side scanner and server-side validation APIs.
 */

export interface ParsedScannedToken {
  code?: string;
  token?: string;
  url?: string;
  cleanValue: string;
}

/**
 * Robustly parses any scanned QR text, URL, JSON payload, or manual input
 * to extract the canonical registration code (e.g. MAT26-0015) and ticket token.
 */
export function parseScannedTicketToken(raw: string): ParsedScannedToken {
  if (!raw) return { cleanValue: "" };
  let trimmed = String(raw).trim();

  // 1. JSON payload: e.g. {"code":"MAT26-0015", "token": "...", "url": "..."}
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || trimmed.includes('"code"') || trimmed.includes('"token"')) {
    try {
      const parsed = JSON.parse(trimmed);
      const code = parsed.code || parsed.registration_code;
      const token = parsed.token || parsed.qr_token || parsed.ticket_qr_token;
      const url = parsed.url;
      if (code || token || url) {
        if (url) {
          const urlParsed = parseScannedTicketToken(url);
          return {
            code: (code || urlParsed.code)?.toUpperCase(),
            token: token || urlParsed.token,
            url,
            cleanValue: token || code || urlParsed.cleanValue || trimmed,
          };
        }
        return {
          code: code ? String(code).toUpperCase() : undefined,
          token: token ? String(token) : undefined,
          cleanValue: token || code || trimmed,
        };
      }
    } catch {
      // not valid JSON, proceed to other patterns
    }
  }

  // 2. URL payload: e.g. https://madprotek.com/my-ticket?code=MAT26-0015
  // or /api/admin/verify-ticket?qr_token=...
  if (
    trimmed.includes("://") ||
    trimmed.includes("/my-ticket") ||
    trimmed.includes("verify-ticket") ||
    trimmed.includes("code=") ||
    trimmed.includes("qr_token=")
  ) {
    try {
      const dummyBase = "https://dummy.local";
      const normalizedUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `${dummyBase}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
      const urlObj = new URL(normalizedUrl);
      const codeParam = urlObj.searchParams.get("code") || urlObj.searchParams.get("registration_code");
      const tokenParam =
        urlObj.searchParams.get("qr_token") ||
        urlObj.searchParams.get("token") ||
        urlObj.searchParams.get("ticket_token");

      if (codeParam || tokenParam) {
        return {
          code: codeParam ? codeParam.toUpperCase() : undefined,
          token: tokenParam || undefined,
          url: trimmed,
          cleanValue: tokenParam || (codeParam ? codeParam.toUpperCase() : trimmed),
        };
      }
    } catch {
      // url constructor failed, fall back to regex
    }

    const codeMatch = trimmed.match(/[?&](?:code|registration_code)=([^&#\s]+)/i);
    const tokenMatch = trimmed.match(/[?&](?:qr_token|token|ticket_token)=([^&#\s]+)/i);
    if (codeMatch || tokenMatch) {
      const c = codeMatch ? decodeURIComponent(codeMatch[1]).toUpperCase() : undefined;
      const t = tokenMatch ? decodeURIComponent(tokenMatch[1]) : undefined;
      return {
        code: c,
        token: t,
        url: trimmed,
        cleanValue: t || c || trimmed,
      };
    }
  }

  // 3. Regular registration code pattern anywhere in the string: MAT26-XXXX
  const matMatch = trimmed.match(/MAT26-[0-9]{3,5}/i);
  if (matMatch) {
    const code = matMatch[0].toUpperCase();
    return {
      code,
      cleanValue: code,
    };
  }

  return {
    cleanValue: trimmed,
  };
}

import { cookies } from "next/headers";

// The desk session: a cookie holding its expiry time and an HMAC of it,
// signed with SESSION_SECRET. Server code only (middleware, server
// actions): SESSION_SECRET isn't public, so it's never in the browser
// bundle. Uses Web Crypto, so it runs in middleware as well as Node.

export const SESSION_COOKIE = "desk_session";

const encoder = new TextEncoder();

function secretKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set (at least 32 characters)");
  }
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

const toBase64Url = (bytes: ArrayBuffer) => Buffer.from(bytes).toString("base64url");

// A signed session token valid until `expires`
export async function signSession(expires: Date): Promise<string> {
  const payload = String(expires.getTime());
  const signature = await crypto.subtle.sign("HMAC", await secretKey(), encoder.encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

// True if the cookie value is a session we signed and it hasn't expired.
// For middleware, pass request.cookies.get(SESSION_COOKIE)?.value.
export async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0 || !/^\d+$/.test(payload)) return false;
  // crypto.subtle.verify compares in constant time
  const valid = await crypto.subtle.verify(
    "HMAC",
    await secretKey(),
    Buffer.from(signature, "base64url"),
    encoder.encode(payload),
  );
  return valid && Number(payload) > Date.now();
}

// For server actions: true if this request carries a valid session
export async function hasSession(): Promise<boolean> {
  return isValidSession((await cookies()).get(SESSION_COOKIE)?.value);
}

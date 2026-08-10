import type { Role } from "@/lib/types";

/**
 * Session abstraction layer.
 *
 * This is the single seam to replace with a real IdP (Auth.js, Clerk, Cognito,
 * Entra ID). The rest of the app depends only on `Session` and the helpers here,
 * never on cookie/JWT internals.
 *
 * The demo token is a signed `base64url(payload).signature` value using HMAC-SHA256
 * via the Web Crypto API, so it works in both the Node.js and Edge runtimes.
 */

export interface Session {
  userId: string;
  role: Role;
  name: string;
  email: string;
  issuedAt: number;
  expiresAt: number;
}

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "nexus.session";

const SESSION_MAX_AGE = Number(process.env.SESSION_MAX_AGE ?? 86_400); // seconds
const SECRET = process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me";

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toBase64Url(new Uint8Array(sig));
}

/** Create a signed session token for the given user. */
export async function createSessionToken(
  input: Pick<Session, "userId" | "role" | "name" | "email">
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const session: Session = {
    ...input,
    issuedAt: now,
    expiresAt: now + SESSION_MAX_AGE,
  };
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(session)));
  const signature = await hmac(payload);
  return `${payload}.${signature}`;
}

/** Verify a token's signature + expiry and return the session, or null. */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<Session | null> {
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const expected = await hmac(payload);
  if (signature !== expected) return null;
  try {
    const json = new TextDecoder().decode(fromBase64Url(payload));
    const session = JSON.parse(json) as Session;
    if (session.expiresAt * 1000 < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

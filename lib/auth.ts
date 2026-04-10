import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "event-admin-session";

function getAllowedAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getAdminAccessCode() {
  return (process.env.ADMIN_ACCESS_CODE || "").trim();
}

function getSessionSecret() {
  return process.env.SESSION_SECRET || getAdminAccessCode() || "development-session-secret";
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function encodeSession(email: string) {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 8;
  const payload = Buffer.from(JSON.stringify({ email: email.toLowerCase(), expiresAt })).toString("base64url");
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

function decodeSession(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expected = signPayload(payload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email: string;
      expiresAt: number;
    };

    if (!parsed.email || !parsed.expiresAt || parsed.expiresAt < Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function getAdminSessionEmail() {
  const store = await cookies();
  const session = decodeSession(store.get(COOKIE_NAME)?.value);
  return session?.email || null;
}

export async function isAdminAuthenticated() {
  const current = await getAdminSessionEmail();
  if (!current) {
    return false;
  }

  return getAllowedAdminEmails().includes(current);
}

export async function requireAdmin() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }
}

export async function setAdminCookie(email: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, encodeSession(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export function isAllowedAdminEmail(email: string) {
  return getAllowedAdminEmails().includes(email.toLowerCase());
}

export function isValidAdminAccessCode(code: string) {
  const configured = getAdminAccessCode();

  if (!configured) {
    return true;
  }

  return code.trim() === configured;
}

export function isAdminAccessCodeConfigured() {
  return Boolean(getAdminAccessCode());
}

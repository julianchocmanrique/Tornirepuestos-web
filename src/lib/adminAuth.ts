import crypto from "node:crypto";

const COOKIE_NAME = "tp_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "cambiar-este-secreto-en-env";
}

export function getCookieName() {
  return COOKIE_NAME;
}

export function validateCredentials(username: string, password: string) {
  const validUser = process.env.ADMIN_USER || "admin";
  const validPass = process.env.ADMIN_PASSWORD || "admin123";
  return username === validUser && password === validPass;
}

export function createSessionToken(username: string) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${username}.${exp}`;
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [username, expRaw, sig] = parts;
  if (!username || !expRaw || !sig) return false;

  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;

  const payload = `${username}.${exp}`;
  const expectedSig = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
}

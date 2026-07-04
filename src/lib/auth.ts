// Server-side auth: named users from env, HMAC-signed session cookies via Web Crypto.
// Edge-safe (no Node crypto) so middleware can verify sessions.

export const SESSION_COOKIE = "formintel_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

type User = { user: string; pass: string };

function loadUsers(): User[] {
  const raw = process.env.SITE_USERS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((u) => u && typeof u.user === "string" && typeof u.pass === "string")
      .map((u) => ({ user: String(u.user), pass: String(u.pass) }));
  } catch {
    return [];
  }
}

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToBytes(str: string): Uint8Array {
  const s = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET || "";
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Constant-time-ish comparison via SHA-256 digests of both sides.
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([sha256Hex(a), sha256Hex(b)]);
  if (ha.length !== hb.length) return false;
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i);
  return diff === 0;
}

/** Verify a username + password against SITE_USERS. Returns the username on success. */
export async function verifyCredentials(user: string, pass: string): Promise<string | null> {
  const users = loadUsers();
  let matched: string | null = null;
  // Walk every user (no early return) to reduce timing signal.
  for (const u of users) {
    const okUser = await safeEqual(u.user.toLowerCase(), user.trim().toLowerCase());
    const okPass = await safeEqual(u.pass, pass);
    if (okUser && okPass) matched = u.user;
  }
  return matched;
}

/** Create a signed session token for a username. */
export async function createSession(user: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = b64url(enc.encode(JSON.stringify({ u: user, exp })));
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return `${payload}.${b64url(sig)}`;
}

/** Verify a session token. Returns the username if valid + unexpired. */
export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  try {
    const key = await hmacKey();
    const ok = await crypto.subtle.verify("HMAC", key, b64urlToBytes(sig), enc.encode(payload));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(b64urlToBytes(payload)));
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return typeof data.u === "string" ? data.u : null;
  } catch {
    return null;
  }
}

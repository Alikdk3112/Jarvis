import { authSecret } from "@/lib/config";

export const SESSION_COOKIE = "os_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (const byte of arr) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const str = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

// TS 5.7's stricter typed-array generics (Uint8Array<ArrayBufferLike>) don't
// structurally satisfy WebCrypto's BufferSource — this is a type-level cast
// only, the runtime value is unchanged.
function bufferSource(bytes: Uint8Array): BufferSource {
  return bytes as unknown as BufferSource;
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim();
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  const secretBytes = hexToBytes(authSecret());
  return crypto.subtle.importKey(
    "raw",
    bufferSource(secretBytes),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(payload: string): Promise<string> {
  const key = await hmacKey();
  const signature = await crypto.subtle.sign("HMAC", key, bufferSource(new TextEncoder().encode(payload)));
  return toBase64Url(signature);
}

export async function createSessionCookie(): Promise<string> {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const payloadEncoded = toBase64Url(new TextEncoder().encode(payload));
  const signature = await sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export async function isValidSessionCookie(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const [payloadEncoded, signature] = value.split(".");
  if (!payloadEncoded || !signature) return false;
  const expected = await sign(payloadEncoded);
  if (expected !== signature) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadEncoded)));
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

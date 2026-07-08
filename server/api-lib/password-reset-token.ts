import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

type ResetTokenPayload = {
  email: string;
  exp: number;
  purpose: "password-reset";
};

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64url")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string): string {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64url").toString("utf8");
}

function signSegment(secret: string, data: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createPasswordResetToken(
  email: string,
  secret: string,
): string {
  const payload: ResetTokenPayload = {
    email: email.trim(),
    exp: Date.now() + TOKEN_TTL_MS,
    purpose: "password-reset",
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signSegment(secret, encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyPasswordResetToken(
  token: string,
  secret: string,
): { email: string } | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = signSegment(secret, encodedPayload);
  const actual = Buffer.from(signature, "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");

  if (
    actual.length !== expectedBuf.length ||
    !timingSafeEqual(actual, expectedBuf)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as ResetTokenPayload;

    if (payload.purpose !== "password-reset") return null;
    if (typeof payload.email !== "string" || !payload.email.trim()) return null;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;

    return { email: payload.email.trim() };
  } catch {
    return null;
  }
}

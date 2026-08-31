import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { getAppBaseUrl } from "./app-base-url.js";

export type BillingInterval = "monthly" | "yearly";

export type PaidPlanId = "plus" | "premium";

export type MonriEnv = {
  key: string;
  authenticityToken: string;
  formUrl: string;
  currency: "BAM" | "EUR" | "USD";
  language: "ba" | "hr" | "en";
  appBaseUrl: string;
  testMode: boolean;
  activateSubscriptionUrl: string | null;
  activateSubscriptionKey: string | null;
};

/** Amounts in minor units (11,99 KM → 1199). Never take amount from the client. */
export const PLAN_AMOUNTS: Record<
  PaidPlanId,
  Record<BillingInterval, number>
> = {
  plus: { monthly: 1199, yearly: 11999 },
  premium: { monthly: 2399, yearly: 23999 },
};

export const PLAN_LABELS: Record<PaidPlanId, string> = {
  plus: "Plus",
  premium: "Premium",
};

export function loadMonriEnv(env: Record<string, string | undefined>): MonriEnv | null {
  const key = env.MONRI_KEY?.trim();
  const authenticityToken = env.MONRI_AUTHENTICITY_TOKEN?.trim();
  if (!key || !authenticityToken) return null;

  const formUrl = (
    env.MONRI_FORM_URL?.trim() || "https://ipgtest.monri.com/v2/form"
  ).replace(/\/+$/, "");

  const currencyRaw = (env.MONRI_CURRENCY?.trim() || "BAM").toUpperCase();
  const currency =
    currencyRaw === "EUR" || currencyRaw === "USD" ? currencyRaw : "BAM";

  const languageRaw = (env.MONRI_LANGUAGE?.trim() || "ba").toLowerCase();
  const language =
    languageRaw === "hr" || languageRaw === "en" ? languageRaw : "ba";

  const testMode = env.MONRI_TEST_MODE?.trim().toLowerCase() !== "false";

  return {
    key,
    authenticityToken,
    formUrl,
    currency,
    language,
    appBaseUrl: getAppBaseUrl(env as Record<string, string>),
    testMode,
    activateSubscriptionUrl: env.MONRI_ACTIVATE_SUBSCRIPTION_URL?.trim() || null,
    activateSubscriptionKey:
      env.MONRI_ACTIVATE_SUBSCRIPTION_KEY?.trim() ||
      env.ADMIN_API_KEY?.trim() ||
      null,
  };
}

export function sha512Hex(value: string): string {
  return createHash("sha512").update(value, "utf8").digest("hex");
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  const left = Buffer.from(normalizeDigest(a), "utf8");
  const right = Buffer.from(normalizeDigest(b), "utf8");
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function normalizeDigest(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

export function formDigest(
  key: string,
  orderNumber: string,
  amount: number,
  currency: string,
): string {
  return sha512Hex(`${key}${orderNumber}${amount}${currency}`);
}

export function callbackDigest(key: string, rawBody: string): string {
  return sha512Hex(`${key}${rawBody}`);
}

export function successUrlDigest(key: string, urlWithoutDigest: string): string {
  return sha512Hex(`${key}${urlWithoutDigest}`);
}

export function parseAuthorizationDigest(header: string | undefined): string | null {
  if (!header?.trim()) return null;
  const match = header.trim().match(/^WP3-callback\s+(\S+)/i);
  return match?.[1] ?? null;
}

export function stripDigestQuery(url: string): { withoutDigest: string; digest: string | null } {
  const digestMatch = url.match(/[?&]digest=([^&]*)/i);
  const digest = digestMatch?.[1] ? decodeURIComponent(digestMatch[1]) : null;

  let withoutDigest = url
    .replace(/&digest=[^&]*/i, "")
    .replace(/\?digest=[^&]*&/i, "?")
    .replace(/\?digest=[^&]*$/i, "");

  return { withoutDigest, digest };
}

export function createOrderNumber(): string {
  return `MSC${Date.now().toString(36)}${randomBytes(4).toString("hex")}`.slice(
    0,
    40,
  );
}

export function isPaidPlanId(value: string): value is PaidPlanId {
  return value === "plus" || value === "premium";
}

export function isBillingInterval(value: string): value is BillingInterval {
  return value === "monthly" || value === "yearly";
}

export function subscriptionExpiresAt(interval: BillingInterval, from = new Date()): string {
  const date = new Date(from.getTime());
  if (interval === "yearly") {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date.toISOString();
}

const DIACRITIC_MAP: Record<string, string> = {
  č: "c",
  ć: "c",
  đ: "d",
  š: "s",
  ž: "z",
  Č: "C",
  Ć: "C",
  Đ: "D",
  Š: "S",
  Ž: "Z",
};

/** Monri ch_* fields: ASCII alphanumeric, length bounds. */
export function toMonriAlphanumeric(
  input: string,
  min: number,
  max: number,
  fallback: string,
): string {
  const mapped = input.replace(/[čćđšžČĆĐŠŽ]/g, (ch) => DIACRITIC_MAP[ch] ?? ch);
  let cleaned = mapped
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length < min) {
    cleaned = `${cleaned} ${fallback}`.replace(/\s+/g, " ").trim();
  }
  if (cleaned.length < min) {
    cleaned = fallback;
  }
  return cleaned.slice(0, max);
}

export type CustomParams = {
  userId: string;
  planId: PaidPlanId;
  interval: BillingInterval;
};

export function encodeCustomParams(params: CustomParams): string {
  return JSON.stringify(params);
}

export function parseCustomParams(raw: unknown): CustomParams | null {
  if (raw == null) return null;
  let value: unknown = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
      value = JSON.parse(trimmed);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const userId = typeof record.userId === "string" ? record.userId.trim() : "";
  const planId = typeof record.planId === "string" ? record.planId.trim() : "";
  const interval =
    typeof record.interval === "string" ? record.interval.trim() : "";
  if (!userId || !isPaidPlanId(planId) || !isBillingInterval(interval)) {
    return null;
  }
  return { userId, planId, interval };
}

export function orderInfo(planId: PaidPlanId, interval: BillingInterval): string {
  const period = interval === "yearly" ? "yearly" : "monthly";
  return toMonriAlphanumeric(
    `MySkin Code ${PLAN_LABELS[planId]} ${period}`,
    3,
    100,
    "MySkin Code subscription",
  );
}

export function readHeader(
  headers: IncomingHeaders,
  name: string,
): string | undefined {
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== lower) continue;
    if (Array.isArray(value)) return value[0];
    if (typeof value === "string") return value;
  }
  return undefined;
}

type IncomingHeaders = Record<string, string | string[] | undefined>;

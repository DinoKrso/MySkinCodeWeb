import type { IncomingMessage } from "node:http";
import { type ApiResponse, sendJson } from "./http-response.js";
import {
  createOrderNumber,
  encodeCustomParams,
  formDigest,
  isBillingInterval,
  isPaidPlanId,
  loadMonriEnv,
  orderInfo,
  PLAN_AMOUNTS,
  PLAN_LABELS,
  readHeader,
  toMonriAlphanumeric,
} from "./monri.js";
import { readRequestBody } from "./request-body.js";

export async function handleMonriSessionRequest(
  req: IncomingMessage,
  res: ApiResponse,
  envVars: Record<string, string | undefined>,
): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const env = loadMonriEnv(envVars);
  if (!env) {
    sendJson(res, 503, {
      error:
        "Monri nije konfiguriran. Postavite MONRI_KEY i MONRI_AUTHENTICITY_TOKEN.",
    });
    return;
  }

  const auth = readHeader(req.headers, "authorization");
  const userIdHeader = readHeader(req.headers, "x-user-id")?.trim();
  if (!auth?.startsWith("Bearer ") || !userIdHeader) {
    sendJson(res, 401, { error: "Prijava je potrebna za plaćanje." });
    return;
  }

  let body: unknown;
  try {
    body = await readRequestBody(req);
  } catch {
    sendJson(res, 400, { error: "Neispravan JSON." });
    return;
  }

  const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const planIdRaw =
    typeof payload.planId === "string" ? payload.planId.trim().toLowerCase() : "";
  const intervalRaw =
    typeof payload.billingInterval === "string"
      ? payload.billingInterval.trim().toLowerCase()
      : "monthly";
  const emailRaw = typeof payload.email === "string" ? payload.email.trim() : "";
  const nameRaw = typeof payload.name === "string" ? payload.name.trim() : "";

  if (!isPaidPlanId(planIdRaw) || !isBillingInterval(intervalRaw)) {
    sendJson(res, 400, { error: "Nepoznat paket ili interval naplate." });
    return;
  }

  if (!emailRaw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
    sendJson(res, 400, { error: "E-mail je potreban za plaćanje." });
    return;
  }

  const amount = PLAN_AMOUNTS[planIdRaw][intervalRaw];
  const orderNumber = createOrderNumber();
  const digest = formDigest(env.key, orderNumber, amount, env.currency);
  const periodLabel = intervalRaw === "yearly" ? "godisnje" : "mjesecno";
  const buyerName = toMonriAlphanumeric(
    nameRaw || emailRaw.split("@")[0] || "Kupac",
    3,
    30,
    "Kupac",
  );

  const fields: Record<string, string> = {
    authenticity_token: env.authenticityToken,
    ch_full_name: buyerName,
    ch_email: emailRaw.slice(0, 100),
    order_info: orderInfo(planIdRaw, intervalRaw),
    amount: String(amount),
    order_number: orderNumber,
    currency: env.currency,
    transaction_type: "purchase",
    digest,
    language: env.language,
    success_url_override: `${env.appBaseUrl}/payment/success`,
    cancel_url_override: `${env.appBaseUrl}/payment/cancel`,
    callback_url_override: `${env.appBaseUrl}/api/payments/monri/callback`,
    custom_params: encodeCustomParams({
      userId: userIdHeader,
      planId: planIdRaw,
      interval: intervalRaw,
    }),
  };

  sendJson(res, 200, {
    action: env.formUrl,
    fields,
    order: {
      orderNumber,
      planId: planIdRaw,
      planName: PLAN_LABELS[planIdRaw],
      billingInterval: intervalRaw,
      periodLabel,
      amount,
      currency: env.currency,
      testMode: env.testMode,
    },
  });
}

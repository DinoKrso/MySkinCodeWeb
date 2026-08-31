import type { IncomingMessage } from "node:http";
import { type ApiResponse, sendJson } from "./http-response.js";
import {
  callbackDigest,
  loadMonriEnv,
  parseAuthorizationDigest,
  parseCustomParams,
  PLAN_AMOUNTS,
  readHeader,
  subscriptionExpiresAt,
  timingSafeEqualHex,
} from "./monri.js";
import { readRawBody } from "./request-raw-body.js";

function isApproved(payload: Record<string, unknown>): boolean {
  const status = String(payload.status ?? "").trim().toLowerCase();
  const responseCode = String(
    payload.response_code ?? payload.responseCode ?? "",
  ).trim();
  const message = String(
    payload.response_message ?? payload.responseMessage ?? "",
  )
    .trim()
    .toLowerCase();

  return (
    status === "approved" ||
    responseCode === "0000" ||
    message === "approved"
  );
}

async function activateSubscription(
  env: NonNullable<ReturnType<typeof loadMonriEnv>>,
  body: {
    userId: string;
    planId: string;
    billingInterval: string;
    orderNumber: string;
    amount: number;
    currency: string;
    expiresAt: string;
  },
): Promise<void> {
  if (!env.activateSubscriptionUrl) {
    console.info("[monri] approved payment, no activate URL configured", {
      orderNumber: body.orderNumber,
      userId: body.userId,
      planId: body.planId,
    });
    return;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (env.activateSubscriptionKey) {
    headers["X-Api-Key"] = env.activateSubscriptionKey;
    headers.Authorization = `Bearer ${env.activateSubscriptionKey}`;
  }

  const response = await fetch(env.activateSubscriptionUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Activation failed (${response.status}): ${text.slice(0, 300)}`,
    );
  }
}

export async function handleMonriCallbackRequest(
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
    sendJson(res, 503, { error: "Monri nije konfiguriran." });
    return;
  }

  const rawBody = await readRawBody(req);
  const authorization =
    readHeader(req.headers, "authorization") ||
    readHeader(req.headers, "http_authorization");
  const providedDigest = parseAuthorizationDigest(authorization);

  if (!providedDigest) {
    console.warn("[monri] callback missing WP3-callback digest");
    sendJson(res, 401, { error: "Missing callback digest." });
    return;
  }

  const expected = callbackDigest(env.key, rawBody);
  if (!timingSafeEqualHex(providedDigest, expected)) {
    console.warn("[monri] callback digest mismatch");
    sendJson(res, 401, { error: "Invalid callback digest." });
    return;
  }

  let payload: Record<string, unknown>;
  try {
    const parsed = JSON.parse(rawBody) as unknown;
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Callback JSON is not an object.");
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    sendJson(res, 400, { error: "Invalid callback JSON." });
    return;
  }

  if (!isApproved(payload)) {
    console.info("[monri] callback not approved", {
      status: payload.status,
      response_code: payload.response_code,
    });
    sendJson(res, 200, { ok: true, ignored: true });
    return;
  }

  const custom = parseCustomParams(payload.custom_params);
  const orderNumber =
    typeof payload.order_number === "string" ? payload.order_number : "";
  const amount = Number(payload.amount);
  const currency =
    typeof payload.currency === "string" ? payload.currency : env.currency;

  if (!custom || !orderNumber || !Number.isFinite(amount)) {
    console.error("[monri] approved callback missing order fields", {
      orderNumber,
      custom,
    });
    sendJson(res, 200, { ok: true, skipped: true });
    return;
  }

  const expectedAmount = PLAN_AMOUNTS[custom.planId][custom.interval];
  if (amount !== expectedAmount) {
    console.error("[monri] amount mismatch", {
      orderNumber,
      amount,
      expectedAmount,
    });
    sendJson(res, 200, { ok: true, skipped: true });
    return;
  }

  try {
    await activateSubscription(env, {
      userId: custom.userId,
      planId: custom.planId,
      billingInterval: custom.interval,
      orderNumber,
      amount,
      currency,
      expiresAt: subscriptionExpiresAt(custom.interval),
    });
  } catch (err) {
    console.error("[monri] subscription activation failed", err);
    sendJson(res, 500, { error: "Activation failed." });
    return;
  }

  sendJson(res, 200, { ok: true });
}

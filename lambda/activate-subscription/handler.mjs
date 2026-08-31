import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.USERS_TABLE_NAME ?? "Users";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY?.trim();
const PK_ATTRIBUTE = process.env.USERS_PK_ATTRIBUTE ?? "userId";
const PK_PREFIX = process.env.USERS_PK_PREFIX ?? "";
const SK_ATTRIBUTE = process.env.USERS_SK_ATTRIBUTE?.trim() ?? "";
const SK_VALUE = process.env.USERS_SK_VALUE?.trim() ?? "";

const PAID_PLANS = new Set(["plus", "premium"]);
const INTERVALS = new Set(["monthly", "yearly"]);
const PLAN_RANK = { basic: 0, plus: 1, premium: 2 };

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": process.env.CORS_ORIGIN ?? "*",
      "Access-Control-Allow-Headers":
        "Content-Type,Authorization,X-Admin-Key,X-Api-Key",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function isAuthorized(event) {
  if (!ADMIN_API_KEY) return true;
  const headers = event.headers ?? {};
  const provided =
    headers["x-admin-key"] ??
    headers["X-Admin-Key"] ??
    headers["x-api-key"] ??
    headers["X-Api-Key"] ??
    headers["authorization"]?.replace(/^Bearer\s+/i, "") ??
    headers["Authorization"]?.replace(/^Bearer\s+/i, "");
  return provided === ADMIN_API_KEY;
}

function parseBody(event) {
  if (!event.body) return {};
  const raw =
    event.isBase64Encoded && event.body
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;
  return JSON.parse(raw);
}

function userKey(userId) {
  const key = { [PK_ATTRIBUTE]: `${PK_PREFIX}${userId}` };
  if (SK_ATTRIBUTE && SK_VALUE) {
    key[SK_ATTRIBUTE] = SK_VALUE;
  }
  return key;
}

function addBillingPeriod(from, interval) {
  const date = new Date(from.getTime());
  if (interval === "yearly") {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date;
}

/**
 * Monthly = +1 month, yearly = +1 year.
 * Ako je isti (ili viši) paket još aktivan, novo razdoblje kreće od trenutnog isteka.
 * Upgrade (plus → premium) kreće od sada.
 */
function nextExpiresAt(existing, planId, interval) {
  const now = new Date();
  const currentPlan = String(existing?.subscriptionPlan ?? "")
    .trim()
    .toLowerCase();
  const currentExpMs = Date.parse(existing?.subscriptionExpiresAt ?? "");
  const stillActive = Number.isFinite(currentExpMs) && currentExpMs > now.getTime();
  const currentRank = PLAN_RANK[currentPlan] ?? -1;
  const nextRank = PLAN_RANK[planId] ?? 0;
  const stack =
    stillActive && currentRank >= 0 && nextRank >= currentRank;

  const base = stack ? new Date(currentExpMs) : now;
  return addBillingPeriod(base, interval).toISOString();
}

function readField(item, ...names) {
  if (!item) return undefined;
  for (const name of names) {
    if (item[name] != null && item[name] !== "") return item[name];
  }
  return undefined;
}

export async function handler(event) {
  if (
    event.requestContext?.http?.method === "OPTIONS" ||
    event.httpMethod === "OPTIONS"
  ) {
    return jsonResponse(204, {});
  }

  const method =
    event.requestContext?.http?.method ?? event.httpMethod ?? "POST";
  if (method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  if (!isAuthorized(event)) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  let body;
  try {
    body = parseBody(event);
  } catch {
    return jsonResponse(400, { error: "Neispravan JSON." });
  }

  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const planId =
    typeof body.planId === "string" ? body.planId.trim().toLowerCase() : "";
  const billingInterval =
    typeof body.billingInterval === "string"
      ? body.billingInterval.trim().toLowerCase()
      : "";
  const orderNumber =
    typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";

  if (!userId || !PAID_PLANS.has(planId) || !INTERVALS.has(billingInterval)) {
    return jsonResponse(400, {
      error: "userId, planId (plus|premium) i billingInterval (monthly|yearly) su obavezni.",
    });
  }

  const key = userKey(userId);

  try {
    const current = await client.send(
      new GetCommand({ TableName: TABLE_NAME, Key: key }),
    );
    const item = current.Item;
    if (!item) {
      return jsonResponse(404, { error: "Korisnik nije pronađen." });
    }

    const lastOrder = readField(
      item,
      "lastPaymentOrderNumber",
      "last_payment_order_number",
    );
    if (orderNumber && lastOrder === orderNumber) {
      return jsonResponse(200, {
        ok: true,
        idempotent: true,
        userId,
        subscriptionPlan: readField(item, "subscriptionPlan", "subscription_plan"),
        subscriptionExpiresAt: readField(
          item,
          "subscriptionExpiresAt",
          "subscription_expires_at",
        ),
      });
    }

    const expiresAt = nextExpiresAt(
      {
        subscriptionPlan: readField(item, "subscriptionPlan", "subscription_plan"),
        subscriptionExpiresAt: readField(
          item,
          "subscriptionExpiresAt",
          "subscription_expires_at",
        ),
      },
      planId,
      billingInterval,
    );

    const now = new Date().toISOString();
    await client.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: key,
        UpdateExpression: `
          SET subscriptionPlan = :plan,
              subscriptionExpiresAt = :exp,
              subscriptionInterval = :interval,
              lastPaymentOrderNumber = :order,
              lastPaymentAt = :now,
              updatedAt = :now
        `.replace(/\s+/g, " ").trim(),
        ExpressionAttributeValues: {
          ":plan": planId,
          ":exp": expiresAt,
          ":interval": billingInterval,
          ":order": orderNumber || now,
          ":now": now,
        },
      }),
    );

    return jsonResponse(200, {
      ok: true,
      userId,
      subscriptionPlan: planId,
      billingInterval,
      subscriptionExpiresAt: expiresAt,
    });
  } catch (err) {
    console.error("[activate-subscription]", err);
    return jsonResponse(500, {
      error: "Aktivacija pretplate nije uspjela.",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}

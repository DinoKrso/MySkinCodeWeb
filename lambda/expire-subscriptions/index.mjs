import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.USERS_TABLE_NAME ?? "Users";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY?.trim();
const PK_ATTRIBUTE = process.env.USERS_PK_ATTRIBUTE ?? "userId";
const SK_ATTRIBUTE = process.env.USERS_SK_ATTRIBUTE?.trim() ?? "";

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

function isHttpEvent(event) {
  return Boolean(event?.httpMethod || event?.requestContext?.http?.method);
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

function keyFromItem(item) {
  const pk = item[PK_ATTRIBUTE];
  if (pk == null) return null;
  const key = { [PK_ATTRIBUTE]: pk };
  if (SK_ATTRIBUTE) {
    if (item[SK_ATTRIBUTE] == null) return null;
    key[SK_ATTRIBUTE] = item[SK_ATTRIBUTE];
  }
  return key;
}

async function expirePaidPlans() {
  const now = new Date().toISOString();
  let exclusiveStartKey;
  let scanned = 0;
  let expired = 0;
  const errors = [];

  do {
    const page = await client.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: `(subscriptionPlan = :plus OR subscriptionPlan = :premium) AND attribute_exists(subscriptionExpiresAt) AND subscriptionExpiresAt < :now`,
        ExpressionAttributeValues: {
          ":plus": "plus",
          ":premium": "premium",
          ":now": now,
        },
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );

    scanned += page.ScannedCount ?? 0;
    const items = page.Items ?? [];

    for (const item of items) {
      const key = keyFromItem(item);
      if (!key) continue;

      try {
        await client.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: key,
            ConditionExpression: `(subscriptionPlan = :plus OR subscriptionPlan = :premium) AND subscriptionExpiresAt < :now`,
            UpdateExpression: `
              SET subscriptionPlan = :basic,
                  lastExpiredAt = :now,
                  updatedAt = :now
            `.replace(/\s+/g, " ").trim(),
            ExpressionAttributeValues: {
              ":plus": "plus",
              ":premium": "premium",
              ":basic": "basic",
              ":now": now,
            },
          }),
        );
        expired += 1;
      } catch (err) {
        if (err?.name === "ConditionalCheckFailedException") continue;
        errors.push(err instanceof Error ? err.message : String(err));
      }
    }

    exclusiveStartKey = page.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return { ok: true, scanned, expired, errors: errors.slice(0, 10), ranAt: now };
}

export async function handler(event = {}) {
  if (
    event.requestContext?.http?.method === "OPTIONS" ||
    event.httpMethod === "OPTIONS"
  ) {
    return jsonResponse(204, {});
  }

  if (isHttpEvent(event)) {
    const method =
      event.requestContext?.http?.method ?? event.httpMethod ?? "POST";
    if (method !== "POST" && method !== "GET") {
      return jsonResponse(405, { error: "Method not allowed." });
    }
    if (!isAuthorized(event)) {
      return jsonResponse(401, { error: "Unauthorized" });
    }
  }

  try {
    const result = await expirePaidPlans();
    console.info("[expire-subscriptions]", result);
    if (isHttpEvent(event)) {
      return jsonResponse(200, result);
    }
    return result;
  } catch (err) {
    console.error("[expire-subscriptions]", err);
    const detail = err instanceof Error ? err.message : String(err);
    if (isHttpEvent(event)) {
      return jsonResponse(500, {
        error: "Provjera isteka pretplata nije uspjela.",
        detail,
      });
    }
    throw err;
  }
}

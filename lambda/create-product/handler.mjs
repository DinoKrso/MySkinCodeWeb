import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.PRODUCTS_TABLE_NAME ?? "Products";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY?.trim();

const STEP_TYPES = new Set([
  "Čistač",
  "Hidratantna krema",
  "Krema za područje oko očiju",
  "Tretman",
  "Tonik",
  "SPF",
  "Serum",
]);

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": process.env.CORS_ORIGIN ?? "*",
      "Access-Control-Allow-Headers":
        "Content-Type,Authorization,X-Admin-Key",
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

function asString(value, field, { required = false, max = 2000 } = {}) {
  if (typeof value !== "string") {
    if (required) throw new Error(`Polje "${field}" je obavezno.`);
    return "";
  }
  const trimmed = value.trim();
  if (required && !trimmed) throw new Error(`Polje "${field}" je obavezno.`);
  if (trimmed.length > max) {
    throw new Error(`Polje "${field}" je predugačko.`);
  }
  return trimmed;
}

function asStringArray(value, field) {
  if (!Array.isArray(value)) {
    throw new Error(`Polje "${field}" mora biti lista.`);
  }
  return value
    .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
    .filter(Boolean);
}

function buildProductPk(brand, name) {
  const slug = `${brand}${name}`
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-zA-Z0-9]/g, "");
  if (!slug) throw new Error("Brand i naziv moraju generirati valjan PK.");
  return `PRODUCT#${slug}`;
}

function normalizeProduct(body) {
  const brand = asString(body.brand, "brand", { required: true, max: 120 });
  const name = asString(body.name, "name", { required: true, max: 200 });
  const step_type = asString(body.step_type, "step_type", { required: true });

  if (!STEP_TYPES.has(step_type)) {
    throw new Error("Nepoznat step_type.");
  }

  const pk = body.PK?.trim() || buildProductPk(brand, name);

  if (!pk.startsWith("PRODUCT#")) {
    throw new Error("PK mora počinjati s PRODUCT#.");
  }

  return {
    PK: pk,
    SK: "META",
    brand,
    name,
    line: asString(body.line, "line", { max: 200 }),
    category: asString(body.category, "category", { required: true, max: 80 }),
    country: asString(body.country, "country", { max: 80 }),
    description: asString(body.description, "description", {
      required: true,
      max: 4000,
    }),
    image: asString(body.image, "image", { required: true, max: 500 }),
    step_type,
    price_range: asString(body.price_range, "price_range", {
      required: true,
      max: 40,
    }),
    concerns: asStringArray(body.concerns ?? [], "concerns"),
    highlights: asStringArray(body.highlights ?? [], "highlights"),
    ingredients: asStringArray(body.ingredients ?? [], "ingredients"),
    key_ingredients: asStringArray(
      body.key_ingredients ?? [],
      "key_ingredients",
    ),
    skin_types: asStringArray(body.skin_types ?? [], "skin_types"),
    isSponsored: Boolean(body.isSponsored),
    sponsorWeight:
      typeof body.sponsorWeight === "number" && Number.isFinite(body.sponsorWeight)
        ? Math.max(0, Math.floor(body.sponsorWeight))
        : 0,
    createdAt:
      typeof body.createdAt === "number" && body.createdAt > 0
        ? Math.floor(body.createdAt)
        : Math.floor(Date.now() / 1000),
  };
}

/**
 * POST /admin/products
 * Body: product fields (vidi README)
 */
export async function handler(event) {
  if (
    event.requestContext?.http?.method === "OPTIONS" ||
    event.httpMethod === "OPTIONS"
  ) {
    return jsonResponse(204, {});
  }

  const method = event.requestContext?.http?.method ?? event.httpMethod;
  if (method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  if (!isAuthorized(event)) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  try {
    let body;
    try {
      body = parseBody(event);
    } catch {
      return jsonResponse(400, { error: "Neispravan JSON." });
    }

    const item = normalizeProduct(body);

    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: "attribute_not_exists(PK)",
      }),
    );

    return jsonResponse(201, {
      message: "Proizvod je spremljen.",
      product: item,
    });
  } catch (err) {
    console.error("[create-product]", err);

    if (err?.name === "ConditionalCheckFailedException") {
      return jsonResponse(409, {
        error: "Proizvod s tim PK već postoji. Promijeni naziv ili brand.",
      });
    }

    const message = err instanceof Error ? err.message : "Spremanje nije uspjelo.";

    return jsonResponse(400, { error: message });
  }
}

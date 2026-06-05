import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.PRODUCT_IMAGES_BUCKET ?? "products-images-skincode";
const REGION = process.env.AWS_REGION ?? "eu-central-1";

const s3 = new S3Client({
  region: REGION,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const PUBLIC_BASE =
  process.env.PRODUCT_IMAGES_PUBLIC_BASE?.replace(/\/+$/, "") ??
  `https://${BUCKET}.s3.${REGION}.amazonaws.com`;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY?.trim();
/** API Gateway ~6 MB limit s base64 — drži ispod 4 MB raw. */
const MAX_BYTES = Number(process.env.PRODUCT_IMAGE_MAX_BYTES ?? 4 * 1024 * 1024);

const ALLOWED_TYPE = "image/jpeg";

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
  const raw =
    event.isBase64Encoded && event.body
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;
  if (!raw) return {};
  return JSON.parse(raw);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function assertJpgFileName(fileName) {
  if (!fileName?.trim()) {
    throw new Error("Datoteka mora imati ekstenziju .jpg");
  }
  if (!fileName.toLowerCase().endsWith(".jpg")) {
    throw new Error("Dozvoljene su samo .jpg datoteke (ne .jpeg).");
  }
}

function resolveObjectKey(body) {
  const fileName =
    typeof body.fileName === "string" ? body.fileName.trim() : "";
  assertJpgFileName(fileName);

  const slugFromBody =
    typeof body.slug === "string" ? slugify(body.slug) : "";
  const slugFromNames = slugify(`${body.brand ?? ""}-${body.name ?? ""}`);
  const baseSlug =
    slugFromBody ||
    slugFromNames ||
    slugify(fileName.replace(/\.[^.]+$/, "")) ||
    `product-${Date.now()}`;

  return `${baseSlug}.jpg`;
}

/**
 * POST /admin/product-image-upload
 * Body: { contentType, fileName, brand?, name?, fileBase64 }
 * Lambda direktno radi PutObject (nema presigned URL / CORS na S3).
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
    const body = parseBody(event);
    const contentType =
      typeof body.contentType === "string" ? body.contentType.trim() : "";

    if (contentType !== ALLOWED_TYPE) {
      return jsonResponse(400, {
        error: "Dozvoljen je samo .jpg format.",
      });
    }

    const fileBase64 =
      typeof body.fileBase64 === "string" ? body.fileBase64.trim() : "";
    if (!fileBase64) {
      return jsonResponse(400, {
        error: "Nedostaje fileBase64. Osvježi admin web (direktni upload).",
      });
    }

    let fileBuffer;
    try {
      fileBuffer = Buffer.from(fileBase64, "base64");
    } catch {
      return jsonResponse(400, { error: "Neispravan base64 sadržaj slike." });
    }

    if (!fileBuffer.length) {
      return jsonResponse(400, { error: "Prazna datoteka." });
    }

    if (fileBuffer.length > MAX_BYTES) {
      return jsonResponse(400, {
        error: `Slika je prevelika (max ${Math.round(MAX_BYTES / 1024 / 1024)} MB).`,
      });
    }

    const key = resolveObjectKey(body);
    const publicUrl = `${PUBLIC_BASE}/${key}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      }),
    );

    return jsonResponse(200, {
      uploaded: true,
      message: "Slika je uploadana na S3.",
      publicUrl,
      key,
      bucket: BUCKET,
    });
  } catch (err) {
    console.error("[product-image-upload]", err);

    const message = err instanceof Error ? err.message : String(err);
    const accessDenied =
      err?.name === "AccessDenied" ||
      message.includes("AccessDenied") ||
      message.includes("not authorized");

    if (accessDenied) {
      return jsonResponse(403, {
        error:
          "Lambda nema s3:PutObject na bucket. Dodaj IAM policy (vidi infra/iam-product-image-upload.json) na execution role.",
        detail: message,
      });
    }

    return jsonResponse(500, {
      error: "Upload slike nije uspio.",
      detail: message,
    });
  }
}

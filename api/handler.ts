import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createProductUpstream } from "../server/api-lib/admin-create-product.js";
import { uploadProductImageUpstream } from "../server/api-lib/admin-product-image-upload.js";
import type { ImageUploadRequest } from "../server/api-lib/admin-product-image-upload.js";
import { fetchProductsCountFromUpstream } from "../server/api-lib/admin-products-count.js";
import { fetchUsersCountFromUpstream } from "../server/api-lib/admin-users-count.js";
import {
  handleForgotPasswordRequest,
  loadForgotPasswordEnv,
} from "../server/api-lib/forgot-password-handler.js";
import {
  handleResetPasswordRequest,
  handleValidateResetTokenRequest,
  loadResetPasswordEnv,
} from "../server/api-lib/reset-password-handler.js";

function readPathQuery(value: unknown): string {
  if (Array.isArray(value) && value.length > 0) {
    return value.map(String).filter(Boolean).join("/");
  }
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return "";
}

function readPathFromUrl(req: VercelRequest): string {
  const raw = req.url;
  if (!raw) return "";

  try {
    const host = req.headers.host ?? "localhost";
    const url = new URL(raw, `https://${host}`);
    const match = url.pathname.match(/\/api\/(.+)$/);
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  } catch {
    const pathname = raw.split("?")[0] ?? "";
    const match = pathname.match(/\/api\/(.+)$/);
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return "";
}

function getRoutePath(req: VercelRequest): string {
  return (
    readPathQuery(req.query.path) ||
    readPathQuery(req.query.route) ||
    readPathFromUrl(req)
  );
}

function sendForgotPasswordConfigError(res: VercelResponse): void {
  res.status(503).json({
    error:
      "Password reset API nije konfiguriran. U Vercel postavite RESEND_API_KEY i PASSWORD_RESET_JWT_SECRET.",
  });
}

function sendResetPasswordConfigError(res: VercelResponse): void {
  res.status(503).json({
    error:
      "Password reset API nije konfiguriran. Dodaj PASSWORD_RESET_JWT_SECRET u Vercel env.",
  });
}

async function handleForgotPassword(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const env = loadForgotPasswordEnv(process.env as Record<string, string>);
  if (!env) {
    sendForgotPasswordConfigError(res);
    return;
  }

  await handleForgotPasswordRequest(req, res, env);
}

async function handleResetPassword(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const env = loadResetPasswordEnv(process.env as Record<string, string>);
  if (!env) {
    sendResetPasswordConfigError(res);
    return;
  }

  await handleResetPasswordRequest(req, res, env);
}

async function handleValidateResetToken(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const env = loadResetPasswordEnv(process.env as Record<string, string>);
  if (!env) {
    sendResetPasswordConfigError(res);
    return;
  }

  await handleValidateResetTokenRequest(req, res, env);
}

function handleHealth(res: VercelResponse): void {
  res.status(200).json({ ok: true, service: "myskincode-api" });
}

async function handleAdminUsersCount(res: VercelResponse): Promise<void> {
  const mock =
    process.env.ADMIN_USERS_COUNT_MOCK?.trim() ||
    process.env.VITE_ADMIN_USERS_COUNT_MOCK?.trim();
  if (mock) {
    const count = Number.parseInt(mock, 10);
    if (Number.isFinite(count) && count >= 0) {
      res.status(200).json({ count, table: "Users (mock)" });
      return;
    }
  }

  const result = await fetchUsersCountFromUpstream();
  res.status(200).json(result);
}

async function handleAdminProductsCount(res: VercelResponse): Promise<void> {
  const mock =
    process.env.ADMIN_PRODUCTS_COUNT_MOCK?.trim() ||
    process.env.VITE_ADMIN_PRODUCTS_COUNT_MOCK?.trim();
  if (mock) {
    const count = Number.parseInt(mock, 10);
    if (Number.isFinite(count) && count >= 0) {
      res.status(200).json({ count, table: "Products (mock)" });
      return;
    }
  }

  const result = await fetchProductsCountFromUpstream();
  res.status(200).json(result);
}

async function handleAdminProducts(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const body = req.body;
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Neispravan JSON." });
    return;
  }

  try {
    const result = await createProductUpstream(body as Record<string, unknown>);
    res.status(201).json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Spremanje proizvoda nije uspjelo.";
    const status = message.includes("već postoji") ? 409 : 502;
    res.status(status).json({ error: message });
  }
}

async function handleAdminProductImageUpload(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const body = req.body;
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Neispravan JSON." });
    return;
  }

  const result = await uploadProductImageUpstream(body as ImageUploadRequest);
  res.status(200).json(result);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const route = getRoutePath(req);

  try {
    switch (route) {
      case "forgot-password":
        await handleForgotPassword(req, res);
        return;
      case "reset-password":
        await handleResetPassword(req, res);
        return;
      case "reset-password/validate":
        await handleValidateResetToken(req, res);
        return;
      case "health":
        handleHealth(res);
        return;
      case "admin/users-count":
        await handleAdminUsersCount(res);
        return;
      case "admin/products-count":
        await handleAdminProductsCount(res);
        return;
      case "admin/products":
        await handleAdminProducts(req, res);
        return;
      case "admin/product-image-upload":
        await handleAdminProductImageUpload(req, res);
        return;
      default:
        res.status(404).json({ error: "Not found." });
    }
  } catch (err) {
    console.error(`[api/${route || "unknown"}]`, err);
    if (!res.headersSent) {
      const fallback =
        route.startsWith("admin/") && route !== "admin/products"
          ? "Učitavanje podataka nije uspjelo."
          : "Došlo je do greške.";
      const message = err instanceof Error ? err.message : fallback;
      res.status(route.startsWith("admin/") ? 502 : 500).json({ error: message });
    }
  }
}

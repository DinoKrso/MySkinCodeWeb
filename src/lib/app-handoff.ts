import { decodeJwtPayload, extractUserIdFromToken } from "./api-utils";
import type { AuthUser } from "./auth";

export type AppHandoffParams = {
  token: string;
  user: AuthUser;
  redirect: string;
};

const DEFAULT_REDIRECT = "/plans";

export function sanitizeRedirectPath(
  raw: string | null | undefined,
): string {
  if (!raw?.trim()) return DEFAULT_REDIRECT;

  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return DEFAULT_REDIRECT;
  }

  return path;
}

function extractEmailFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const email = payload.email;
  if (typeof email === "string" && email.trim()) return email.trim();
  return null;
}

export function parseAppHandoffSearchParams(
  searchParams: URLSearchParams,
): { ok: true; data: AppHandoffParams } | { ok: false; error: string } {
  const token = searchParams.get("token")?.trim() ?? "";
  const userIdParam =
    searchParams.get("userId")?.trim() ??
    searchParams.get("userID")?.trim() ??
    "";
  const emailParam = searchParams.get("email")?.trim() ?? "";
  const name = searchParams.get("name")?.trim() || undefined;
  const redirect = sanitizeRedirectPath(searchParams.get("redirect"));

  if (!token) {
    return { ok: false, error: "Token nije pronađen u poveznici." };
  }

  const userIdFromToken = extractUserIdFromToken(token);
  const userId = userIdParam || userIdFromToken || "";

  if (!userId) {
    return { ok: false, error: "userId nije pronađen u poveznici." };
  }

  if (userIdParam && userIdFromToken && userIdParam !== userIdFromToken) {
    return { ok: false, error: "Podaci za prijavu nisu ispravni." };
  }

  const email = emailParam || extractEmailFromToken(token) || "";
  if (!email) {
    return {
      ok: false,
      error: "E-mail nije pronađen u poveznici.",
    };
  }

  return {
    ok: true,
    data: {
      token,
      user: { userId, email, name },
      redirect,
    },
  };
}

export function buildAppHandoffUrl(options: {
  baseUrl: string;
  token: string;
  userId: string;
  email: string;
  name?: string;
  redirect?: string;
}): string {
  const url = new URL("/auth/app", options.baseUrl.replace(/\/+$/, ""));
  url.searchParams.set("token", options.token);
  url.searchParams.set("userId", options.userId);
  url.searchParams.set("email", options.email);
  if (options.name?.trim()) {
    url.searchParams.set("name", options.name.trim());
  }
  if (options.redirect?.trim()) {
    url.searchParams.set("redirect", sanitizeRedirectPath(options.redirect));
  }
  return url.toString();
}

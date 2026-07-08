import {
  extractUserIdFromToken,
  getErrorMessage,
  parseApiBody,
  readJsonResponse,
  wrapFetchError,
} from "./api-utils";
import { endpoints } from "./config";

const TOKEN_KEY = "myskincode_token";
const USER_KEY = "myskincode_user";

export type AuthUser = {
  userId: string;
  email: string;
  name?: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
  isNewUser?: boolean;
};

type RawLoginUser = {
  userId?: string;
  email?: string;
  name?: string;
};

type RawLoginResponse = {
  token?: string;
  user?: RawLoginUser;
  isNewUser?: boolean;
  error?: string;
};

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function normalizeLoginResponse(raw: unknown): LoginResponse {
  const parsed = parseApiBody(raw) as RawLoginResponse;
  const token = parsed.token;

  if (!token) {
    throw new Error(getErrorMessage(parsed, "Token nije pronađen u odgovoru."));
  }

  const userId =
    parsed.user?.userId?.trim() ||
    extractUserIdFromToken(token) ||
    "";

  if (!userId) {
    throw new Error("userId nije pronađen u odgovoru.");
  }

  const email = parsed.user?.email?.trim() ?? "";

  return {
    token,
    user: {
      userId,
      email,
      name: parsed.user?.name?.trim() || undefined,
    },
    isNewUser: parsed.isNewUser,
  };
}

async function postLogin(
  url: string,
  init: RequestInit,
  fallbackError: string,
): Promise<LoginResponse> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (err) {
    throw wrapFetchError(err, fallbackError);
  }

  const raw = await readJsonResponse(response);
  const parsed = parseApiBody(raw) as RawLoginResponse;

  if (!response.ok) {
    throw new Error(getErrorMessage(parsed, fallbackError));
  }

  return normalizeLoginResponse(parsed);
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return postLogin(
    endpoints.login,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
    "Prijava nije uspjela.",
  );
}

export async function loginWithFirebaseToken(
  firebaseIdToken: string,
): Promise<LoginResponse> {
  const result = await postLogin(
    endpoints.firebaseAuthExchange,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firebaseIdToken}`,
      },
      body: JSON.stringify({}),
    },
    "Google prijava nije uspjela.",
  );

  if (result.isNewUser) {
    throw new Error(
      "Račun nije registriran. Registracija je dostupna u mobilnoj aplikaciji.",
    );
  }

  return result;
}

export function getAuthHeaders(
  token: string,
  userId: string,
): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-User-Id": userId,
  };
}

export async function deleteUserAccount(
  token: string,
  userId: string,
): Promise<void> {
  const url = `${endpoints.deleteUser}?userId=${encodeURIComponent(userId)}`;
  let response: Response;

  try {
    response = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(token, userId),
      body: JSON.stringify({ userId, userID: userId }),
    });
  } catch (err) {
    throw wrapFetchError(err, "Brisanje računa nije uspjelo.");
  }

  const raw = await readJsonResponse(response);
  const parsed = parseApiBody(raw);

  if (!response.ok) {
    throw new Error(getErrorMessage(parsed, "Brisanje računa nije uspjelo."));
  }
}

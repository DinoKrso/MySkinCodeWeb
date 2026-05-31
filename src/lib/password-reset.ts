import { getErrorMessage, readJsonResponse, wrapFetchError } from "./api-utils";

const FORGOT_PASSWORD_ENDPOINT = "/api/forgot-password";
const VALIDATE_RESET_TOKEN_ENDPOINT = "/api/reset-password/validate";
const RESET_PASSWORD_ENDPOINT = "/api/reset-password";

export async function requestPasswordReset(email: string): Promise<string> {
  let response: Response;

  try {
    response = await fetch(FORGOT_PASSWORD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
  } catch (err) {
    throw wrapFetchError(err, "Slanje uputa za reset lozinke nije uspjelo.");
  }

  const raw = await readJsonResponse(response);
  const message =
    typeof raw === "object" &&
    raw !== null &&
    "message" in raw &&
    typeof raw.message === "string"
      ? raw.message
      : "Poslali smo upute za reset lozinke na vašu e-mail adresu.";

  if (!response.ok) {
    throw new Error(getErrorMessage(raw, "Slanje uputa za reset lozinke nije uspjelo."));
  }

  return message;
}

export async function validateResetToken(token: string): Promise<{ email: string }> {
  let response: Response;

  try {
    response = await fetch(
      `${VALIDATE_RESET_TOKEN_ENDPOINT}?token=${encodeURIComponent(token)}`,
    );
  } catch (err) {
    throw wrapFetchError(err, "Provjera linka nije uspjela.");
  }

  const raw = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(raw, "Link je nevažeći ili je istekao."),
    );
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    "email" in raw &&
    typeof raw.email === "string" &&
    raw.email.trim()
  ) {
    return { email: raw.email.trim() };
  }

  throw new Error("Link je nevažeći ili je istekao.");
}

export async function submitNewPassword(
  token: string,
  password: string,
): Promise<string> {
  let response: Response;

  try {
    response = await fetch(RESET_PASSWORD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
  } catch (err) {
    throw wrapFetchError(err, "Promjena lozinke nije uspjela.");
  }

  const raw = await readJsonResponse(response);
  const message =
    typeof raw === "object" &&
    raw !== null &&
    "message" in raw &&
    typeof raw.message === "string"
      ? raw.message
      : "Lozinka je uspješno promijenjena.";

  if (!response.ok) {
    throw new Error(getErrorMessage(raw, "Promjena lozinke nije uspjela."));
  }

  return message;
}

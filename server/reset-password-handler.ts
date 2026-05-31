import type { IncomingMessage, ServerResponse } from "node:http";
import { verifyPasswordResetToken } from "./password-reset-token";
import { readRequestBody } from "./request-body";

type QueryRequest = IncomingMessage & {
  query?: Record<string, string | string[] | undefined>;
};

type ResetPasswordEnv = {
  jwtSecret: string;
  resetPasswordApiUrl: string;
};

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return readRequestBody(req);
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>,
): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function readTokenFromQuery(req: QueryRequest): string | null {
  const queryToken = req.query?.token;
  if (typeof queryToken === "string" && queryToken.trim()) {
    return queryToken.trim();
  }
  if (Array.isArray(queryToken) && typeof queryToken[0] === "string") {
    return queryToken[0].trim() || null;
  }

  const url = req.url;
  if (!url) return null;

  const query = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
  const params = new URLSearchParams(query);
  const token = params.get("token")?.trim();
  return token || null;
}

function readTokenFromBody(body: unknown): string | null {
  if (
    typeof body === "object" &&
    body !== null &&
    "token" in body &&
    typeof body.token === "string"
  ) {
    const token = body.token.trim();
    return token || null;
  }
  return null;
}

function readPasswordFromBody(body: unknown): string | null {
  if (
    typeof body === "object" &&
    body !== null &&
    "password" in body &&
    typeof body.password === "string"
  ) {
    const password = body.password;
    return password.length > 0 ? password : null;
  }
  return null;
}

export async function handleValidateResetTokenRequest(
  req: QueryRequest,
  res: ServerResponse,
  env: ResetPasswordEnv,
): Promise<void> {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const token = readTokenFromQuery(req);
  if (!token) {
    sendJson(res, 400, { error: "Link za reset nije ispravan." });
    return;
  }

  const verified = verifyPasswordResetToken(token, env.jwtSecret);
  if (!verified) {
    sendJson(res, 400, {
      error: "Link je nevažeći ili je istekao. Zatražite novi reset lozinke.",
    });
    return;
  }

  sendJson(res, 200, { email: verified.email });
}

export async function handleResetPasswordRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: ResetPasswordEnv,
): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  let body: unknown;
  try {
    body = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: "Neispravan JSON." });
    return;
  }

  const token = readTokenFromBody(body);
  const password = readPasswordFromBody(body);

  if (!token) {
    sendJson(res, 400, { error: "Link za reset nije ispravan." });
    return;
  }

  if (!password || password.length < 8) {
    sendJson(res, 400, {
      error: "Lozinka mora imati najmanje 8 znakova.",
    });
    return;
  }

  const verified = verifyPasswordResetToken(token, env.jwtSecret);
  if (!verified) {
    sendJson(res, 400, {
      error: "Link je nevažeći ili je istekao. Zatražite novi reset lozinke.",
    });
    return;
  }

  let apiResponse: Response;
  try {
    apiResponse = await fetch(env.resetPasswordApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: verified.email,
        password,
      }),
    });
  } catch {
    sendJson(res, 502, {
      error: "Promjena lozinke nije uspjela. Pokušajte ponovo kasnije.",
    });
    return;
  }

  const rawText = await apiResponse.text();
  let parsed: unknown = null;
  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = rawText;
    }
  }

  if (!apiResponse.ok) {
    const message =
      typeof parsed === "object" &&
      parsed !== null &&
      ("error" in parsed || "message" in parsed)
        ? String(
            ("error" in parsed && parsed.error) ||
              ("message" in parsed && parsed.message) ||
              "Promjena lozinke nije uspjela.",
          )
        : "Promjena lozinke nije uspjela.";

    sendJson(res, apiResponse.status >= 500 ? 502 : 400, { error: message });
    return;
  }

  const lambdaMessage =
    typeof parsed === "object" &&
    parsed !== null &&
    "message" in parsed &&
    typeof parsed.message === "string" &&
    parsed.message.trim()
      ? parsed.message.trim()
      : "Lozinka je uspješno promijenjena. Možete se prijaviti.";

  const updated =
    typeof parsed === "object" &&
    parsed !== null &&
    "updated" in parsed &&
    parsed.updated === true;

  if (!updated) {
    sendJson(res, 502, {
      error:
        "Lozinka nije promijenjena na serveru. Lambda nije pronašla korisnika ili nije ažurirala bazu — provjeri reset-password Lambda (DynamoDB tabela i polja).",
    });
    return;
  }

  sendJson(res, 200, { message: lambdaMessage });
}

const DEFAULT_RESET_PASSWORD_API_URL =
  "https://ai8hjf2fsc.execute-api.eu-central-1.amazonaws.com/dev/reset-password";

export function loadResetPasswordEnv(
  env: Record<string, string>,
): ResetPasswordEnv | null {
  const jwtSecret = env.PASSWORD_RESET_JWT_SECRET?.trim();
  const resetPasswordApiUrl =
    env.RESET_PASSWORD_API_URL?.trim() || DEFAULT_RESET_PASSWORD_API_URL;

  if (!jwtSecret) {
    return null;
  }

  return {
    jwtSecret,
    resetPasswordApiUrl,
  };
}

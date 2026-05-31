import type { IncomingMessage, ServerResponse } from "node:http";
import { Resend } from "resend";
import { checkEmailExists, getCheckEmailApiUrl } from "./check-email-client";
import { createPasswordResetToken } from "./password-reset-token";
import { readRequestBody } from "./request-body";

type ForgotPasswordEnv = {
  resendApiKey: string;
  resendFrom: string;
  appBaseUrl: string;
  jwtSecret: string;
  checkEmailApiUrl: string;
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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildResetEmailHtml(resetUrl: string): string {
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 32rem; margin: 0 auto; color: #2c3338;">
      <h1 style="font-size: 1.5rem; font-weight: 500; margin: 0 0 1rem;">Reset lozinke</h1>
      <p style="line-height: 1.6; margin: 0 0 1rem;">
        Primili smo zahtjev za reset lozinke za vaš MySkinCode račun.
      </p>
      <p style="line-height: 1.6; margin: 0 0 1.5rem;">
        Kliknite na gumb ispod kako biste postavili novu lozinku. Link vrijedi 1 sat.
      </p>
      <p style="margin: 0 0 1.5rem;">
        <a
          href="${resetUrl}"
          style="display: inline-block; padding: 0.85rem 1.25rem; background: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 0.9375rem;"
        >
          Postavi novu lozinku
        </a>
      </p>
      <p style="line-height: 1.6; margin: 0; font-size: 0.875rem; color: #5c6670;">
        Ako niste vi zatražili reset lozinke, možete ignorirati ovu poruku.
      </p>
      <p style="line-height: 1.6; margin: 1rem 0 0; font-size: 0.8125rem; color: #5c6670; word-break: break-all;">
        Ako gumb ne radi, kopirajte ovaj link u preglednik:<br />
        <a href="${resetUrl}" style="color: #5c6670;">${resetUrl}</a>
      </p>
    </div>
  `.trim();
}

export async function handleForgotPasswordRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: ForgotPasswordEnv,
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

  const email =
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof body.email === "string"
      ? body.email.trim()
      : "";

  if (!email || !isValidEmail(email)) {
    sendJson(res, 400, { error: "Unesite ispravnu e-mail adresu." });
    return;
  }

  let emailExists = false;
  try {
    emailExists = await checkEmailExists(email, env.checkEmailApiUrl);
  } catch {
    sendJson(res, 502, {
      error: "Provjera e-mail adrese nije uspjela. Pokušajte ponovo kasnije.",
    });
    return;
  }

  if (!emailExists) {
    sendJson(res, 404, {
      error:
        "Račun s tom e-mail adresom nije pronađen. Provjerite adresu ili se registrirajte u aplikaciji.",
    });
    return;
  }

  const token = createPasswordResetToken(email, env.jwtSecret);
  const resetUrl = `${env.appBaseUrl.replace(/\/+$/, "")}/reset-password?token=${encodeURIComponent(token)}`;

  try {
    const resend = new Resend(env.resendApiKey);
    const { error } = await resend.emails.send({
      from: env.resendFrom,
      to: email,
      subject: "Reset lozinke — MySkinCode",
      html: buildResetEmailHtml(resetUrl),
    });

    if (error) {
      sendJson(res, 502, {
        error: "Slanje e-maila nije uspjelo. Pokušajte ponovo kasnije.",
      });
      return;
    }
  } catch {
    sendJson(res, 500, { error: "Došlo je do greške. Pokušajte ponovo." });
    return;
  }

  sendJson(res, 200, {
    message:
      "Poslali smo upute za reset lozinke na vašu e-mail adresu.",
  });
}

export function loadForgotPasswordEnv(
  env: Record<string, string>,
): ForgotPasswordEnv | null {
  const resendApiKey = env.RESEND_API_KEY?.trim();
  const jwtSecret = env.PASSWORD_RESET_JWT_SECRET?.trim();
  const resendFrom =
    env.RESEND_FROM?.trim() || "MySkinCode <noreply@myskincodeapp.com>";
  const appBaseUrl =
    env.APP_BASE_URL?.trim() ||
    env.VITE_APP_BASE_URL?.trim() ||
    (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "") ||
    "http://localhost:5173";

  if (!resendApiKey || !jwtSecret) {
    return null;
  }

  return {
    resendApiKey,
    resendFrom,
    appBaseUrl,
    jwtSecret,
    checkEmailApiUrl: getCheckEmailApiUrl(env),
  };
}

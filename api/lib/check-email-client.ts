import { apiTargets } from "./api-targets.js";

const DEFAULT_CHECK_EMAIL_API_URL = `${apiTargets.loginApi}/check-email`;

/** Direct AWS URL for serverless (avoids self-fetch via public site). */
export function getServerCheckEmailApiUrl(env: Record<string, string>): string {
  return (
    env.CHECK_EMAIL_API_URL?.trim() ||
    (env.VITE_API_BASE?.trim()
      ? `${env.VITE_API_BASE.replace(/\/+$/, "")}/check-email`
      : "") ||
    DEFAULT_CHECK_EMAIL_API_URL
  );
}

export function getCheckEmailApiUrl(env: Record<string, string>): string {
  if (env.USE_API_PROXY?.trim() === "false") {
    return (
      env.CHECK_EMAIL_API_URL?.trim() ||
      env.VITE_CHECK_EMAIL_API_URL?.trim() ||
      DEFAULT_CHECK_EMAIL_API_URL
    );
  }

  const appBase =
    env.APP_BASE_URL?.trim() ||
    (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "") ||
    "http://localhost:5173";

  return `${appBase.replace(/\/+$/, "")}/api/check-email`;
}

export async function checkEmailExists(
  email: string,
  apiUrl: string,
): Promise<boolean> {
  const trimmed = email.trim();
  if (!trimmed) return false;

  const candidates = [
    trimmed,
    trimmed.toLowerCase(),
    trimmed.toLowerCase() !== trimmed ? trimmed : null,
  ].filter((value, index, list): value is string => {
    return Boolean(value) && list.indexOf(value) === index;
  });

  for (const candidate of candidates) {
    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: candidate }),
      });
    } catch {
      throw new Error("Provjera e-mail adrese nije uspjela.");
    }

    let parsed: unknown;
    try {
      parsed = await response.json();
    } catch {
      throw new Error("Provjera e-mail adrese nije uspjela.");
    }

    if (!response.ok) {
      throw new Error("Provjera e-mail adrese nije uspjela.");
    }

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "exists" in parsed &&
      parsed.exists === true
    ) {
      return true;
    }
  }

  return false;
}

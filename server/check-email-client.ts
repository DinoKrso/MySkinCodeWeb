const DEFAULT_CHECK_EMAIL_API_URL =
  "https://3eft0vl4ka.execute-api.eu-central-1.amazonaws.com/dev/check-email";

export function getCheckEmailApiUrl(env: Record<string, string>): string {
  return (
    env.CHECK_EMAIL_API_URL?.trim() ||
    env.VITE_CHECK_EMAIL_API_URL?.trim() ||
    DEFAULT_CHECK_EMAIL_API_URL
  );
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

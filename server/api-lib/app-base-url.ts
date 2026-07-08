const PRODUCTION_APP_URL = "https://www.myskincodeapp.com";

function isLocalhostUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/** Public site origin for reset links and server-side proxy URLs. */
export function getAppBaseUrl(env: Record<string, string>): string {
  const configured = env.APP_BASE_URL?.trim().replace(/\/+$/, "");

  if (env.VERCEL_ENV === "production") {
    if (configured && !isLocalhostUrl(configured)) {
      return configured;
    }
    return PRODUCTION_APP_URL;
  }

  if (configured) {
    return configured;
  }

  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`.replace(/\/+$/, "");
  }

  return "http://localhost:5173";
}

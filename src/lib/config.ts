const DEFAULT_API_BASE =
  "https://3eft0vl4ka.execute-api.eu-central-1.amazonaws.com/dev";

const DEFAULT_USER_PROFILE_ENDPOINT =
  "https://4uyux7zjrf.execute-api.eu-central-1.amazonaws.com/dev/user/profile";

const DEFAULT_PROFILE_API_BASE =
  "https://2gajkkmi0d.execute-api.eu-central-1.amazonaws.com/dev";

/** Vite dev proxy paths — zaobilaze CORS (vite.config.ts) */
const DEV_USER_PROFILE_PROXY = "/api/user-profile";
const DEV_PROFILE_API_PROXY = "/api/profile-api";

function resolveUserProfileEndpoint(): string {
  if (import.meta.env.DEV) return DEV_USER_PROFILE_PROXY;
  return (
    import.meta.env.VITE_USER_PROFILE_ENDPOINT ??
    import.meta.env.VITE_PROFILE_FETCH_URL ??
    DEFAULT_USER_PROFILE_ENDPOINT
  );
}

function resolveProfileApiBase(): string {
  if (import.meta.env.DEV) return DEV_PROFILE_API_PROXY;
  return trimTrailingSlash(
    import.meta.env.VITE_PROFILE_API_BASE ?? DEFAULT_PROFILE_API_BASE,
  );
}

const DEFAULT_FIREBASE_AUTH_EXCHANGE_ENDPOINT =
  "https://ai8hjf2fsc.execute-api.eu-central-1.amazonaws.com/dev/auth/firebase";

/** In dev, Vite proxy avoids CORS on firebase auth API (see vite.config.ts). */
const DEV_FIREBASE_AUTH_PROXY = "/api/firebase-auth";

function resolveFirebaseAuthExchange(): string {
  // U dev modu uvijek proxy (API nema CORS). U produkciji direktan URL.
  if (import.meta.env.DEV) {
    return DEV_FIREBASE_AUTH_PROXY;
  }
  return (
    import.meta.env.VITE_FIREBASE_AUTH_EXCHANGE_ENDPOINT ??
    import.meta.env.VITE_FIREBASE_AUTH_URL ??
    DEFAULT_FIREBASE_AUTH_EXCHANGE_ENDPOINT
  );
}

const DEFAULT_FIREBASE_SIGNUP_ENDPOINT =
  "https://ai8hjf2fsc.execute-api.eu-central-1.amazonaws.com/dev/signup/firebase";

const DEFAULT_ACTIVE_ROUTINE_ENDPOINT =
  "https://c0cpdmd5ug.execute-api.eu-central-1.amazonaws.com/dev/routine/active";

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export const apiBase = trimTrailingSlash(
  import.meta.env.VITE_API_BASE ?? DEFAULT_API_BASE,
);

export const endpoints = {
  login:
    import.meta.env.VITE_LOGIN_API_URL ?? `${apiBase}/login`,
  userProfile: resolveUserProfileEndpoint(),
  profileApiBase: resolveProfileApiBase(),
  firebaseAuthExchange: resolveFirebaseAuthExchange(),
  firebaseSignup:
    import.meta.env.VITE_FIREBASE_SIGNUP_ENDPOINT ??
    DEFAULT_FIREBASE_SIGNUP_ENDPOINT,
  activeRoutine:
    import.meta.env.VITE_ACTIVE_ROUTINE_ENDPOINT ??
    DEFAULT_ACTIVE_ROUTINE_ENDPOINT,
} as const;

const DEFAULT_API_BASE =
  "https://3eft0vl4ka.execute-api.eu-central-1.amazonaws.com/dev";

const DEFAULT_USER_PROFILE_ENDPOINT =
  "https://4uyux7zjrf.execute-api.eu-central-1.amazonaws.com/dev/user/profile";

const DEFAULT_PROFILE_API_BASE =
  "https://2gajkkmi0d.execute-api.eu-central-1.amazonaws.com/dev";

/** Same-origin proxy paths — Vite dev proxy + Vercel rewrites (vercel.json). */
const LOGIN_PROXY = "/api/login";
const USER_PROFILE_PROXY = "/api/user-profile";
const PROFILE_API_PROXY = "/api/profile-api";
const FIREBASE_AUTH_PROXY = "/api/firebase-auth";

const DEFAULT_FIREBASE_AUTH_EXCHANGE_ENDPOINT =
  "https://ai8hjf2fsc.execute-api.eu-central-1.amazonaws.com/dev/auth/firebase";

const DEFAULT_FIREBASE_SIGNUP_ENDPOINT =
  "https://ai8hjf2fsc.execute-api.eu-central-1.amazonaws.com/dev/signup/firebase";

const DEFAULT_ACTIVE_ROUTINE_ENDPOINT =
  "https://c0cpdmd5ug.execute-api.eu-central-1.amazonaws.com/dev/routine/active";

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function useSameOriginProxy(): boolean {
  if (import.meta.env.VITE_USE_API_PROXY === "false") return false;
  if (import.meta.env.VITE_USE_API_PROXY === "true") return true;
  // Default: proxy in dev (Vite) and production (Vercel rewrites).
  return true;
}

function resolveLoginEndpoint(): string {
  if (useSameOriginProxy()) {
    return import.meta.env.VITE_LOGIN_API_URL ?? LOGIN_PROXY;
  }
  const apiBase = trimTrailingSlash(
    import.meta.env.VITE_API_BASE ?? DEFAULT_API_BASE,
  );
  return import.meta.env.VITE_LOGIN_API_URL ?? `${apiBase}/login`;
}

function resolveUserProfileEndpoint(): string {
  if (useSameOriginProxy()) return USER_PROFILE_PROXY;
  return (
    import.meta.env.VITE_USER_PROFILE_ENDPOINT ??
    import.meta.env.VITE_PROFILE_FETCH_URL ??
    DEFAULT_USER_PROFILE_ENDPOINT
  );
}

function resolveProfileApiBase(): string {
  if (useSameOriginProxy()) return PROFILE_API_PROXY;
  return trimTrailingSlash(
    import.meta.env.VITE_PROFILE_API_BASE ?? DEFAULT_PROFILE_API_BASE,
  );
}

function resolveFirebaseAuthExchange(): string {
  if (useSameOriginProxy()) return FIREBASE_AUTH_PROXY;
  return (
    import.meta.env.VITE_FIREBASE_AUTH_EXCHANGE_ENDPOINT ??
    import.meta.env.VITE_FIREBASE_AUTH_URL ??
    DEFAULT_FIREBASE_AUTH_EXCHANGE_ENDPOINT
  );
}

export const apiBase = trimTrailingSlash(
  import.meta.env.VITE_API_BASE ?? DEFAULT_API_BASE,
);

export const endpoints = {
  login: resolveLoginEndpoint(),
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

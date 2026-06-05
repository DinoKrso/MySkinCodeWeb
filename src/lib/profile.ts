import {
  findNestedValue,
  getErrorMessage,
  parseApiBody,
  readJsonResponse,
  wrapFetchError,
} from "./api-utils";
import { getAuthHeaders, type AuthUser } from "./auth";
import { endpoints } from "./config";

export type ProfileQuestionnaire = {
  gender?: string | null;
  age?: string | null;
  pregnancy?: string | null;
  therapies?: string[];
  diagnoses?: string[];
  allergies?: string[];
  mainGoals?: string[];
  skinType?: string | null;
  professionalTreatments?: unknown[];
  currentRoutine?: string[];
  frequency?: string[];
};

export type UserProfile = {
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  questionnaire?: ProfileQuestionnaire | null;
  notificationSettings?: unknown;
  subscriptionPlan?: string | null;
  subscriptionExpiresAt?: string | null;
};

function normalizeSubscriptionExpiresAt(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value < 1e12 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

export function formatSubscriptionExpiresAt(
  raw: string | null | undefined,
): string | null {
  if (!raw?.trim()) return null;

  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) {
    return raw.trim();
  }

  return new Intl.DateTimeFormat("hr-HR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(parsed));
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : String(item)))
    .filter(Boolean);
}

function normalizeQuestionnaire(raw: unknown): ProfileQuestionnaire | null {
  if (!raw || typeof raw !== "object") return null;
  const q = raw as Record<string, unknown>;
  return {
    gender: asString(q.gender),
    age: asString(q.age),
    pregnancy: asString(q.pregnancy),
    skinType: asString(q.skinType),
    therapies: asStringArray(q.therapies),
    diagnoses: asStringArray(q.diagnoses),
    allergies: asStringArray(q.allergies),
    mainGoals: asStringArray(q.mainGoals),
    professionalTreatments: Array.isArray(q.professionalTreatments)
      ? q.professionalTreatments
      : [],
    currentRoutine: asStringArray(q.currentRoutine),
    frequency: asStringArray(q.frequency),
  };
}

export function normalizeUserProfile(raw: unknown): UserProfile {
  const parsed = parseApiBody(raw);
  const root = parsed as Record<string, unknown>;

  const nestedUser =
    (root.data as Record<string, unknown> | undefined)?.user ??
    (root.data as Record<string, unknown> | undefined) ??
    root.user ??
    root;

  const userRecord =
    nestedUser && typeof nestedUser === "object"
      ? (nestedUser as Record<string, unknown>)
      : root;

  const imageUrl = findNestedValue(parsed, [
    "imageUrl",
    "profileImageUrl",
    "profile_image_url",
    "avatarUrl",
    "image",
  ]);

  const subscriptionPlan = findNestedValue(parsed, [
    "subscriptionPlan",
    "subscription_plan",
    "membershipPlan",
    "membership_plan",
  ]);

  const subscriptionExpiresAt = findNestedValue(parsed, [
    "subscriptionExpiresAt",
    "subscription_expires_at",
    "subscriptionExpires",
    "expiresAt",
  ]);

  const expires = normalizeSubscriptionExpiresAt(subscriptionExpiresAt);

  return {
    name: asString(userRecord.name),
    email: asString(userRecord.email),
    imageUrl: typeof imageUrl === "string" ? imageUrl : null,
    questionnaire: normalizeQuestionnaire(userRecord.questionnaire),
    notificationSettings: userRecord.notificationSettings ?? null,
    subscriptionPlan:
      typeof subscriptionPlan === "string" ? subscriptionPlan : null,
    subscriptionExpiresAt: expires,
  };
}

async function profileRequest(
  path: string,
  token: string,
  userId: string,
  init: RequestInit,
  fallbackError: string,
): Promise<UserProfile> {
  let response: Response;
  try {
    response = await fetch(`${endpoints.profileApiBase}${path}`, {
      ...init,
      headers: {
        ...getAuthHeaders(token, userId),
        ...(init.headers ?? {}),
      },
    });
  } catch (err) {
    throw wrapFetchError(err, fallbackError);
  }

  const raw = await readJsonResponse(response);
  const parsed = parseApiBody(raw);

  if (!response.ok) {
    throw new Error(getErrorMessage(parsed, fallbackError));
  }

  return normalizeUserProfile(parsed);
}

export async function fetchUserProfile(
  token: string,
  userId: string,
): Promise<UserProfile> {
  let response: Response;
  try {
    response = await fetch(endpoints.userProfile, {
      method: "POST",
      headers: getAuthHeaders(token, userId),
      body: JSON.stringify({ userId, userID: userId }),
    });
  } catch (err) {
    throw wrapFetchError(err, "Dohvat profila nije uspio");
  }

  const raw = await readJsonResponse(response);
  const parsed = parseApiBody(raw);

  if (!response.ok) {
    throw new Error(getErrorMessage(parsed, "Dohvat profila nije uspio."));
  }

  return normalizeUserProfile(parsed);
}

export async function updateProfile(
  token: string,
  userId: string,
  body: { name?: string; questionnaire?: Partial<ProfileQuestionnaire> },
): Promise<UserProfile> {
  return profileRequest("/profile", token, userId, {
    method: "PUT",
    body: JSON.stringify(body),
  }, "Ažuriranje profila nije uspjelo.");
}

type ImageUploadUrlResponse = {
  uploadUrl: string;
  s3Key: string;
  publicUrl?: string;
};

export async function uploadProfileImage(
  token: string,
  userId: string,
  file: File,
): Promise<UserProfile> {
  const contentType = file.type || "image/jpeg";

  const urlResponse = await fetch(`${endpoints.profileApiBase}/profile/image-upload-url`, {
    method: "POST",
    headers: getAuthHeaders(token, userId),
    body: JSON.stringify({ contentType }),
  });

  const urlRaw = await readJsonResponse(urlResponse);
  const urlParsed = parseApiBody(urlRaw) as ImageUploadUrlResponse & {
    error?: string;
  };

  if (!urlResponse.ok) {
    throw new Error(getErrorMessage(urlParsed, "Presigned URL nije dobiven."));
  }

  if (!urlParsed.uploadUrl || !urlParsed.s3Key) {
    throw new Error("Neispravan odgovor za upload slike.");
  }

  const uploadResponse = await fetch(urlParsed.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Upload slike na S3 nije uspio.");
  }

  return profileRequest(
    "/profile/image-confirm",
    token,
    userId,
    {
      method: "PUT",
      body: JSON.stringify({ s3Key: urlParsed.s3Key }),
    },
    "Potvrda slike nije uspjela.",
  );
}

export function mergeProfileWithAuthUser(
  profile: UserProfile,
  authUser: AuthUser,
): UserProfile {
  return {
    ...profile,
    name: profile.name ?? authUser.name ?? null,
    email: profile.email ?? authUser.email ?? null,
  };
}

export function formatTreatment(item: unknown): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const record = item as { name?: string; date?: string };
    if (record.name && record.date) return `${record.name} (${record.date})`;
    if (record.name) return record.name;
  }
  return String(item);
}

export function formatPlanLabel(plan: string | null | undefined): string {
  if (!plan) return "N/A";
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

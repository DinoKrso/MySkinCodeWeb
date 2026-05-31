export function unwrapDynamo(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(unwrapDynamo);
  if (typeof value !== "object") return value;

  const record = value as Record<string, unknown>;

  if ("S" in record && Object.keys(record).length === 1) {
    return record.S;
  }
  if ("N" in record && Object.keys(record).length === 1) {
    const num = Number(record.N);
    return Number.isNaN(num) ? record.N : num;
  }
  if ("BOOL" in record && Object.keys(record).length === 1) {
    return record.BOOL;
  }
  if ("NULL" in record && record.NULL === true) {
    return null;
  }
  if ("M" in record && typeof record.M === "object" && record.M !== null) {
    return unwrapDynamo(record.M);
  }
  if ("L" in record && Array.isArray(record.L)) {
    return record.L.map(unwrapDynamo);
  }

  const result: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(record)) {
    result[key] = unwrapDynamo(nested);
  }
  return result;
}

export function parseApiBody(raw: unknown): unknown {
  if (typeof raw === "string") {
    try {
      return parseApiBody(JSON.parse(raw));
    } catch {
      return raw;
    }
  }

  if (
    raw &&
    typeof raw === "object" &&
    "body" in raw &&
    typeof (raw as { body: unknown }).body === "string"
  ) {
    try {
      return parseApiBody(JSON.parse((raw as { body: string }).body));
    } catch {
      return raw;
    }
  }

  return unwrapDynamo(raw);
}

export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "="));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function extractUserIdFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  for (const key of ["userId", "user_id", "sub"]) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function findNestedValue(
  source: unknown,
  keys: string[],
): unknown {
  if (!isPlainObject(source)) return undefined;

  for (const key of keys) {
    if (key in source && source[key] !== undefined && source[key] !== "") {
      return source[key];
    }
  }

  for (const value of Object.values(source)) {
    if (isPlainObject(value) || Array.isArray(value)) {
      const found = findNestedValue(value, keys);
      if (found !== undefined && found !== "") return found;
    }
  }

  return undefined;
}

export async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function getErrorMessage(data: unknown, fallback: string): string {
  if (isPlainObject(data)) {
    if (typeof data.error === "string") return data.error;
    if (typeof data.message === "string") return data.message;
  }
  return fallback;
}

export function wrapFetchError(err: unknown, context: string): Error {
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return new Error(
      `${context}: mrežna greška (vjerojatno CORS). API Gateway mora dozvoliti origin web stranice i header Authorization.`,
    );
  }
  if (err instanceof Error) return err;
  return new Error(context);
}

export type CountResult = {
  count: number;
  table?: string;
  filter?: string;
};

export function parseCountBody(raw: unknown): CountResult {
  const root =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : {};

  const nested =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const countValue =
    nested.count ??
    nested.userCount ??
    nested.usersCount ??
    nested.productCount ??
    nested.productsCount ??
    nested.totalUsers ??
    nested.registeredUsers;

  if (typeof countValue !== "number" || !Number.isFinite(countValue)) {
    throw new Error("Odgovor API-ja ne sadrži polje count.");
  }

  const table =
    typeof nested.table === "string" ? nested.table : undefined;

  const filter =
    typeof nested.filter === "string" ? nested.filter : undefined;

  return {
    count: Math.max(0, Math.floor(countValue)),
    table,
    filter,
  };
}

export async function fetchCountFromUpstream(
  url: string,
  resourceLabel: string,
): Promise<CountResult> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const apiKey =
    process.env.ADMIN_API_KEY?.trim() ||
    process.env.VITE_ADMIN_API_KEY?.trim();
  if (apiKey) {
    headers["X-Admin-Key"] = apiKey;
  }

  const response = await fetch(url, { method: "GET", headers });
  const text = await response.text();

  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("API nije vratio valjan JSON.");
    }
  }

  if (!response.ok) {
    const message =
      parsed &&
      typeof parsed === "object" &&
      "error" in parsed &&
      typeof (parsed as { error: unknown }).error === "string"
        ? (parsed as { error: string }).error
        : `HTTP ${response.status}`;
    if (response.status === 404) {
      throw new Error(
        `404 — nema rute na ${url}. Provjeri URL za broj ${resourceLabel}.`,
      );
    }
    throw new Error(message);
  }

  return parseCountBody(parsed);
}

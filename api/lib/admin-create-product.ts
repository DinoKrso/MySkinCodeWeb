const DEFAULT_CREATE_PRODUCT_URL =
  "https://rdwp2lazqa.execute-api.eu-central-1.amazonaws.com/dev/admin/products";

export type CreateProductPayload = Record<string, unknown>;

export type CreateProductResult = {
  message: string;
  product: CreateProductPayload;
};

export function getCreateProductUpstreamUrl(): string {
  return (
    process.env.ADMIN_CREATE_PRODUCT_URL?.trim() ||
    process.env.VITE_ADMIN_CREATE_PRODUCT_URL?.trim() ||
    DEFAULT_CREATE_PRODUCT_URL
  );
}

export async function createProductUpstream(
  payload: CreateProductPayload,
): Promise<CreateProductResult> {
  const url = getCreateProductUpstreamUrl();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const apiKey =
    process.env.ADMIN_API_KEY?.trim() ||
    process.env.VITE_ADMIN_API_KEY?.trim();
  if (apiKey) {
    headers["X-Admin-Key"] = apiKey;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

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
    throw new Error(message);
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("product" in parsed) ||
    typeof (parsed as { product: unknown }).product !== "object"
  ) {
    throw new Error("Neočekivan odgovor API-ja.");
  }

  return parsed as CreateProductResult;
}

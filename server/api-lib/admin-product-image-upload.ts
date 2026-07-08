const DEFAULT_IMAGE_UPLOAD_URL =
  "https://rdwp2lazqa.execute-api.eu-central-1.amazonaws.com/dev/admin/product-image-upload";

export type ImageUploadRequest = {
  contentType: string;
  fileName: string;
  fileSize: number;
  brand?: string;
  name?: string;
  fileBase64: string;
};

export type ImageUploadResult = {
  uploaded: true;
  publicUrl: string;
  key: string;
  message: string;
};

export function getProductImageUploadUpstreamUrl(): string {
  return (
    process.env.ADMIN_PRODUCT_IMAGE_UPLOAD_URL?.trim() ||
    process.env.VITE_ADMIN_PRODUCT_IMAGE_UPLOAD_URL?.trim() ||
    DEFAULT_IMAGE_UPLOAD_URL
  );
}

export async function uploadProductImageUpstream(
  payload: ImageUploadRequest,
): Promise<ImageUploadResult> {
  const url = getProductImageUploadUpstreamUrl();
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

  const parsed: unknown = await response.json().catch(() => null);

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

  const body = parsed as Record<string, unknown>;

  if (body.uploadUrl) {
    throw new Error(
      "Stari Lambda handler (presigned URL). Redeployaj product-image-upload.",
    );
  }

  if (
    body.uploaded !== true ||
    typeof body.publicUrl !== "string" ||
    !body.publicUrl.trim()
  ) {
    throw new Error("Neočekivan odgovor upload API-ja (nema uploaded: true).");
  }

  return parsed as ImageUploadResult;
}

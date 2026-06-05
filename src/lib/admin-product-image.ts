import { endpoints } from "./config";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type ProductImageUploadResult = {
  publicUrl: string;
  key: string;
  uploaded: true;
};

type UploadApiResponse = {
  publicUrl?: string;
  key?: string;
  uploaded?: boolean;
  uploadUrl?: string;
  message?: string;
};

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Čitanje datoteke nije uspjelo."));
        return;
      }
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      if (!base64) {
        reject(new Error("Prazna datoteka."));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Čitanje datoteke nije uspjelo."));
    reader.readAsDataURL(file);
  });
}

function parseUploadResponse(raw: unknown): ProductImageUploadResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("Neočekivan odgovor upload API-ja.");
  }

  const body = raw as UploadApiResponse;

  if (body.uploadUrl) {
    throw new Error(
      "Lambda još koristi stari presigned URL flow — slika nije na S3. Redeployaj product-image-upload Lambda (direktni PutObject) i ponovi upload.",
    );
  }

  if (body.uploaded !== true || !body.publicUrl?.trim()) {
    throw new Error(
      "Slika nije potvrđena na S3. Provjeri IAM (products-images-skincode) i redeployaj Lambda.",
    );
  }

  return {
    uploaded: true,
    publicUrl: body.publicUrl.trim(),
    key: typeof body.key === "string" ? body.key : "",
  };
}

/** Upload preko API proxy → Lambda PutObject (bez direktnog S3 iz browsera). */
export async function uploadProductImage(
  file: File,
  meta: { brand: string; name: string },
): Promise<ProductImageUploadResult> {
  if (!file.name.toLowerCase().endsWith(".jpg")) {
    throw new Error("Datoteka mora imati ekstenziju .jpg (ne .jpeg).");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Slika je prevelika (maks. 4 MB).");
  }

  const fileBase64 = await readFileAsBase64(file);

  const response = await fetch(endpoints.adminProductImageUpload, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType: "image/jpeg",
      fileName: file.name,
      fileSize: file.size,
      brand: meta.brand.trim(),
      name: meta.name.trim(),
      fileBase64,
    }),
  });

  const raw: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      raw &&
      typeof raw === "object" &&
      "error" in raw &&
      typeof (raw as { error: unknown }).error === "string"
        ? (raw as { error: string }).error
        : `HTTP ${response.status}`;
    throw new Error(message);
  }

  return parseUploadResponse(raw);
}

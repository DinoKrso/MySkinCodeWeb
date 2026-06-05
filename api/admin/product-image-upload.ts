import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  uploadProductImageUpstream,
  type ImageUploadRequest,
} from "../lib/admin-product-image-upload.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const body = req.body;
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Neispravan JSON." });
    return;
  }

  try {
    const result = await uploadProductImageUpstream(body as ImageUploadRequest);
    res.status(200).json(result);
  } catch (err) {
    console.error("[admin/product-image-upload]", err);
    res.status(502).json({
      error:
        err instanceof Error ? err.message : "Upload link nije dostupan.",
    });
  }
}

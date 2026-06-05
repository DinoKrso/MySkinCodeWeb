import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createProductUpstream } from "../lib/admin-create-product.js";

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
    const result = await createProductUpstream(body as Record<string, unknown>);
    res.status(201).json(result);
  } catch (err) {
    console.error("[admin/products]", err);
    const message =
      err instanceof Error ? err.message : "Spremanje proizvoda nije uspjelo.";
    const status = message.includes("već postoji") ? 409 : 502;
    res.status(status).json({ error: message });
  }
}

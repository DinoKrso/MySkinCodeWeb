import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Smoke test: confirms Vercel serverless functions work after deploy. */
export default function handler(_req: VercelRequest, res: VercelResponse): void {
  res.status(200).json({ ok: true, service: "myskincode-api" });
}

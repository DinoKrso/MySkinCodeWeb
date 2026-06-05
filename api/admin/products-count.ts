import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchProductsCountFromUpstream } from "../lib/admin-products-count.js";

/** Proxy prema AWS Lambda (broj proizvoda u DynamoDB Products). */
export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const mock =
    process.env.ADMIN_PRODUCTS_COUNT_MOCK?.trim() ||
    process.env.VITE_ADMIN_PRODUCTS_COUNT_MOCK?.trim();
  if (mock) {
    const count = Number.parseInt(mock, 10);
    if (Number.isFinite(count) && count >= 0) {
      res.status(200).json({ count, table: "Products (mock)" });
      return;
    }
  }

  try {
    const result = await fetchProductsCountFromUpstream();
    res.status(200).json(result);
  } catch (err) {
    console.error("[admin/products-count]", err);
    res.status(502).json({
      error:
        err instanceof Error
          ? err.message
          : "Učitavanje broja proizvoda nije uspjelo.",
    });
  }
}

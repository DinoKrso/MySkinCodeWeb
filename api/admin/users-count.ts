import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchUsersCountFromUpstream } from "../lib/admin-users-count.js";

/** Proxy prema AWS Lambda (broj korisnika u DynamoDB Users). */
export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const mock =
    process.env.ADMIN_USERS_COUNT_MOCK?.trim() ||
    process.env.VITE_ADMIN_USERS_COUNT_MOCK?.trim();
  if (mock) {
    const count = Number.parseInt(mock, 10);
    if (Number.isFinite(count) && count >= 0) {
      res.status(200).json({ count, table: "Users (mock)" });
      return;
    }
  }

  try {
    const result = await fetchUsersCountFromUpstream();
    res.status(200).json(result);
  } catch (err) {
    console.error("[admin/users-count]", err);
    res.status(502).json({
      error:
        err instanceof Error
          ? err.message
          : "Učitavanje broja korisnika nije uspjelo.",
    });
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleMonriVerifyRequest } from "../../../server/api-lib/monri-verify-handler.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  await handleMonriVerifyRequest(
    req,
    res,
    process.env as Record<string, string>,
  );
}

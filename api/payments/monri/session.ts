import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleMonriSessionRequest } from "../../../server/api-lib/monri-session-handler.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  await handleMonriSessionRequest(
    req,
    res,
    process.env as Record<string, string>,
  );
}

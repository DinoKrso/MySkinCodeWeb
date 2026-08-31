import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleMonriCallbackRequest } from "../../../server/api-lib/monri-callback-handler.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  await handleMonriCallbackRequest(
    req,
    res,
    process.env as Record<string, string>,
  );
}

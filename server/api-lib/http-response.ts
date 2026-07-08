import type { ServerResponse } from "node:http";

/** Works with Node ServerResponse and VercelResponse (@vercel/node). */
export type ApiResponse = ServerResponse & {
  status?: (code: number) => { json: (body: unknown) => void };
  headersSent?: boolean;
};

export function sendJson(
  res: ApiResponse,
  status: number,
  body: Record<string, unknown>,
): void {
  if (typeof res.status === "function" && !res.headersSent) {
    res.status(status).json(body);
    return;
  }

  if (res.headersSent) {
    return;
  }

  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

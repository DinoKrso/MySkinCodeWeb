import type { IncomingMessage } from "node:http";
import { type ApiResponse, sendJson } from "./http-response.js";
import {
  loadMonriEnv,
  stripDigestQuery,
  successUrlDigest,
  timingSafeEqualHex,
} from "./monri.js";
import { readRequestBody } from "./request-body.js";

export async function handleMonriVerifyRequest(
  req: IncomingMessage,
  res: ApiResponse,
  envVars: Record<string, string | undefined>,
): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const env = loadMonriEnv(envVars);
  if (!env) {
    sendJson(res, 503, { error: "Monri nije konfiguriran." });
    return;
  }

  let body: unknown;
  try {
    body = await readRequestBody(req);
  } catch {
    sendJson(res, 400, { error: "Neispravan JSON." });
    return;
  }

  const url =
    body &&
    typeof body === "object" &&
    "url" in body &&
    typeof (body as { url: unknown }).url === "string"
      ? (body as { url: string }).url.trim()
      : "";

  if (!url || !url.startsWith("http")) {
    sendJson(res, 400, { error: "Nedostaje success URL." });
    return;
  }

  const { withoutDigest, digest } = stripDigestQuery(url);
  if (!digest) {
    sendJson(res, 200, { valid: false, reason: "missing_digest" });
    return;
  }

  const expected = successUrlDigest(env.key, withoutDigest);
  const valid = timingSafeEqualHex(digest, expected);

  sendJson(res, 200, { valid, testMode: env.testMode });
}

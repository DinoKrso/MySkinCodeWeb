import type { IncomingMessage } from "node:http";

type RequestWithRaw = IncomingMessage & {
  body?: unknown;
  rawBody?: string;
};

/** Raw request body as UTF-8. Needed for Monri callback digest. */
export async function readRawBody(req: RequestWithRaw): Promise<string> {
  if (typeof req.rawBody === "string") {
    return req.rawBody;
  }

  if (typeof req.body === "string") {
    return req.body;
  }

  if (Buffer.isBuffer(req.body)) {
    return req.body.toString("utf8");
  }

  if (req.body !== undefined && req.body !== null && typeof req.body === "object") {
    return JSON.stringify(req.body);
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk: Buffer | string) => {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    req.on("error", reject);
  });
}

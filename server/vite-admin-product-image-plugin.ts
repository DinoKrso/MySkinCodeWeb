import type { Plugin } from "vite";
import { loadEnv } from "vite";
import {
  uploadProductImageUpstream,
  type ImageUploadRequest,
} from "../api/lib/admin-product-image-upload.js";

const UPLOAD_PATH = "/api/admin/product-image-upload";

function sendJson(
  res: import("node:http").ServerResponse,
  status: number,
  body: Record<string, unknown>,
): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function readJsonBody(
  req: import("node:http").IncomingMessage,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

export function adminProductImagePlugin(): Plugin {
  return {
    name: "admin-product-image-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split("?")[0] !== UPLOAD_PATH) {
          next();
          return;
        }

        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed." });
          return;
        }

        loadEnv(server.config.mode, process.cwd(), "");

        try {
          const body = (await readJsonBody(req)) as ImageUploadRequest;
          const result = await uploadProductImageUpstream(
            body as ImageUploadRequest,
          );
          sendJson(res, 200, result);
        } catch (err) {
          sendJson(res, 502, {
            error:
              err instanceof Error ? err.message : "Upload link nije dostupan.",
          });
        }
      });
    },
  };
}

import type { Plugin } from "vite";
import { loadEnv } from "vite";
import { createProductUpstream } from "../api/lib/admin-create-product.js";

const PRODUCTS_PATH = "/api/admin/products";

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

export function adminProductsPlugin(): Plugin {
  return {
    name: "admin-products-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (pathname !== PRODUCTS_PATH) {
          next();
          return;
        }

        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed." });
          return;
        }

        loadEnv(server.config.mode, process.cwd(), "");

        let body: unknown;
        try {
          body = await readJsonBody(req);
        } catch {
          sendJson(res, 400, { error: "Neispravan JSON." });
          return;
        }

        if (!body || typeof body !== "object") {
          sendJson(res, 400, { error: "Neispravan JSON." });
          return;
        }

        try {
          const result = await createProductUpstream(
            body as Record<string, unknown>,
          );
          sendJson(res, 201, result);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Spremanje nije uspjelo.";
          const status = message.includes("već postoji") ? 409 : 502;
          sendJson(res, status, { error: message });
        }
      });
    },
  };
}

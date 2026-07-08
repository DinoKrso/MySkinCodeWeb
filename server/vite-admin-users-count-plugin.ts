import type { Plugin } from "vite";
import { loadEnv } from "vite";
import { fetchProductsCountFromUpstream } from "../server/api-lib/admin-products-count.js";
import { fetchUsersCountFromUpstream } from "../server/api-lib/admin-users-count.js";

const USERS_COUNT_PATH = "/api/admin/users-count";
const PRODUCTS_COUNT_PATH = "/api/admin/products-count";

function sendJson(
  res: import("node:http").ServerResponse,
  status: number,
  body: Record<string, unknown>,
): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function adminUsersCountPlugin(): Plugin {
  return {
    name: "admin-users-count-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0];
        const isUsers = pathname === USERS_COUNT_PATH;
        const isProducts = pathname === PRODUCTS_COUNT_PATH;

        if (!isUsers && !isProducts) {
          next();
          return;
        }

        if (req.method !== "GET" && req.method !== "HEAD") {
          sendJson(res, 405, { error: "Method not allowed." });
          return;
        }

        const env = loadEnv(server.config.mode, process.cwd(), "");

        if (isUsers) {
          const mock = env.VITE_ADMIN_USERS_COUNT_MOCK?.trim();
          if (mock) {
            const count = Number.parseInt(mock, 10);
            if (Number.isFinite(count) && count >= 0) {
              sendJson(res, 200, { count, table: "Users (mock)" });
              return;
            }
          }
        }

        if (isProducts) {
          const mock = env.VITE_ADMIN_PRODUCTS_COUNT_MOCK?.trim();
          if (mock) {
            const count = Number.parseInt(mock, 10);
            if (Number.isFinite(count) && count >= 0) {
              sendJson(res, 200, { count, table: "Products (mock)" });
              return;
            }
          }
        }

        try {
          const result = isProducts
            ? await fetchProductsCountFromUpstream()
            : await fetchUsersCountFromUpstream();
          sendJson(res, 200, result);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Učitavanje nije uspjelo.";
          const is404 = message.includes("404");
          const resource = isProducts ? "proizvoda" : "korisnika";
          sendJson(res, is404 ? 404 : 502, {
            error: is404
              ? `AWS endpoint za broj ${resource} ne postoji (404). Deployaj Lambda get-users-count (ruta /admin/${isProducts ? "products" : "users"}/count) i postavi odgovarajući URL u .env.`
              : message,
          });
        }
      });
    },
  };
}

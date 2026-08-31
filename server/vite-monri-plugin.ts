import type { Plugin } from "vite";
import { loadEnv } from "vite";
import { handleMonriCallbackRequest } from "./api-lib/monri-callback-handler.js";
import { handleMonriSessionRequest } from "./api-lib/monri-session-handler.js";
import { handleMonriVerifyRequest } from "./api-lib/monri-verify-handler.js";

const SESSION_PATH = "/api/payments/monri/session";
const CALLBACK_PATH = "/api/payments/monri/callback";
const VERIFY_PATH = "/api/payments/monri/verify";

export function monriPlugin(): Plugin {
  return {
    name: "monri-payments-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (
          pathname !== SESSION_PATH &&
          pathname !== CALLBACK_PATH &&
          pathname !== VERIFY_PATH
        ) {
          next();
          return;
        }

        const envVars = loadEnv(server.config.mode, process.cwd(), "");

        try {
          if (pathname === SESSION_PATH) {
            await handleMonriSessionRequest(req, res, envVars);
            return;
          }
          if (pathname === CALLBACK_PATH) {
            await handleMonriCallbackRequest(req, res, envVars);
            return;
          }
          await handleMonriVerifyRequest(req, res, envVars);
        } catch (err) {
          console.error("[monri]", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Došlo je do greške." }));
          }
        }
      });
    },
  };
}

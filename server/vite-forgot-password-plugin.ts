import type { Plugin } from "vite";
import { loadEnv } from "vite";
import {
  handleForgotPasswordRequest,
  loadForgotPasswordEnv,
} from "../server/api-lib/forgot-password-handler.js";
import {
  handleResetPasswordRequest,
  handleValidateResetTokenRequest,
  loadResetPasswordEnv,
} from "../server/api-lib/reset-password-handler.js";

const FORGOT_PASSWORD_PATH = "/api/forgot-password";
const VALIDATE_RESET_TOKEN_PATH = "/api/reset-password/validate";
const RESET_PASSWORD_PATH = "/api/reset-password";

function sendConfigError(res: import("node:http").ServerResponse): void {
  res.statusCode = 503;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      error:
        "Password reset API nije konfiguriran. Dodaj RESEND_API_KEY i PASSWORD_RESET_JWT_SECRET u .env.",
    }),
  );
}

export function forgotPasswordPlugin(): Plugin {
  return {
    name: "password-reset-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0];

        if (
          pathname !== FORGOT_PASSWORD_PATH &&
          pathname !== VALIDATE_RESET_TOKEN_PATH &&
          pathname !== RESET_PASSWORD_PATH
        ) {
          next();
          return;
        }

        const envVars = loadEnv(server.config.mode, process.cwd(), "");

        try {
          if (pathname === FORGOT_PASSWORD_PATH) {
            const env = loadForgotPasswordEnv(envVars);
            if (!env) {
              sendConfigError(res);
              return;
            }
            await handleForgotPasswordRequest(req, res, env);
            return;
          }

          const resetEnv = loadResetPasswordEnv(envVars);
          if (!resetEnv) {
            sendConfigError(res);
            return;
          }

          if (pathname === VALIDATE_RESET_TOKEN_PATH) {
            await handleValidateResetTokenRequest(req, res, resetEnv);
            return;
          }

          await handleResetPasswordRequest(req, res, resetEnv);
        } catch {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Došlo je do greške." }));
        }
      });
    },
  };
}

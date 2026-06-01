import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  handleValidateResetTokenRequest,
  loadResetPasswordEnv,
} from "../lib/reset-password-handler.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const env = loadResetPasswordEnv(process.env as Record<string, string>);
  if (!env) {
    res.status(503).json({
      error:
        "Password reset API nije konfiguriran. Dodaj PASSWORD_RESET_JWT_SECRET u Vercel env.",
    });
    return;
  }

  try {
    await handleValidateResetTokenRequest(req, res, env);
  } catch (err) {
    console.error(
      "[reset-password/validate] Unhandled error:",
      err instanceof Error ? err.message : err,
    );
    if (!res.headersSent) {
      res.status(500).json({ error: "Došlo je do greške." });
    }
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  handleForgotPasswordRequest,
  loadForgotPasswordEnv,
} from "../server/forgot-password-handler";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const env = loadForgotPasswordEnv(process.env as Record<string, string>);
  if (!env) {
    res.status(503).json({
      error:
        "Password reset API nije konfiguriran. U Vercel postavite RESEND_API_KEY i PASSWORD_RESET_JWT_SECRET.",
    });
    return;
  }

  try {
    await handleForgotPasswordRequest(req, res, env);
  } catch (err) {
    console.error(
      "[forgot-password] Unhandled error:",
      err instanceof Error ? err.message : err,
    );
    if (!res.headersSent) {
      res.status(500).json({
        error: "Došlo je do greške. Pokušajte ponovo.",
      });
    }
  }
}

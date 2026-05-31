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
        "Password reset API nije konfiguriran. Dodaj RESEND_API_KEY i PASSWORD_RESET_JWT_SECRET u Vercel env.",
    });
    return;
  }

  await handleForgotPasswordRequest(req, res, env);
}

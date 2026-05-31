import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  handleValidateResetTokenRequest,
  loadResetPasswordEnv,
} from "../../server/reset-password-handler";

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

  await handleValidateResetTokenRequest(req, res, env);
}

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { forgotPasswordPlugin } from "./server/vite-forgot-password-plugin";

const firebaseAuthTarget =
  "https://ai8hjf2fsc.execute-api.eu-central-1.amazonaws.com/dev";

const userProfileTarget =
  "https://4uyux7zjrf.execute-api.eu-central-1.amazonaws.com/dev";

const profileApiTarget =
  "https://2gajkkmi0d.execute-api.eu-central-1.amazonaws.com/dev";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), forgotPasswordPlugin()],
  envPrefix: ["VITE_", "EXPO_PUBLIC_"],
  server: {
    proxy: {
      "/api/firebase-auth": {
        target: firebaseAuthTarget,
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/firebase-auth\/?$/, "/auth/firebase"),
      },
      "/api/user-profile": {
        target: userProfileTarget,
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/user-profile\/?$/, "/user/profile"),
      },
      "/api/profile-api": {
        target: profileApiTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/profile-api/, ""),
      },
    },
  },
});

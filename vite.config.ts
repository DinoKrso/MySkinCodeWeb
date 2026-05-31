import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { forgotPasswordPlugin } from "./server/vite-forgot-password-plugin";
import { apiTargets } from "./server/api-targets";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), forgotPasswordPlugin()],
  envPrefix: ["VITE_", "EXPO_PUBLIC_"],
  server: {
    proxy: {
      "/api/login": {
        target: apiTargets.loginApi,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/login\/?$/, "/login"),
      },
      "/api/check-email": {
        target: apiTargets.loginApi,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/check-email\/?$/, "/check-email"),
      },
      "/api/firebase-auth": {
        target: apiTargets.firebaseAuthApi,
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/firebase-auth\/?$/, "/auth/firebase"),
      },
      "/api/firebase-signup": {
        target: apiTargets.firebaseAuthApi,
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/firebase-signup\/?$/, "/signup/firebase"),
      },
      "/api/user-profile": {
        target: apiTargets.userProfileApi,
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/user-profile\/?$/, "/user/profile"),
      },
      "/api/profile-api": {
        target: apiTargets.profileApi,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/profile-api/, ""),
      },
      "/api/active-routine": {
        target: apiTargets.activeRoutineApi,
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/active-routine\/?$/, "/routine/active"),
      },
    },
  },
});

import path from "node:path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { forgotPasswordPlugin } from "./server/vite-forgot-password-plugin";
import { adminUsersCountPlugin } from "./server/vite-admin-users-count-plugin";
import { adminProductsPlugin } from "./server/vite-admin-products-plugin";
import { adminProductImagePlugin } from "./server/vite-admin-product-image-plugin";
import { apiTargets } from "./server/api-lib/api-targets";

/** Serve static privacy.html at /privacy (no JS required — App Store review). */
function staticPrivacyPlugin(): Plugin {
  const rewrite = (
    req: { url?: string },
    _res: unknown,
    next: () => void,
  ) => {
    const url = req.url?.split("?")[0];
    if (url === "/privacy" || url === "/privacy/") {
      req.url = "/privacy.html";
    }
    next();
  };

  return {
    name: "static-privacy",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      staticPrivacyPlugin(),
      forgotPasswordPlugin(),
      adminUsersCountPlugin(),
      adminProductsPlugin(),
      adminProductImagePlugin(),
    ],
    envPrefix: ["VITE_", "EXPO_PUBLIC_"],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
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
        "/api/delete-user": {
          target: apiTargets.userProfileApi,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/delete-user/, "/user"),
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
  };
});

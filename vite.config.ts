import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null, // Disable auto-injection to use custom sw-push.js
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "robots.txt", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "Conversy - Vendas no Telegram",
        short_name: "Conversy",
        description: "Automatize suas vendas de produtos digitais no Telegram",
        theme_color: "#F08936",
        background_color: "#0d0d0d",
        display: "standalone",
        start_url: "/dashboard",
        scope: "/",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.telegram\.org\/.*/i,
            handler: "NetworkOnly",
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
        ],
        // Don't precache sw-push.js - it's registered separately
        navigateFallbackDenylist: [/^\/sw-push\.js$/],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

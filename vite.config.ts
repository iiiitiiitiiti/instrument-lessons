/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import { VitePWA } from "vite-plugin-pwa";

const base = "/instrument-lessons/";

export default defineConfig({
  base,
  plugins: [
    { enforce: "pre", ...mdx({ remarkPlugins: [remarkGfm], providerImportSource: "@mdx-js/react" }) },
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "apple-touch-icon.png"],
      manifest: {
        id: base,
        name: "楽器のはじめかた",
        short_name: "楽器",
        description: "楽器に触れたことのない人が、独習で弾けるようになるための教材",
        lang: "ja",
        display: "standalone",
        orientation: "portrait",
        start_url: base,
        scope: base,
        theme_color: "#1d6f6a",
        background_color: "#fcfbf7",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml" },
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
      },
      workbox: {
        navigateFallback: "index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
  },
});

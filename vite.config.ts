/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";

const base = "/instrument-lessons/";

export default defineConfig({
  base,
  plugins: [
    { enforce: "pre", ...mdx({ remarkPlugins: [remarkGfm], providerImportSource: "@mdx-js/react" }) },
    react(),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
  },
});

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: "src/main.ts",
      output: {
        dir: "dist",
        entryFileNames: "datetime-card.js",
        format: "iife",
      },
    },
    sourcemap: true,
    target: "esnext",
  },
});

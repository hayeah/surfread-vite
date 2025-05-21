import path from "path"

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  assetsInclude: ["**/*.wasm"],
  optimizeDeps: { exclude: ["@electric-sql/pglite", "wa-sqlite"] },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // "wa-sqlite/dist": path.resolve(__dirname, "./node_modules/wa-sqlite/dist"),
    },
  },
})

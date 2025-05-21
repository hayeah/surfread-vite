import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["**/*.{test,spec}.{ts,tsx}"], // File pattern for browser tests
    exclude: [
      "node_modules",
      "**/*.jsdom.{test,spec}.{ts,tsx}",
      "**/*.browser.{test,spec}.{ts,tsx}",
    ],
  },
})

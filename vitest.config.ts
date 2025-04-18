/// <reference types="vitest/globals" />

import { resolve } from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom", // For simulating the DOM in the browser
    globals: true, // Enable global test functions like `describe`, `it`
    coverage: {
      // Coverage report formats

      exclude: [
        "**/components/ui/**",
        "**/.next/**",
        "**/node_modules/**",
        "**.config.*",
        "**/lib/auth/**",
        "**/lib/posthog/**",
        "**/lib/providers/**",
        "**/lib/utils/**",
        "**/stores/**",
        "**/app/**",
        "**/components/**",
        "**/hooks/**",
        "**/cypress/**",
        "**/helpers/**",
        "**/lib/seed/**",
      ], // Exclude certain directories from coverage
    },
    setupFiles: ["./tests/mocks/prisma-mock.ts", "./tests/mocks/auth-mock.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"), // Map "@" to the project root directory
    },
  },
})

import { defineConfig } from "@playwright/test";

// End-to-end smoke tests. The Anthropic API is mocked in each test, so no key is needed.
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:4173/" },
  webServer: {
    command: "npm run build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173/",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

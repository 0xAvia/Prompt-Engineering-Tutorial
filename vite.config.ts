import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The site is served from https://<user>.github.io/Prompt-Engineering-Tutorial/
// Override with BASE_PATH=/ for other hosts.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/Prompt-Engineering-Tutorial/",
  plugins: [react(), tailwindcss()],
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});

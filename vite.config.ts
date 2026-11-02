import { createHash } from "node:crypto";
import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Bakes a Content-Security-Policy into the built index.html (GitHub Pages can't set
 * response headers). Scripts may only come from this site, and the page may only talk
 * to Anthropic's API, so even an injected script could not send a learner's key
 * anywhere else. Dev mode is left alone so HMR keeps working.
 */
function cspMeta(): Plugin {
  return {
    name: "csp-meta",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        // Allow the tiny inline theme script by hash, so no 'unsafe-inline' for scripts.
        const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
          (m) => `'sha256-${createHash("sha256").update(m[1]).digest("base64")}'`,
        );
        const csp = [
          "default-src 'self'",
          ["script-src 'self'", ...hashes].join(" "),
          "style-src 'self' 'unsafe-inline'", // the editor injects its own <style> elements
          "img-src 'self' data:",
          "font-src 'self' data:", // Vite inlines tiny font subsets as data: URIs
          "connect-src 'self' https://api.anthropic.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; ");
        return [{ tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: csp }, injectTo: "head-prepend" }];
      },
    },
  };
}

// Relative asset paths, so the same build works at any URL: https://<owner>.github.io/<repo>/,
// a custom domain, or a subfolder, and it keeps working if the repo is renamed. Hash routing
// means the page is always the site folder's index.html. Set BASE_PATH to pin an absolute base.
export default defineConfig({
  base: process.env.BASE_PATH ?? "./",
  plugins: [react(), tailwindcss(), cspMeta()],
  // The editor and the Claude SDK are big, but they load only on lesson pages.
  build: { chunkSizeWarningLimit: 700 },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});

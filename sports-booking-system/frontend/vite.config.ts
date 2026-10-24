import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      cookie: path.resolve(__dirname, "src/shims/cookie.ts"),
      "set-cookie-parser": path.resolve(__dirname, "src/shims/set-cookie-parser.ts"),
      "void-elements": path.resolve(__dirname, "src/shims/void-elements.ts")
    }
  }
});

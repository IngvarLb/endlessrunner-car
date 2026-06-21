import { defineConfig } from "vite";

// GitHub Pages serves this project repo under /<repo>/, so the production build
// needs that base path. Dev stays at "/" for convenience.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/endlessrunner-car/" : "/",
  server: {
    host: "0.0.0.0",
    port: 5173
  }
}));

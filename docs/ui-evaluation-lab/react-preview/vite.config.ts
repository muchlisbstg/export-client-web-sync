import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages serves this project under a repository subpath.
  // Vercel serves the preview from the domain root.
  base: process.env.GITHUB_ACTIONS === "true" ? "/export-client-web-sync/" : "/",
  plugins: [react()],
});

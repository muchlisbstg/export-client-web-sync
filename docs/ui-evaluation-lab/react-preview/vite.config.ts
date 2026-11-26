import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const runtimeProcess = (globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
}).process;
const isGitHubActions = runtimeProcess?.env?.GITHUB_ACTIONS === "true";

export default defineConfig({
  // GitHub Pages serves this project under a repository subpath.
  // Vercel serves the preview from the domain root.
  base: isGitHubActions ? "/export-client-web-sync/" : "/",
  plugins: [react()],
});

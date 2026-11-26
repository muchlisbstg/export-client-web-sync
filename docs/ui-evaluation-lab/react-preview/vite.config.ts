import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/export-client-web-sync/",
  plugins: [react()],
});
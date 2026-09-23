import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (/[\\/]react(-dom)?[\\/]|[\\/]scheduler[\\/]|@tanstack/.test(id)) return "react";
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("recharts") || id.includes("d3-") || id.includes("victory-vendor"))
              return "charts";
            if (id.includes("@radix-ui")) return "radix";
            if (id.includes("lucide")) return "icons";
            return "vendor";
          }
          if (id.includes(`${path.sep}src${path.sep}engine${path.sep}`)) {
            if (id.includes(`${path.sep}systems${path.sep}`)) return "engine-systems";
            return "engine";
          }
        },
      },
    },
  },
}));

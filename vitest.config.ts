import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/test/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/engine/**/*.{ts,tsx}", "src/persistence/**/*.{ts,tsx}", "src/store/**/*.{ts,tsx}"],
      exclude: ["src/test/**", "src/**/*.d.ts", "src/engine/types.ts"],
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});

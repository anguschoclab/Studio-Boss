import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    TanStackRouterVite(),
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('recharts')) return 'vendor-recharts';
          if (id.includes('framer-motion')) return 'vendor-framer';
          if (id.includes('sonner')) return 'vendor-sonner';
          if (id.includes('cmdk')) return 'vendor-cmdk';
          
          // Group Radix UI components to avoid circular dependencies
          if (id.includes('@radix-ui')) {
            if (id.includes('react-slot') || id.includes('react-label') || 
                id.includes('react-separator') || id.includes('react-progress') ||
                id.includes('react-dialog') || id.includes('react-popover') ||
                id.includes('react-tooltip') || id.includes('react-alert-dialog') ||
                id.includes('react-dropdown-menu') || id.includes('react-context-menu')) {
              return 'vendor-radix-core';
            }
            if (id.includes('react-checkbox') || id.includes('react-radio-group') ||
                id.includes('react-select') || id.includes('react-switch') ||
                id.includes('react-slider') || id.includes('react-tabs') ||
                id.includes('react-toggle') || id.includes('react-toggle-group')) {
              return 'vendor-radix-inputs';
            }
            if (id.includes('react-accordion') || id.includes('react-aspect-ratio') ||
                id.includes('react-avatar') || id.includes('react-collapsible') ||
                id.includes('react-hover-card') || id.includes('react-scroll-area') ||
                id.includes('react-menubar') || id.includes('react-navigation-menu')) {
              return 'vendor-radix-layout';
            }
            if (id.includes('react-toast')) {
              return 'vendor-radix-feedback';
            }
            return 'vendor-radix-core';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
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
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "favicon.ico",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
      ],
      manifest: {
        name: "Studio Boss",
        short_name: "Studio Boss",
        description: "A premium Hollywood studio management simulation",
        theme_color: "#0a0e1a",
        background_color: "#0a0e1a",
        display: "standalone",
        orientation: "landscape",
        start_url: "/",
        scope: "/",
        categories: ["games", "entertainment"],
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "wide",
          },
        ],
      },
      workbox: {
        // Cache everything needed for offline play
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot}"],
        // Runtime caching: anything else fetched at runtime
        runtimeCaching: [
          {
            // Cache all same-origin navigation requests (SPA routes)
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "studio-boss-pages",
              networkTimeoutSeconds: 3,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Cache all JS/CSS/image assets
            urlPattern: ({ request }) =>
              ["script", "style", "image", "font"].includes(request.destination),
            handler: "CacheFirst",
            options: {
              cacheName: "studio-boss-assets",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // Offline fallback for navigations that fail
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        // Skip waiting so new SW activates immediately
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        // Enable PWA in dev so you can test it on localhost
        enabled: true,
        type: "module",
      },
      strategies: "generateSW",
    }),
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

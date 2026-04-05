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
    }),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-recharts': ['recharts'],
          'vendor-framer': ['framer-motion'],
          'vendor-radix': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],
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

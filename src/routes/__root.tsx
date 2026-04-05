import { createRootRoute, Outlet } from '@tanstack/react-router';
import { GlobalThemeProvider } from '../components/Theme/GlobalThemeProvider';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { InstallPrompt } from "../components/pwa/InstallPrompt";
import { LazyMotion, domAnimation } from "framer-motion";
import NotFound from "../pages/NotFound";

export const Route = createRootRoute({
  component: () => (
    <GlobalThemeProvider>
      <LazyMotion features={domAnimation}>
        <Outlet />
        <Toaster />
        <Sonner />
        <InstallPrompt />
      </LazyMotion>
    </GlobalThemeProvider>
  ),
  notFoundComponent: () => <NotFound />
});

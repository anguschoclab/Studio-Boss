import { createRootRoute, Outlet } from '@tanstack/react-router';
import { GlobalThemeProvider } from '../components/Theme/GlobalThemeProvider';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { LazyMotion, domAnimation } from "framer-motion";
import NotFound from "../pages/NotFound";
import { TitleBar } from "@/components/electron/TitleBar";

export const Route = createRootRoute({
  component: () => (
    <>
      <GlobalThemeProvider>
        <TitleBar />
        <Sonner />
        <Toaster />
        <LazyMotion features={domAnimation}>
          <Outlet />
        </LazyMotion>
      </GlobalThemeProvider>
    </>
  ),
  notFoundComponent: () => <NotFound />
});

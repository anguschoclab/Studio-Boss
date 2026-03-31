import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TitleScreen from "./pages/TitleScreen";
import NewGame from "./pages/NewGame";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { useArchetypeTheme } from "./hooks/useArchetypeTheme";

const queryClient = new QueryClient();

import { GlobalThemeProvider } from "./components/Theme/GlobalThemeProvider";

const rootRoute = createRootRoute({
  component: () => (
    <GlobalThemeProvider>
      <Outlet />
      <Toaster />
      <Sonner />
    </GlobalThemeProvider>
  ),
  notFoundComponent: () => <NotFound />
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: TitleScreen,
  validateSearch: (search: Record<string, unknown>) => ({
    autoStart: search.autoStart === 'true' || search.autoStart === true,
  }),
  beforeLoad: ({ search }) => {
    if (search.autoStart) {
      throw redirect({
        to: '/dashboard',
        search: { autoStart: true },
      });
    }
  },
});

const newGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new-game',
  component: NewGame,
  validateSearch: (search: Record<string, unknown>) => ({
    autoStart: search.autoStart === 'true' || search.autoStart === true,
  }),
  beforeLoad: ({ search }) => {
    if (search.autoStart) {
      throw redirect({
        to: '/dashboard',
        search: { autoStart: true },
      });
    }
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
  validateSearch: (search: Record<string, unknown>) => ({
    autoStart: search.autoStart === 'true' || search.autoStart === true,
  }),
});

const routeTree = rootRoute.addChildren([indexRoute, newGameRoute, dashboardRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

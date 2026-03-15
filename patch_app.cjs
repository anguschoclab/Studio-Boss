const fs = require('fs');

const content = `import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter, createRoute, createRootRoute } from "@tanstack/react-router";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TitleScreen from "./pages/TitleScreen";
import NewGame from "./pages/NewGame";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { useArchetypeTheme } from "./hooks/useArchetypeTheme";

const queryClient = new QueryClient();

const ThemeApplier = () => {
  useArchetypeTheme();
  return null;
};

const rootRoute = createRootRoute({
  component: () => (
    <>
      <ThemeApplier />
      <Toaster />
      <Sonner />
    </>
  ),
  notFoundComponent: () => <NotFound />
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: TitleScreen,
});

const newGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new-game',
  component: NewGame,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
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
`;

fs.writeFileSync('src/App.tsx', content);

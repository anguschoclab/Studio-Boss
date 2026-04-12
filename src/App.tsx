import { RouterProvider, createRouter } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { KeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create the router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const App = () => (
  <KeyboardShortcuts>
    <TooltipProvider delayDuration={300}>
      <RouterProvider router={router} />
    </TooltipProvider>
  </KeyboardShortcuts>
);

export default App;

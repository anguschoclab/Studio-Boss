import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "@/App";

// Make ResizeObserver a mock to prevent Recharts/Radix issues in JSDOM
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe("App", () => {
  it("renders the main application without crashing", async () => {
    render(<App />);

    // Wait for the initial TitleScreen rendered by the router at path '/'
    await waitFor(() => {
      // Use queryAllByText because "STUDIO" matches the h1 and "A Hollywood Studio..." paragraph
      const studioElements = screen.queryAllByText(/STUDIO/i);
      expect(studioElements.length).toBeGreaterThan(0);

      const bossElements = screen.queryAllByText(/BOSS/i);
      expect(bossElements.length).toBeGreaterThan(0);
    });
  });
});

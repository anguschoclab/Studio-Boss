import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const ThrowingChild: React.FC<{ message: string }> = ({ message }) => {
  throw new Error(message);
};

const SafeChild: React.FC = () => <div data-testid="safe-child">Safe content</div>;

describe("ErrorBoundary Dashboard Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("catches errors from tab content and renders fallback UI", () => {
    const suppressError = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingChild message="Tab render failed" />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Reload Page")).toBeInTheDocument();
    suppressError.mockRestore();
  });

  it("renders normal content when no error occurs", () => {
    render(
      <ErrorBoundary>
        <SafeChild />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("safe-child")).toBeInTheDocument();
  });

  it("recovers when key changes (simulates tab switch)", () => {
    const suppressError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(
      <ErrorBoundary key="tab-1">
        <ThrowingChild message="Tab 1 crashed" />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    rerender(
      <ErrorBoundary key="tab-2">
        <SafeChild />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("safe-child")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
    suppressError.mockRestore();
  });
});

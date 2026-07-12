import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const ThrowingChild: React.FC<{ message: string }> = ({ message }) => {
  throw new Error(message);
};

const SafeChild: React.FC = () => <div data-testid="safe-child">Safe content</div>;

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <SafeChild />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("safe-child")).toBeInTheDocument();
  });

  it("renders fallback when provided and error occurs", () => {
    const suppressError = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom fallback</div>}>
        <ThrowingChild message="Database connection failed" />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    suppressError.mockRestore();
  });

  it("renders default error UI with generic message when error occurs", () => {
    const suppressError = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingChild message="INTERNAL_SECRET_KEY_LEAKED_12345" />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    suppressError.mockRestore();
  });

  it("does NOT expose the raw error message to the user", () => {
    const suppressError = vi.spyOn(console, "error").mockImplementation(() => {});
    const secret = "INTERNAL_SECRET_KEY_LEAKED_12345";
    render(
      <ErrorBoundary>
        <ThrowingChild message={secret} />
      </ErrorBoundary>
    );
    const errorBoundaryText = document.body.textContent || "";
    expect(errorBoundaryText).not.toContain(secret);
    suppressError.mockRestore();
  });

  it("shows a reload button", () => {
    const suppressError = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingChild message="Some error" />
      </ErrorBoundary>
    );
    expect(screen.getByText("Reload Page")).toBeInTheDocument();
    suppressError.mockRestore();
  });
});

import {describe, it, expect} from "vitest";
import {render, screen} from "@testing-library/react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Toast,
  ToastClose,
  ToastProvider,
  ToastViewport,
  ToastTitle,
} from "@/components/ui/toast";

// Decorative icons inside icon-only close buttons must be aria-hidden so
// screen readers announce only the button's accessible name once.
describe("Close buttons — decorative icon accessibility", () => {
  it("Dialog close icon is aria-hidden with sr-only fallback text", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Desc</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    const closeButton = screen.getByRole("button", { name: /close/i });
    const icon = closeButton.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(closeButton.querySelector(".sr-only")).toHaveTextContent("Close");
  });

  it("Sheet close icon is aria-hidden with sr-only fallback text", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
        </SheetContent>
      </Sheet>
    );
    const closeButton = screen.getByRole("button", { name: /close/i });
    const icon = closeButton.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(closeButton.querySelector(".sr-only")).toHaveTextContent("Close");
  });

  it("ToastClose icon is aria-hidden", () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Notice</ToastTitle>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    // ToastClose renders an icon-only button (no accessible name) — find it by
    // its svg rather than by name.
    const closeButton = screen
      .getAllByRole("button")
      .find((b) => b.querySelector("svg") !== null);
    expect(closeButton).not.toBeNull();
    const icon = closeButton!.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });
});

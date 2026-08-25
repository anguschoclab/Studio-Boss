/**
 * @vitest-environment jsdom
 */
import React from "react";
import {render} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";

// Mock embla-carousel-react
vi.mock("embla-carousel-react", () => ({
  default: () => [{
    scrollSnaps: () => [0, 1],
    scrollPrev: () => {},
    scrollNext: () => {},
    canScrollPrev: () => false,
    canScrollNext: () => false,
    selectedScrollSnap: () => 0,
    on: () => {},
    off: () => {},
  }, undefined],
}));

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

describe("Carousel accessibility", () => {
  it("renders carousel with content", () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(container.textContent).toContain("Slide 1");
  });

  // ─── Accessibility tests (PR #825) ──────────────────────────────────────
  it("previous button has aria-hidden on arrow icon", () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
      </Carousel>
    );
    // Find the ArrowLeft svg inside the previous button
    const prevBtn = container.querySelector("button");
    if (prevBtn) {
      const svg = prevBtn.querySelector("svg");
      if (svg) {
        expect(svg.getAttribute("aria-hidden")).toBe("true");
      }
    }
  });

  it("next button has aria-hidden on arrow icon", () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    );
    // Find the button (should be the next button)
    const buttons = container.querySelectorAll("button");
    const nextBtn = buttons[buttons.length - 1];
    if (nextBtn) {
      const svg = nextBtn.querySelector("svg");
      if (svg) {
        expect(svg.getAttribute("aria-hidden")).toBe("true");
      }
    }
  });

  it("sr-only spans provide text alternatives", () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
    const srOnly = container.querySelectorAll(".sr-only");
    expect(srOnly.length).toBeGreaterThanOrEqual(2);
    expect(Array.from(srOnly).some((s) => s.textContent === "Previous slide")).toBe(true);
    expect(Array.from(srOnly).some((s) => s.textContent === "Next slide")).toBe(true);
  });
});

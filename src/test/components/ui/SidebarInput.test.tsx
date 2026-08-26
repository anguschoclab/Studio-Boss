/**
 * @vitest-environment jsdom
 */
import React from "react";
import {render} from "@testing-library/react";
import {describe, it, expect} from "vitest";
import {SidebarInput} from "@/components/ui/sidebar";

describe("SidebarInput", () => {
  it("renders an input element", () => {
    const { container } = render(<SidebarInput />);
    const input = container.querySelector("input");
    expect(input).toBeInTheDocument();
  });

  it("has data-sidebar='input' attribute", () => {
    const { container } = render(<SidebarInput />);
    const input = container.querySelector("input");
    expect(input?.getAttribute("data-sidebar")).toBe("input");
  });

  // ─── Security tests (PR #830 / #821) ────────────────────────────────────
  describe("maxLength security", () => {
    it("renders with maxLength=100", () => {
      const { container } = render(<SidebarInput />);
      const input = container.querySelector("input");
      expect(input?.getAttribute("maxlength")).toBe("100");
    });

    it("allows override via props", () => {
      const { container } = render(<SidebarInput maxLength={200} />);
      const input = container.querySelector("input");
      expect(input?.getAttribute("maxlength")).toBe("200");
    });
  });
});

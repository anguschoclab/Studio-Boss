/**
 * @vitest-environment jsdom
 */
import React from "react";
import {render} from "@testing-library/react";
import {describe, it, expect} from "vitest";
import {Input} from "@/components/ui/input";

describe("Input", () => {
  it("renders an input element", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("input");
    expect(input).toBeInTheDocument();
  });

  it("passes through type prop", () => {
    const { container } = render(<Input type="email" />);
    const input = container.querySelector("input");
    expect(input?.getAttribute("type")).toBe("email");
  });

  it("passes through placeholder prop", () => {
    const { container } = render(<Input placeholder="Enter text" />);
    const input = container.querySelector("input");
    expect(input?.getAttribute("placeholder")).toBe("Enter text");
  });

  it("passes through className prop", () => {
    const { container } = render(<Input className="custom-class" />);
    const input = container.querySelector("input");
    expect(input?.className).toContain("custom-class");
  });

  // ─── Security tests (PR #833) ───────────────────────────────────────────
  describe("maxLength security", () => {
    it("renders with default maxLength=255 when no prop provided", () => {
      const { container } = render(<Input />);
      const input = container.querySelector("input");
      expect(input?.getAttribute("maxlength")).toBe("255");
    });

    it("respects explicit maxLength prop over default", () => {
      const { container } = render(<Input maxLength={500} />);
      const input = container.querySelector("input");
      expect(input?.getAttribute("maxlength")).toBe("500");
    });

    it("allows maxLength=0 to override default", () => {
      const { container } = render(<Input maxLength={0} />);
      const input = container.querySelector("input");
      expect(input?.getAttribute("maxlength")).toBe("0");
    });

    it("passes through other props correctly alongside maxLength", () => {
      const { container } = render(
        <Input maxLength={100} placeholder="Test" disabled />
      );
      const input = container.querySelector("input");
      expect(input?.getAttribute("maxlength")).toBe("100");
      expect(input?.getAttribute("placeholder")).toBe("Test");
      expect(input?.hasAttribute("disabled")).toBe(true);
    });
  });
});

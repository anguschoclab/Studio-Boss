/**
 * @vitest-environment jsdom
 */
import React from "react";
import {render, screen} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {SubNav, SubNavTab} from "@/components/navigation/SubNav";

describe("SubNav", () => {
  const tabs: SubNavTab[] = [
    { id: "tab1", label: "Overview" },
    { id: "tab2", label: "Details" },
    { id: "tab3", label: "Settings" },
  ];

  it("renders all tab labels", () => {
    render(<SubNav tabs={tabs} activeTab="tab1" onChange={() => {}} />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("calls onChange when a tab is clicked", () => {
    const handleChange = vi.fn();
    render(<SubNav tabs={tabs} activeTab="tab1" onChange={handleChange} />);
    screen.getByText("Details").click();
    expect(handleChange).toHaveBeenCalledWith("tab2");
  });

  // ─── Accessibility tests (PR #827) ──────────────────────────────────────
  describe("accessibility", () => {
    it("tab buttons have aria-label matching tab label", () => {
      render(<SubNav tabs={tabs} activeTab="tab1" onChange={() => {}} />);
      const tab1 = screen.getByText("Overview").closest("button");
      expect(tab1?.getAttribute("aria-label")).toBe("Overview");
    });

    it("active tab has aria-pressed='true'", () => {
      render(<SubNav tabs={tabs} activeTab="tab2" onChange={() => {}} />);
      const tab2 = screen.getByText("Details").closest("button");
      expect(tab2?.getAttribute("aria-pressed")).toBe("true");
    });

    it("inactive tabs have aria-pressed='false'", () => {
      render(<SubNav tabs={tabs} activeTab="tab2" onChange={() => {}} />);
      const tab1 = screen.getByText("Overview").closest("button");
      expect(tab1?.getAttribute("aria-pressed")).toBe("false");
    });

    it("tab buttons have role='tab'", () => {
      render(<SubNav tabs={tabs} activeTab="tab1" onChange={() => {}} />);
      const tab1 = screen.getByText("Overview").closest("button");
      expect(tab1?.getAttribute("role")).toBe("tab");
    });

    it("parent container has role='tablist'", () => {
      const { container } = render(
        <SubNav tabs={tabs} activeTab="tab1" onChange={() => {}} />
      );
      // The parent div of the tab buttons should have role="tablist"
      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toBeInTheDocument();
    });
  });
});

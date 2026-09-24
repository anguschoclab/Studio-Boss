import {render, screen} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {ProjectCastingTab} from "@/components/modals/tabs/ProjectCastingTab";
import {Tabs} from "@/components/ui/tabs";
import {createMockProject, createMockTalent} from "../../../utils/mockFactories";
import {Talent} from "@/engine/types";

vi.mock("@/components/talent/CastingFeedback", () => ({
  CastingFeedback: ({ talent }: { talent: Talent }) => (
    <div data-testid="casting-feedback">{talent.name}</div>
  ),
}));

// Radix Select needs pointer APIs jsdom lacks
if (typeof window !== "undefined") {
  (window as any).PointerEvent = class PointerEvent extends Event {
    constructor(type: string, props: any = {}) {
      super(type, props);
    }
  };
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
}

const attached = createMockTalent({ id: "t-attached", name: "Attached Director", prestige: 85 });
const available = createMockTalent({ id: "t-avail", name: "Free Agent", fee: 2_000_000 });

function renderTab(project = createMockProject({ state: "development" }), onCast = vi.fn()) {
  const roleGroups = new Map<string, { attached: Talent[]; available: Talent[] }>([
    ["director", { attached: [attached], available: [available] }],
    ["writer", { attached: [], available: [available] }],
  ]);
  const talentMap = new Map<string, Talent>([
    [attached.id, attached],
    [available.id, available],
  ]);
  return {
    onCast,
    ...render(
      <Tabs defaultValue="casting">
        <ProjectCastingTab
          project={project}
          roleGroups={roleGroups}
          talentMap={talentMap}
          cash={100_000_000}
          onCast={onCast}
        />
      </Tabs>
    ),
  };
}

describe("ProjectCastingTab", () => {
  it("renders the roster with attached and unsigned roles", () => {
    renderTab();
    expect(screen.getByText("Talent Roster")).toBeInTheDocument();
    expect(screen.getByText("director")).toBeInTheDocument();
    expect(screen.getByText("Attached Director")).toBeInTheDocument();
    expect(screen.getByText("★ 85")).toBeInTheDocument();
    expect(screen.getByText("writer")).toBeInTheDocument();
    expect(screen.getByText("Unsigned Representative")).toBeInTheDocument();
  });

  it("shows cast controls during development and the analysis placeholder", () => {
    renderTab(createMockProject({ state: "development" }));
    expect(screen.getAllByLabelText("Cast Role").length).toBe(2);
    expect(screen.getByText(/Hover over available talent/)).toBeInTheDocument();
  });

  it("hides cast controls for released projects", () => {
    renderTab(createMockProject({ state: "released" }));
    expect(screen.queryByLabelText("Cast Role")).not.toBeInTheDocument();
  });
});

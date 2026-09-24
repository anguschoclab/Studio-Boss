import {renderHook, act} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";
import {useCreateProjectForm} from "@/components/modals/create-project/useCreateProjectForm";
import {useUIStore} from "@/store/uiStore";
import {useGameStore} from "@/store/gameStore";
import {BUDGET_TIERS} from "@/engine/data/budgetTiers";
import {TV_FORMATS} from "@/engine/data/tvFormats";
import {UNSCRIPTED_FORMATS} from "@/engine/data/unscriptedFormats";

vi.mock("@/store/uiStore", () => ({ useUIStore: vi.fn() }));
vi.mock("@/store/gameStore", () => ({ useGameStore: vi.fn() }));
vi.mock("@/engine/generators/titles", () => ({
  generateProjectTitle: vi.fn(() => "Generated Test Title"),
}));

const mockCloseCreateProject = vi.fn();
const mockCreateProject = vi.fn();

function setup() {
  (useUIStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
    selector
      ? selector({ showCreateProject: true, closeCreateProject: mockCloseCreateProject })
      : { showCreateProject: true, closeCreateProject: mockCloseCreateProject }
  );
  (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
    selector ? selector({ createProject: mockCreateProject }) : { createProject: mockCreateProject }
  );
  return renderHook(() => useCreateProjectForm());
}

describe("useCreateProjectForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("autogenerates a title on open and exposes film-tier estimates", () => {
    const { result } = setup();
    expect(result.current.fields.title).toBe("Generated Test Title");
    const tier = BUDGET_TIERS.mid;
    expect(result.current.estimates.budget).toBe(tier.budget);
    expect(result.current.estimates.weeklyCost).toBe(tier.weeklyCost);
    expect(result.current.estimates.devWeeks).toBe(tier.developmentWeeks);
    expect(result.current.estimates.prodWeeks).toBe(tier.productionWeeks);
  });

  it("applies TV format multipliers to the estimates", () => {
    const { result } = setup();
    act(() => result.current.setters.setFormat("tv"));

    const tier = BUDGET_TIERS.mid;
    const tv = TV_FORMATS.prestige_drama;
    const episodes = 10;
    const weeklyCost = tier.weeklyCost * tv.productionCostMultiplier;
    const prodWeeks = Math.ceil(episodes * tv.productionWeeksPerEpisode);
    expect(result.current.estimates.weeklyCost).toBe(weeklyCost);
    expect(result.current.estimates.devWeeks).toBe(
      Math.ceil(tier.developmentWeeks * tv.developmentWeeksModifier)
    );
    expect(result.current.estimates.prodWeeks).toBe(prodWeeks);
    expect(result.current.estimates.budget).toBe(weeklyCost * prodWeeks + tier.budget * 0.2);
  });

  it("applies unscripted format multipliers to the estimates", () => {
    const { result } = setup();
    act(() => result.current.setters.setFormat("unscripted"));

    const tier = BUDGET_TIERS.mid;
    const u = UNSCRIPTED_FORMATS.competition;
    const episodes = 10;
    const weeklyCost = tier.weeklyCost * u.productionCostMultiplier;
    const prodWeeks = Math.ceil(episodes * u.productionWeeksPerEpisode);
    expect(result.current.estimates.weeklyCost).toBe(weeklyCost);
    expect(result.current.estimates.prodWeeks).toBe(prodWeeks);
    expect(result.current.estimates.budget).toBe(weeklyCost * prodWeeks + tier.budget * 0.1);
  });

  it("submits a film payload without series keys and resets title/flavor", () => {
    const { result } = setup();
    act(() => result.current.setters.setTitle("My Movie"));
    act(() => result.current.handleCreate());

    expect(mockCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({ title: "My Movie", format: "film", attachedTalentIds: [] })
    );
    const payload = mockCreateProject.mock.calls[0][0];
    expect(payload).not.toHaveProperty("tvFormat");
    expect(payload).not.toHaveProperty("episodes");
    expect(mockCloseCreateProject).toHaveBeenCalled();
    expect(result.current.fields.title).toBe("");
  });

  it("submits tv/unscripted payloads with their format-specific keys", () => {
    const { result } = setup();
    act(() => result.current.setters.setFormat("tv"));
    act(() => result.current.handleCreate());
    expect(mockCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        format: "tv",
        tvFormat: "prestige_drama",
        episodes: 10,
        releaseModel: "weekly",
      })
    );

    act(() => result.current.setters.setFormat("unscripted"));
    act(() => result.current.setters.setTitle("Reality Show"));
    act(() => result.current.handleCreate());
    expect(mockCreateProject).toHaveBeenLastCalledWith(
      expect.objectContaining({ format: "unscripted", unscriptedFormat: "competition" })
    );
    const payload = mockCreateProject.mock.calls[1][0];
    expect(payload).not.toHaveProperty("tvFormat");
  });

  it("is not submittable with a blank title", () => {
    const { result } = setup();
    act(() => result.current.setters.setTitle("   "));
    expect(result.current.canSubmit).toBe(false);
    act(() => result.current.handleCreate());
    expect(mockCreateProject).not.toHaveBeenCalled();
  });
});

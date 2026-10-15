import { describe, it, expect, beforeEach, vi } from "vitest";
import { useUIStore } from "@/store/uiStore";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";
import { advanceWeek } from "@/engine/core/weekAdvance";

// Mock only the heavy engine tick — the modal routing bridge inside
// doAdvanceWeek (MODAL_TRIGGERED -> ui.enqueueModal) runs for real.
vi.mock("@/engine/core/weekAdvance", () => ({
  advanceWeek: vi.fn(),
  resetAdvanceWeekCache: vi.fn(),
}));
vi.mock("@/persistence/autosave", () => ({
  queueAutosave: vi.fn(),
  invalidateAutosaves: vi.fn(),
}));

describe("distress flow: modal bridge (real doAdvanceWeek)", () => {
  beforeEach(() => {
    vi.mocked(advanceWeek).mockReturnValue({
      newState: { week: 2, entities: { rivals: {} } } as any,
      summary: { fromWeek: 1, toWeek: 2 } as any,
      impacts: [
        {
          type: "MODAL_TRIGGERED",
          payload: { modalType: "DISTRESSED_ASSET_OFFER", offerId: "o1" },
        },
      ],
    } as any);
    useUIStore.setState({ activeModal: null, modalQueue: [] } as any);
    useGameStore.setState({ gameState: { week: 1 } } as any);
    useSettingsStore.setState({ autosaveFrequency: "off" } as any);
  });

  it("a MODAL_TRIGGERED impact enqueues the offer modal with offerId in payload", () => {
    useGameStore.getState().doAdvanceWeek();

    const active = useUIStore.getState().activeModal;
    expect(active?.type).toBe("DISTRESSED_ASSET_OFFER");
    expect((active?.payload as { offerId: string }).offerId).toBe("o1");
  });
});

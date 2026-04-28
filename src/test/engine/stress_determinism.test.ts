import { expect, test, describe } from "vitest";
import { initializeGame } from "../../engine/core/gameInit";
import { WeekCoordinator } from "../../engine/services/WeekCoordinator";

const SEED = 67890;
const STUDIO_NAME = "Stress Test Studios";
const ARCHETYPE = "major";

describe("52-Week Determinism Stress Test", () => {
    test("should produce bit-identical results after 52 weeks of simulation", () => {
        const stateA = initializeGame(STUDIO_NAME, ARCHETYPE, SEED);
        const stateB = initializeGame(STUDIO_NAME, ARCHETYPE, SEED);

        // Week 0 comparison
        expect(stateA).toEqual(stateB);

        let currentStateA = stateA;
        let currentStateB = stateB;

        for (let week = 1; week <= 52; week++) {
            currentStateA = WeekCoordinator.execute(currentStateA).newState;
            currentStateB = WeekCoordinator.execute(currentStateB).newState;

            // Per-week comparison to find the exact drift point
            try {
                expect(currentStateA).toEqual(currentStateB);
            } catch (e) {
                console.error(`Drift detected at Week ${week}`);
                throw e;
            }
        }

        // Final state comparison
        expect(currentStateA).toEqual(currentStateB);
    });
});

import { resolveFestivals } from "./src/engine/systems/festivals";
import { GameState, Project, FestivalSubmission } from "./src/engine/types";
import { createMockGameState, createMockProject } from "./src/test/utils/mockFactories";
import { RandomGenerator } from "./src/engine/utils/rng";

const rng = new RandomGenerator(42);
const state = createMockGameState({ week: 3 });
state.entities.projects["p1"] = createMockProject({
  id: "p1",
  state: "production",
  format: "film",
  buzz: 10,
  reviewScore: 90
});
const submission: FestivalSubmission = {
  id: "sub-1",
  projectId: "p1",
  festivalBody: "Sundance Film Festival",
  status: "submitted",
  week: 1,
  buzzGain: 0
};
state.industry.festivalSubmissions = [submission];
console.log(resolveFestivals(state, rng));

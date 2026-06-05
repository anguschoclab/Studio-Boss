import { MetricsCollector } from "./src/engine/simulation/MetricsCollector";
import { GameState, WeekSummary } from "./src/engine/types";

// Mock game state
const mockState: any = {
  week: 1,
  finance: { cash: 1000000, marketState: { sentiment: 60 } },
  market: { buyers: [] },
  studio: { id: "PLAYER", name: "Player Studio" },
  entities: {
    rivals: {
      "r1": { id: "r1", name: "Rival 1", cash: 2000000, projects: { "p1": { id: "p1", budget: 10000, revenue: 20000, genre: "Action", state: "released" } } },
      "r2": { id: "r2", name: "Rival 2", cash: -100000, projects: {} }
    },
    projects: {
      "p2": { id: "p2", ownerId: "PLAYER", budget: 50000, revenue: 0, state: "production" }
    },
    talents: {
      "t1": { id: "t1", prestige: 85 },
      "t2": { id: "t2", prestige: 40 }
    }
  }
};

const summary: WeekSummary = {
  fromWeek: 0,
  toWeek: 1,
  activeProjects: 0,
  completedProjects: 0,
  revenue: 0,
  expenses: 0,
  profit: 0,
  newsEvents: []
};

const collector = new MetricsCollector();
console.time("MetricsCollector.record original");
for (let i = 0; i < 10000; i++) {
  collector.record(mockState, summary);
}
console.timeEnd("MetricsCollector.record original");

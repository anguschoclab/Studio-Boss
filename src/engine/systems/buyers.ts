import { Buyer, MandateType, Project, ProjectContractType } from "@/engine/types";
import { StateImpact } from "../types/state.types";
import { pick, randRange, rand, generateId } from "../utils";

const MANDATE_TYPES: MandateType[] = [
  "sci-fi",
  "comedy",
  "drama",
  "budget_freeze",
  "broad_appeal",
  "prestige",
];

const MANDATE_HEADLINES: Record<MandateType, string> = {
  "sci-fi": "Industry chatter: {name} is desperately looking for the next big Sci-Fi hit.",
  comedy: "{name} shifts focus, seeking half-hour comedies for their upcoming slate.",
  drama: "New mandate at {name}: high-stakes drama is the priority.",
  budget_freeze:
    "Austerity hits {name}! Execs are instituting a sudden budget freeze on new pitches.",
  broad_appeal: "{name} pivots to four-quadrant, broad appeal projects after subscriber churn.",
  prestige: "Awards chase: {name} announces a massive fund specifically for prestige projects.",
};

const MANDATE_FIT_HANDLERS: Record<MandateType, (project: Project) => number> = {
  "sci-fi": (p) => {
    const l = p.genre.toLowerCase();
    return l.includes("sci-fi") || l.includes("fantasy") ? 30 : 0;
  },
  comedy: (p) => (p.genre.toLowerCase().includes("comedy") ? 30 : 0),
  drama: (p) => (p.genre.toLowerCase().includes("drama") ? 30 : 0),
  prestige: (p) => {
    if (p.budgetTier === "high") return 20;
    if (p.budgetTier === "blockbuster") return 10;
    if (p.budgetTier === "low") return -20;
    return 0;
  },
  broad_appeal: (p) => {
    let bonus = 0;
    if (p.budgetTier === "mid" || p.budgetTier === "high") bonus += 20;
    if (p.targetAudience.toLowerCase().includes("family")) bonus += 15;
    return bonus;
  },
  budget_freeze: (p) => {
    if (p.budgetTier === "blockbuster") return -50;
    if (p.budgetTier === "high") return -30;
    if (p.budgetTier === "low") return 20;
    return 0;
  },
};

const AVAILABLE_MANDATES = new Map<string, MandateType[]>();
AVAILABLE_MANDATES.set("none", MANDATE_TYPES);
for (let i = 0; i < MANDATE_TYPES.length; i++) {
  const type = MANDATE_TYPES[i];
  AVAILABLE_MANDATES.set(
    type,
    MANDATE_TYPES.filter((m) => m !== type)
  );
}

export function updateBuyers(buyers: Buyer[], currentWeek: number): StateImpact {
  const impact: StateImpact = {
    buyerUpdates: [],
    newHeadlines: [],
  };

  buyers.forEach((buyer) => {
    if (
      !buyer.currentMandate ||
      buyer.currentMandate.activeUntilWeek <= currentWeek ||
      rand() < 0.05
    ) {
      const currentType = buyer.currentMandate?.type || "none";
      const availableTypes = AVAILABLE_MANDATES.get(currentType) || MANDATE_TYPES;
      const newMandateType = pick(availableTypes);
      const duration = Math.floor(randRange(12, 36));

      impact.buyerUpdates!.push({
        buyerId: buyer.id,
        update: {
          currentMandate: {
            type: newMandateType,
            activeUntilWeek: currentWeek + duration,
          },
        },
      });

      const headlineTemplate = MANDATE_HEADLINES[newMandateType];
      if (headlineTemplate && rand() < 0.6) {
        impact.newHeadlines!.push({
          id: generateId("HL"),
          week: currentWeek,
          category: "market",
          text: headlineTemplate.replace("{name}", buyer.name),
        });
      }
    }
  });

  return impact;
}

export function calculateFitScore(
  project: Project,
  buyer: Buyer,
  currentWeek: number = 0,
  allProjects: Project[] = []
): number {
  let score = 50;

  let recentSimilarProjectsCount = 0;
  for (let i = 0; i < allProjects.length; i++) {
    const p = allProjects[i];
    if (
      p.state === "released" &&
      p.genre === project.genre &&
      p.releaseWeek !== null &&
      currentWeek - p.releaseWeek <= 52 &&
      p.id !== project.id
    ) {
      recentSimilarProjectsCount++;
    }
  }

  let saturationPenalty = recentSimilarProjectsCount * 5;
  if (recentSimilarProjectsCount >= 5) saturationPenalty += 20;
  if (
    recentSimilarProjectsCount >= 5 &&
    project.genre &&
    project.genre.toLowerCase().includes("superhero")
  ) {
    saturationPenalty *= 3;
    saturationPenalty += 75;
  }

  if (saturationPenalty > 0) score -= saturationPenalty;
  if (recentSimilarProjectsCount === 0) score += 15;

  if (buyer.currentMandate) {
    const handler = MANDATE_FIT_HANDLERS[buyer.currentMandate.type];
    if (handler) {
      score += handler(project);
    }
  }

  if (buyer.archetype === "network" && project.budgetTier === "blockbuster") score -= 20;
  if (buyer.archetype === "premium" && project.budgetTier === "low") score -= 30;

  const buzzFactor = (project.buzz / 100) * 20;
  score += buzzFactor;
  score += randRange(-10, 10);

  return Math.max(0, Math.min(100, score));
}

export function negotiateContract(
  project: Project,
  buyer: Buyer,
  requestedType: ProjectContractType,
  currentWeek: number = 0,
  allProjects: Project[] = []
): boolean {
  const fitScore = calculateFitScore(project, buyer, currentWeek, allProjects);
  const requiredScore = requestedType === "upfront" ? 65 : 40;
  return fitScore >= requiredScore;
}

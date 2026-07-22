import { GameState, Scandal, ScandalType } from "@/engine/types";import { secureRandom, generateId } from "../utils";
import { StateImpact } from "../types/state.types";

/**
 * Randomly spawns a scandal for a talent in the pool based on their controversy risk.
 * If the talent is attached to an active studio project, it triggers a Project Crisis.
 */
export function generateScandals(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];

  const contracts = state.studio.internal.contracts || [];
  const talentToProjectMap = new Map<string, string>();
  for (const c of contracts) {
    talentToProjectMap.set(c.talentId, c.projectId);
  }

  const studioProjects = state.studio.internal.projects || {};

  const talentsMap = state.entities.talents || {};
  for (const talentId in talentsMap) {
    const talent = talentsMap[talentId];
    const risk = talent.psychology?.scandalRisk || 5;
    if (secureRandom() * 1000 < risk) {
      const types: ScandalType[] = ["financial", "personal", "onset_behavior", "legal", "feud"];
      const type = types[Math.floor(secureRandom() * types.length)];

      const s: Scandal = {
        id: generateId("SCA"),
        talentId: talent.id,
        severity: 20 + Math.floor(secureRandom() * 80), // 20-100
        type,
        weeksRemaining: 4 + Math.floor(secureRandom() * 8),
      };

      impacts.push({
        type: "SCANDAL_ADDED",
        payload: { scandal: s },
      });

      impacts.push({
        type: "NEWS_ADDED",
        payload: {
          headline: "PR NIGHTMARE",
          description: `A massive ${type} scandal erupts violently around ${talent.name}!`,
        },
      });

      const projectId = talentToProjectMap.get(talent.id);
      if (projectId && studioProjects[projectId]) {
        const project = studioProjects[projectId];
        impacts.push({
          type: "PROJECT_UPDATED",
          payload: {
            projectId,
            update: {
              activeCrisis: {
                crisisId: generateId("CRI"),
                triggeredWeek: state.week,
                haltedProduction: false,
                description: `BREAKING NEWS: ${talent.name.toUpperCase()} has been involved in a massive ${type} scandal while working on "${project.title}". The press is circling.`,
                resolved: false,
                severity: s.severity > 75 ? "high" : "medium",
                options: [
                  {
                    text: "Fire Them",
                    effectDescription:
                      "Remove talent from project, +2 week delay, preserve reputation.",
                    weeksDelay: 2,
                    removeTalentId: talent.id,
                  },
                  {
                    text: "Pay off the Press",
                    effectDescription: `Deduct $${(s.severity * 10000).toLocaleString()} to bury the story. Keep talent.`,
                    cashPenalty: s.severity * 10000,
                    reputationPenalty: 2,
                  },
                  {
                    text: "Double Down",
                    effectDescription:
                      "Cost nothing, but lose 10% reputation and tank project buzz.",
                    reputationPenalty: 10,
                    buzzPenalty: 30,
                  },
                ],
              },
            },
          },
        });
      }
    }
  }

  return impacts;
}

/**
 * Processes weekly decay of scandals and applies their penalties to projects.
 */
export function advanceScandals(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  const currentScandals = state.industry.scandals || [];
  const activeScandalTalent = new Set<string>();

  // Collect updates for scandals that are continuing
  const scandalUpdates = currentScandals
    .filter((s) => s.weeksRemaining > 1)
    .map((s) => ({
      scandalId: s.id,
      update: { weeksRemaining: s.weeksRemaining - 1 },
    }));

  if (scandalUpdates.length > 0) {
    impacts.push({
      type: "SCANDAL_UPDATED",
      payload: { scandalUpdates },
    });
  }

  // Remove scandals that have finished their duration
  const expiredScandals = currentScandals.filter((s) => s.weeksRemaining <= 1);
  expiredScandals.forEach((s) => {
    impacts.push({
      type: "SCANDAL_REMOVED",
      payload: { scandalId: s.id },
    });
  });

  // Active scandals for project penalties include both continuing AND just finishing this week
  currentScandals.forEach((s) => {
    activeScandalTalent.add(s.talentId);
  });

  const contracts = state.studio.internal.contracts || [];
  const penalizedProjectIds = new Set<string>();
  for (const c of contracts) {
    if (activeScandalTalent.has(c.talentId)) {
      penalizedProjectIds.add(c.projectId);
    }
  }

  for (const projectId of penalizedProjectIds) {
    const p = state.studio.internal.projects[projectId];
    if (p) {
      impacts.push({
        type: "PROJECT_UPDATED",
        payload: {
          projectId,
          update: { buzz: Math.max(0, p.buzz - 2) },
        },
      });
    }
  }

  return impacts;
}

import { GameState, StateImpact, Talent, Project } from "../../types";
import { RandomGenerator } from "../../utils/rng";
import { TalentRelationship } from "../../types/relationship.types";
import { Clique } from "../../types/clique.types";
import { getContractsByProjectId } from "../../utils";

/**
 * Organic Event Enhancer
 * Extends crisis and scandal systems with relationship and social integration.
 * Generates social-drama-based events that arise from the WSE simulation.
 */

const PRODUCTION_STATES = ["IN_PRODUCTION", "production", "filming"];

function getProjectTalentIds(state: GameState, projectId: string): string[] {
  const contracts = getContractsByProjectId(
    state.entities.contractsByProjectId,
    state.entities.contracts,
    projectId
  );
  return contracts.map((c) => c.talentId);
}

function getRelationships(state: GameState): TalentRelationship[] {
  const relMap =
    (state as unknown as { relationships?: { relationships?: Record<string, TalentRelationship> } })
      ?.relationships?.relationships || {};
  return Object.values(relMap);
}

/**
 * Check for relationship-based crises on a project
 */
export function checkRelationshipCrises(
  project: Project,
  state: GameState,
  rng: RandomGenerator
): StateImpact | null {
  const talentIds = getProjectTalentIds(state, project.id);
  if (talentIds.length < 2) return null;

  const talentIdSet = new Set(talentIds);

  const feuds: TalentRelationship[] = [];
  for (const r of getRelationships(state)) {
    if (talentIdSet.has(r.talentAId) && talentIdSet.has(r.talentBId)) {
      if (r.type === "rival" || r.type === "enemy") feuds.push(r);
    }
  }

  if (feuds.length > 0 && rng.next() < 0.15) {
    // 15% chance if feuds exist
    const feud = rng.pick(feuds);
    const talentA = state.entities.talents?.[feud.talentAId];
    const talentB = state.entities.talents?.[feud.talentBId];

    if (!talentA || !talentB) return null;

    // Determine severity based on feud strength
    const severity = Math.abs(feud.strength) > 70 ? "high" : "medium";

    return {
      type: "MODAL_TRIGGERED",
      payload: {
        modalType: "CRISIS",
        priority: severity === "high" ? 90 : 70,
        payload: {
          projectId: project.id,
          crisis: {
            id: rng.uuid("CRS"),
            crisisId: "RELATIONSHIP_MELTDOWN",
            triggeredWeek: state.week,
            haltedProduction: severity === "high",
            description: `On-set tension between ${talentA.name} and ${talentB.name} has escalated due to their ongoing feud. The production environment is becoming toxic.`,
            resolved: false,
            severity,
            options: [
              {
                text: "Mediate",
                effectDescription:
                  "Hire a conflict resolution specialist. Costs $200k, 1 week delay.",
                cashPenalty: 200000,
                weeksDelay: 1,
              },
              {
                text: "Separate Schedules",
                effectDescription:
                  "Shoot their scenes separately. Adds 2 weeks, reduces buzz by 10.",
                weeksDelay: 2,
              },
              {
                text: "Replace One",
                effectDescription: `Fire ${rng.next() < 0.5 ? talentA.name : talentB.name}. Immediate replacement, lose 15 buzz.`,
                removeTalentId: rng.next() < 0.5 ? talentA.id : talentB.id,
                buzzPenalty: 15,
              },
            ],
          },
        },
      },
    };
  }

  return null;
}

/**
 * Check for clique-based crises
 */
export function checkCliqueCrises(
  project: Project,
  state: GameState,
  rng: RandomGenerator
): StateImpact | null {
  const talentIds = getProjectTalentIds(state, project.id);
  if (talentIds.length < 3) return null;

  const cliques = (state as any).relationships?.cliques?.cliques || {};
  const memberCliqueMap = (state as any).relationships?.cliques?.memberCliqueMap || {};

  // Find cliques that have multiple members on this project
  const cliquePresence: Record<string, number> = {};
  for (const talentId of talentIds) {
    const talentCliques = memberCliqueMap[talentId] || [];
    for (const cliqueId of talentCliques) {
      cliquePresence[cliqueId] = (cliquePresence[cliqueId] || 0) + 1;
    }
  }

  // Check for clique drama (if toxic clique has 2+ members)
  for (const [cliqueId, count] of Object.entries(cliquePresence)) {
    if (count < 2) continue;

    const clique = cliques[cliqueId] as Clique;
    if (clique && clique.reputation === "toxic") {
      if (rng.next() < 0.1) {
        // 10% chance
        return {
          type: "NEWS_ADDED",
          payload: {
            id: rng.uuid("NWS"),
            headline: `Clique Drama on "${project.title}" Set`,
            description: `Members of the ${clique?.name || "controversial group"} are reportedly creating tension with other cast members.`,
            category: "talent",
            publication: "Page Six",
          } as any,
        } as any;
      }
    }
  }

  return null;
}

/**
 * Generate relationship scandals
 */
export function generateRelationshipScandals(
  state: GameState,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];

  const relationships = getRelationships(state);

  // Single-pass partition into secret and public romances
  const secretRomances: TalentRelationship[] = [];
  const publicRomances: TalentRelationship[] = [];
  for (const r of relationships) {
    if (r.type === "romantic") {
      if (!r.isPublic && r.strength > 60) secretRomances.push(r);
      else if (r.isPublic) publicRomances.push(r);
    }
  }

  for (const romance of secretRomances) {
    if (rng.next() < 0.05) {
      // 5% chance per secret romance
      const talentA = state.entities.talents?.[romance.talentAId];
      const talentB = state.entities.talents?.[romance.talentBId];

      if (!talentA || !talentB) continue;

      // Check if either has a spouse
      const spouseA = (talentA as any).spouseId
        ? state.entities.talents?.[(talentA as any).spouseId]
        : null;
      const spouseB = (talentB as any).spouseId
        ? state.entities.talents?.[(talentB as any).spouseId]
        : null;

      if (spouseA || spouseB) {
        // AFFAIR SCANDAL
        impacts.push({
          type: "SCANDAL_ADDED",
          payload: {
            scandal: {
              id: rng.uuid("SND"),
              talentId: romance.talentAId,
              week: state.week,
              type: "CONTROVERSY",
              description: `${talentA.name} rumored to be having an affair with ${talentB.name}`,
              severity: "high",
              publicAwareness: 70,
              careerImpact: -8,
            } as any,
          },
        } as any);

        // Also add scandal for other party
        impacts.push({
          type: "SCANDAL_ADDED",
          payload: {
            scandal: {
              id: rng.uuid("SND"),
              talentId: romance.talentBId,
              week: state.week,
              type: "CONTROVERSY",
              description: `${talentB.name} involved in affair scandal with ${talentA.name}`,
              severity: "high",
              publicAwareness: 70,
              careerImpact: -8,
            } as any,
          },
        } as any);

        // Make relationship public
        impacts.push({
          type: "RELATIONSHIP_UPDATED" as any,
          payload: {
            relationshipId: romance.id,
            update: { isPublic: true },
          },
        } as any);

        // News
        impacts.push({
          type: "NEWS_ADDED",
          payload: {
            id: rng.uuid("NWS"),
            headline: `Cheating Scandal Rocks Hollywood`,
            description: `${talentA.name} and ${talentB.name} caught in explosive affair revelation.`,
            category: "talent",
            publication: "TMZ",
          } as any,
        } as any);
      }
    }
  }

  for (const romance of publicRomances) {
    // Check for negative events in history (reverse iteration — history is sorted ascending)
    let hasRecentBreakup = false;
    for (let i = romance.history.length - 1; i >= 0; i--) {
      const h = romance.history[i];
      if (h.type === "breakup" && h.week > state.week - 4) {
        hasRecentBreakup = true;
        break;
      }
    }

    if (hasRecentBreakup) {
      const talentA = state.entities.talents?.[romance.talentAId];
      const talentB = state.entities.talents?.[romance.talentBId];

      if (talentA && talentB) {
        impacts.push({
          type: "NEWS_ADDED",
          payload: {
            id: rng.uuid("NWS"),
            headline: `Hollywood Power Couple Splits`,
            description: `${talentA.name} and ${talentB.name} have ended their high-profile relationship.`,
            category: "talent",
            publication: "People Magazine",
          } as any,
        } as any);
      }
    }
  }

  return impacts;
}

/**
 * Main organic events tick - extends existing crisis/scandal systems
 */
export function tickOrganicEvents(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  // 1. Check projects for relationship-based crises
  const projectsMap = state.entities.projects || {};
  for (const projId in projectsMap) {
    const project = projectsMap[projId];
    const projectState = project.state;
    if (PRODUCTION_STATES.some((s) => projectState?.toLowerCase().includes(s.toLowerCase()))) {
      const relationshipCrisis = checkRelationshipCrises(project, state, rng);
      if (relationshipCrisis) {
        impacts.push(relationshipCrisis);
      }

      const cliqueCrisis = checkCliqueCrises(project, state, rng);
      if (cliqueCrisis) {
        impacts.push(cliqueCrisis);
      }
    }
  }

  // 2. Generate relationship scandals
  const relationshipScandals = generateRelationshipScandals(state, rng);
  impacts.push(...relationshipScandals);

  return impacts;
}

/**
 * Calculate crisis chance modifier based on social factors
 */
export function calculateSocialCrisisModifier(projectId: string, state: GameState): number {
  let modifier = 1.0;

  const talentIds = getProjectTalentIds(state, projectId);
  if (talentIds.length < 2) return modifier;

  const talentIdSet = new Set(talentIds);

  let feudCount = 0;
  for (const r of getRelationships(state)) {
    if (talentIdSet.has(r.talentAId) && talentIdSet.has(r.talentBId)) {
      if (r.type === "rival" || r.type === "enemy") feudCount++;
    }
  }
  modifier += feudCount * 0.15; // +15% per feud

  // Check for toxic cliques
  const memberCliqueMap = (state as any).relationships?.cliques?.memberCliqueMap || {};
  const cliques = (state as any).relationships?.cliques?.cliques || {};

  const toxicCliqueMembers = talentIds.filter((id) => {
    const talentCliques = memberCliqueMap[id] || [];
    return talentCliques.some((cid: string) => (cliques[cid] as Clique)?.reputation === "toxic");
  });

  modifier += toxicCliqueMembers.length * 0.1; // +10% per toxic clique member

  return Math.min(2.0, modifier); // Cap at 2x
}

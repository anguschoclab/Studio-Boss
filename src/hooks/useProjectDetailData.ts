import {useMemo} from "react";
import {useGameStore} from "@/store/gameStore";
import {useUIStore} from "@/store/uiStore";
import {useTalentMap} from "@/hooks/useTalentMap";
import {getContractsByProjectId} from "@/engine/utils";
import {BUDGET_TIERS} from "@/engine/data/budgetTiers";
import {evaluateGreenlight} from "@/engine/systems/greenlight";
import {selectAwardsProbability} from "@/store/chartSelectors";
import {Talent, ScriptedProject, SeriesProject, Project} from "@/engine/types";
import {type ProjectId} from "@/engine/types/shared.types";

/**
 * All game-state-derived data for ProjectDetailModal.
 *
 * Reads the project canonical-first (entities.projects is kept fresh by
 * PROJECT_UPDATED impacts; studio.internal.projects is only written at
 * creation and can go stale) with the internal map as a fallback.
 */
export function useProjectDetailData() {
  const { selectedProjectId } = useUIStore();
  const gameState = useGameStore((s) => s.gameState);

  const project: Project | undefined = useMemo(() => {
    if (!gameState || !selectedProjectId) return undefined;
    return (
      gameState.entities.projects[selectedProjectId as ProjectId] ??
      gameState.studio.internal.projects[selectedProjectId as ProjectId]
    );
  }, [gameState, selectedProjectId]);

  const activeCampaign = useMemo(
    () => (project ? gameState?.studio.activeCampaigns?.[project.id] : undefined),
    [gameState?.studio.activeCampaigns, project]
  );

  const projectProbabilityData = useMemo(() => {
    if (!gameState || !project) return [];
    return selectAwardsProbability(gameState).filter((p) => p.projectTitle === project.title);
  }, [gameState, project]);

  const talentPool = useMemo(
    () => Object.values(gameState?.entities?.talents || {}),
    [gameState?.entities?.talents]
  );
  const contracts = useMemo(
    () => gameState?.studio.internal.contracts || [],
    [gameState?.studio.internal.contracts]
  );
  const talentMap = useTalentMap(talentPool);

  const talentByRole = useMemo(() => {
    const map = new Map<string, Talent[]>();
    const rolesToTrack = ["director", "actor", "writer", "producer"];
    for (const r of rolesToTrack) {
      map.set(r, []);
    }
    for (const t of talentPool) {
      for (const r of t.roles) {
        const arr = map.get(r);
        if (arr) {
          arr.push(t);
        }
      }
    }
    return map;
  }, [talentPool]);

  const tier = project ? BUDGET_TIERS[project.budgetTier] : null;
  const scriptedProject = useMemo(
    () => (project && project.format !== "unscripted" ? (project as ScriptedProject) : null),
    [project]
  );
  const seriesProject = useMemo(
    () =>
      project && project.type === "SERIES" && "tvDetails" in project
        ? (project as SeriesProject)
        : null,
    [project]
  );

  const roleGroups = useMemo(() => {
    const groups = new Map<string, { attached: Talent[]; available: Talent[] }>();
    const rolesToTrack = scriptedProject?.activeRoles || [
      "director",
      "writer",
      "producer",
      "protagonist",
    ];

    if (!project || !gameState) {
      for (const r of rolesToTrack) {
        groups.set(r, { attached: [], available: [] });
      }
      return groups;
    }

    const projectContracts = getContractsByProjectId(
      gameState.entities.contractsByProjectId,
      gameState.entities.contracts,
      project.id
    );
    const projectTalentIds = new Set(projectContracts.map((c) => c.talentId));

    for (const r of rolesToTrack) {
      const roleKey =
        r === "protagonist"
          ? "actor"
          : r === "antagonist"
            ? "actor"
            : r === "love_interest"
              ? "actor"
              : r;
      const allInRole = talentByRole.get(roleKey) || talentByRole.get("actor") || [];
      const attached: Talent[] = [];
      const available: Talent[] = [];

      for (let i = 0; i < allInRole.length; i++) {
        const t = allInRole[i];
        if (projectTalentIds.has(t.id)) {
          attached.push(t);
        } else {
          available.push(t);
        }
      }

      groups.set(r, { attached, available });
    }
    return groups;
  }, [project, scriptedProject, talentByRole, gameState]);

  const greenlightReport = useMemo(() => {
    if (!project || project.state !== "needs_greenlight" || !gameState) return null;
    const projectContracts = getContractsByProjectId(
      gameState.entities.contractsByProjectId,
      gameState.entities.contracts,
      project.id
    );
    const attachedTalent = projectContracts.reduce((acc, c) => {
      const t = talentMap.get(c.talentId);
      if (t) acc.push(t);
      return acc;
    }, [] as Talent[]);
    return evaluateGreenlight(
      project,
      gameState.finance.cash,
      attachedTalent,
      gameState.week,
      gameState.entities ? Object.values(gameState.entities.projects) : [],
      contracts,
      Object.fromEntries(talentMap)
    );
  }, [project, gameState, contracts, talentMap]);

  return {
    project,
    tier,
    scriptedProject,
    seriesProject,
    activeCampaign,
    projectProbabilityData,
    roleGroups,
    talentMap,
    greenlightReport,
    cash: gameState?.finance.cash ?? 0,
  };
}

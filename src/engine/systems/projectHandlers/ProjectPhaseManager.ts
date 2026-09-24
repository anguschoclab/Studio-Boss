 
import {Project, ProjectStatus, StateImpact} from "@/engine/types";

export function handleDevelopmentPhase(p: Project): StateImpact[] {
  const impacts: StateImpact[] = [];
  let newState: ProjectStatus;
  if (p.format === "tv" || p.format === "unscripted") {
    newState = "pitching";
  } else {
    newState = "needs_greenlight";
  }

  impacts.push({
    type: "PROJECT_UPDATED",
    payload: {
      projectId: p.id,
      update: {
        state: newState,
        weeksInPhase: 0,
      },
    },
  });

  return impacts;
}

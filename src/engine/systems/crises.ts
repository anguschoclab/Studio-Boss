import { Project, ActiveCrisis, GameState } from '../types';
import { pick } from '../utils';

const CRISIS_POOLS = [
  {
    description: "Your lead actor is refusing to leave their trailer, citing 'creative differences' with the director.",
    options: [
      {
        text: "Pay them off.",
        effectDescription: "Lose $250k but keep production moving.",
        cashPenalty: 250000
      },
      {
        text: "Fire the director and find a replacement.",
        effectDescription: "Delays production by 2 weeks and costs $100k.",
        weeksDelay: 2,
        cashPenalty: 100000
      },
      {
        text: "Force them to work.",
        effectDescription: "No cost, but project buzz takes a massive hit.",
        buzzPenalty: 20
      }
    ]
  },
  {
    description: "A major set piece was destroyed in a freak accident overnight.",
    options: [
      {
        text: "Rebuild it from scratch.",
        effectDescription: "Costs $500k and delays production by 1 week.",
        cashPenalty: 500000,
        weeksDelay: 1
      },
      {
        text: "Rewrite the script to bypass the scene.",
        effectDescription: "Saves money but severely hurts the project's buzz.",
        buzzPenalty: 15
      }
    ]
  },
  {
    description: "The studio executives are demanding a sudden tone shift to chase a new trend.",
    options: [
      {
        text: "Comply and reshoot scenes.",
        effectDescription: "Costs $300k and adds 2 weeks to production.",
        cashPenalty: 300000,
        weeksDelay: 2
      },
      {
        text: "Fight the executives and stick to the vision.",
        effectDescription: "Risk a major PR disaster. Loses 10 buzz.",
        buzzPenalty: 10
      }
    ]
  }
];

export function checkAndTriggerCrisis(project: Project): ActiveCrisis | undefined {
  if (project.status !== 'production') return undefined;

  // 5% chance per week in production to hit a crisis
  if (Math.random() < 0.05) {
    const crisisTemplate = pick(CRISIS_POOLS);
    return {
      description: crisisTemplate.description,
      options: [...crisisTemplate.options], // Clone options
      resolved: false
    };
  }

  return undefined;
}

export function resolveCrisis(state: GameState, projectId: string, optionIndex: number): GameState {
  const projectIndex = state.projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) return state;

  const project = state.projects[projectIndex];
  if (!project.activeCrisis || project.activeCrisis.resolved) return state;

  const option = project.activeCrisis.options[optionIndex];
  if (!option) return state;

  // Apply penalties
  const cashChange = option.cashPenalty ? -option.cashPenalty : 0;

  const updatedProject = { ...project };

  if (option.weeksDelay) {
    updatedProject.productionWeeks += option.weeksDelay;
  }

  if (option.buzzPenalty) {
    updatedProject.buzz = Math.max(0, updatedProject.buzz - option.buzzPenalty);
  }

  // Mark resolved
  updatedProject.activeCrisis = {
    ...project.activeCrisis,
    resolved: true
  };

  const newProjects = [...state.projects];
  newProjects[projectIndex] = updatedProject;

  return {
    ...state,
    projects: newProjects,
    cash: state.cash + cashChange, // Apply cash change (penalty means negative)
    events: [...(state.events || []), `Crisis resolved for "${project.title}": ${option.text}`]
  } as GameState;
}

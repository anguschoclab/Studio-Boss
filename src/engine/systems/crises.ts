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
  },
  {
    description: "Your Method Actor is refusing to leave character, which happens to be a 19th-century tuberculosis patient. They are coughing on the crew and demanding leeches.",
    options: [
      {
        text: "Hire an on-set 'apothecary' to humor them.",
        effectDescription: "Costs $150k but keeps the actor happy.",
        cashPenalty: 150000
      },
      {
        text: "Threaten to recast them.",
        effectDescription: "Actor complies, but morale plummets and project buzz takes a hit.",
        buzzPenalty: 25
      },
      {
        text: "Lean into it. Leak the story to the trades.",
        effectDescription: "Massive buzz boost, but production slows down by 2 weeks as they 'recover'.",
        weeksDelay: 2,
        buzzPenalty: -15
      }
    ]
  },
  {
    description: "The primary VFX studio just filed for bankruptcy and took your raw plates down with them.",
    options: [
      {
        text: "Buy them out to seize the servers.",
        effectDescription: "Costs an eye-watering $2.5M, but saves the schedule.",
        cashPenalty: 2500000
      },
      {
        text: "Pivot to 'practical effects'.",
        effectDescription: "Costs $500k and delays the film by 4 weeks to rebuild scenes.",
        cashPenalty: 500000,
        weeksDelay: 4
      },
      {
        text: "Release it unfinished. Call it an 'artistic choice'.",
        effectDescription: "Saves money, but the internet destroys your buzz.",
        buzzPenalty: 40
      }
    ]
  },
  {
    description: "The Director's old, highly problematic tweets just resurfaced.",
    options: [
      {
        text: "Fire them immediately.",
        effectDescription: "Costs $400k to replace them and delays by 3 weeks.",
        cashPenalty: 400000,
        weeksDelay: 3
      },
      {
        text: "Launch a costly PR apology tour.",
        effectDescription: "Costs $800k but keeps production on track.",
        cashPenalty: 800000
      },
      {
        text: "Ignore the mob.",
        effectDescription: "No cost, but project buzz is obliterated.",
        buzzPenalty: 50
      }
    ]
  },
  {
    description: "An A-list cameo demands their trailer be entirely repainted 'eggshell white', delaying their scene.",
    options: [
      {
        text: "Repaint it overnight.",
        effectDescription: "Costs $50k in overtime pay.",
        cashPenalty: 50000
      },
      {
        text: "Tell them to deal with 'bone white'.",
        effectDescription: "They walk off set. Delays production by 1 week.",
        weeksDelay: 1
      }
    ]
  },
  {
    description: "A rogue extra smuggled a smartphone on set and leaked the secret ending to Reddit.",
    options: [
      {
        text: "Rewrite and reshoot the ending.",
        effectDescription: "Costs $1M and adds 3 weeks to production.",
        cashPenalty: 1000000,
        weeksDelay: 3
      },
      {
        text: "Lean into it and release a fake 'alternate leak'.",
        effectDescription: "Costs $200k in marketing to confuse the internet, but neutralizes the buzz drop.",
        cashPenalty: 200000
      },
      {
        text: "Do nothing.",
        effectDescription: "The surprise is ruined. Lose 30 buzz.",
        buzzPenalty: 30
      }
    ]
  },
  {
    description: "The film's dog star has allegedly bitten the key grip. The humane society is threatening to shut down production.",
    options: [
      {
        text: "Settle with the grip and pay off the inspectors.",
        effectDescription: "Costs $300k to sweep it under the rug.",
        cashPenalty: 300000
      },
      {
        text: "Fire the dog and recast with CGI.",
        effectDescription: "Costs $750k and delays by 2 weeks.",
        cashPenalty: 750000,
        weeksDelay: 2
      }
    ]
  },
  {
    description: "Your lead actress has launched a holistic lifestyle brand and is insisting on rewriting her dialogue to promote her crystal-infused water.",
    options: [
      {
        text: "Let her have one product placement scene.",
        effectDescription: "No monetary cost, but loses 15 buzz from cringeworthy dialogue.",
        buzzPenalty: 15
      },
      {
        text: "Hire ghostwriters to subtly remove it daily.",
        effectDescription: "Costs $150k in daily script polish fees.",
        cashPenalty: 150000
      },
      {
        text: "Put your foot down.",
        effectDescription: "She locks herself in her trailer. 1 week delay.",
        weeksDelay: 1
      }
    ]
  },
  {
    description: "A sudden union strike by the catering team leaves the crew starving and threatening to walk out.",
    options: [
      {
        text: "Cater Nobu for the entire crew.",
        effectDescription: "Costs $250k but production continues.",
        cashPenalty: 250000
      },
      {
        text: "Wait out the strike.",
        effectDescription: "Delays production by 2 weeks.",
        weeksDelay: 2
      }
    ]
  },
  {
    description: "The studio president's untalented nephew was just promised a speaking role by the director.",
    options: [
      {
        text: "Cut his scenes in post.",
        effectDescription: "Saves the movie's integrity, but causes friction later.",
        buzzPenalty: 10
      },
      {
        text: "Pay an acting coach to miracle a performance.",
        effectDescription: "Costs $200k.",
        cashPenalty: 200000
      },
      {
        text: "Let him ruin the scene.",
        effectDescription: "Loses 20 buzz because he is truly terrible.",
        buzzPenalty: 20
      }
    ]
  },
  {
    description: "An unexpected hurricane destroys your tropical location shoot.",
    options: [
      {
        text: "Relocate to a soundstage in Atlanta.",
        effectDescription: "Costs $1.5M and delays by 3 weeks.",
        cashPenalty: 1500000,
        weeksDelay: 3
      },
      {
        text: "Wait for the weather to clear.",
        effectDescription: "Delays production by 5 weeks.",
        weeksDelay: 5
      }
    ]
  },
  {
    description: "Your co-stars are engaged in a bitter, public feud and refuse to look at each other during scenes.",
    options: [
      {
        text: "Shoot their coverage on separate days.",
        effectDescription: "Adds 3 weeks to the schedule.",
        weeksDelay: 3
      },
      {
        text: "Hire a celebrity mediator.",
        effectDescription: "Costs $400k.",
        cashPenalty: 400000
      },
      {
        text: "Force them to work it out on camera.",
        effectDescription: "The tension is palpable, but toxic. Lose 25 buzz from bad press.",
        buzzPenalty: 25
      }
    ]
  },
  {
    description: "The test screening scores are abysmal. The audience hated the third act.",
    options: [
      {
        text: "Order massive reshoots.",
        effectDescription: "Costs $2M and adds 4 weeks of production.",
        cashPenalty: 2000000,
        weeksDelay: 4
      },
      {
        text: "Re-cut the film in the edit bay.",
        effectDescription: "Costs $500k.",
        cashPenalty: 500000
      },
      {
        text: "Release it as is. Blame the audience.",
        effectDescription: "Massive 40 buzz penalty.",
        buzzPenalty: 40
      }
    ]
  },
  {
    description: "A rival studio has just announced a film with the exact same premise, releasing one month before yours.",
    options: [
      {
        text: "Rush production to beat them to theaters.",
        effectDescription: "Costs $1.5M in overtime, but avoids a delay.",
        cashPenalty: 1500000
      },
      {
        text: "Pivot the marketing to make yours look like the 'premium' version.",
        effectDescription: "Costs $800k in new marketing spend.",
        cashPenalty: 800000
      },
      {
        text: "Stay the course.",
        effectDescription: "Lose 35 buzz as you look like a cheap knock-off.",
        buzzPenalty: 35
      }
    ]
  },
  {
    description: "Your composer was caught plagiarizing the main theme from an obscure 1970s Italian horror film.",
    options: [
      {
        text: "Fire them and hire Hans Zimmer's non-union equivalent.",
        effectDescription: "Costs $600k and delays by 2 weeks.",
        cashPenalty: 600000,
        weeksDelay: 2
      },
      {
        text: "Quietly pay off the original Italian composer.",
        effectDescription: "Costs $1M in hush money.",
        cashPenalty: 1000000
      },
      {
        text: "Claim it's a 'homage'.",
        effectDescription: "The internet isn't fooled. Lose 25 buzz.",
        buzzPenalty: 25
      }
    ]
  },
  {
    description: "The 'indie darling' director you hired is paralyzed by choice and hasn't yelled 'action' in three days.",
    options: [
      {
        text: "Send the producers down to scream at them.",
        effectDescription: "Costs nothing, but morale plummets. Lose 15 buzz.",
        buzzPenalty: 15
      },
      {
        text: "Hire a ghost-director to actually run the set.",
        effectDescription: "Costs $300k.",
        cashPenalty: 300000
      },
      {
        text: "Let them 'find the scene'.",
        effectDescription: "Delays production by 2 weeks.",
        weeksDelay: 2
      }
    ]
  }

,
  {
    description: "The film's 'visionary' director insists on shooting a 45-minute unbroken take in a moving train, and the camera operator just quit in tears.",
    options: [
      {
        text: "Hire an expensive specialist Steadicam op.",
        effectDescription: "Costs $350k but the shot might actually work.",
        cashPenalty: 350000
      },
      {
        text: "Force the director to cut the scene into manageable pieces.",
        effectDescription: "Saves money, but the director throws a tantrum. Morale drops, 15 buzz lost.",
        buzzPenalty: 15
      },
      {
        text: "Attempt the shot with the B-camera op.",
        effectDescription: "Takes 2 weeks of failed takes before they finally get it.",
        weeksDelay: 2
      }
    ]
  },
  {
    description: "A hacker group has breached the studio servers and threatens to leak the unrendered, embarrassing green-screen footage of your lead actor.",
    options: [
      {
        text: "Pay the ransom in cryptocurrency.",
        effectDescription: "Costs $1.5M quietly.",
        cashPenalty: 1500000
      },
      {
        text: "Call their bluff.",
        effectDescription: "They leak it. The actor looks ridiculous in a mo-cap suit without effects. Massive 35 buzz penalty.",
        buzzPenalty: 35
      },
      {
        text: "Leak it yourself as a 'hilarious behind-the-scenes' viral marketing stunt.",
        effectDescription: "Costs $500k in PR spin, but neutralizes the threat and gains some goodwill.",
        cashPenalty: 500000,
        buzzPenalty: -10
      }
    ]
  },
  {
    description: "The studio's highly publicized 'sustainability initiative' is a disaster; the solar-powered generators keep failing during night shoots.",
    options: [
      {
        text: "Quietly bring in massive diesel generators.",
        effectDescription: "Costs $200k in rush rentals and fuel.",
        cashPenalty: 200000
      },
      {
        text: "Stick to the solar plan.",
        effectDescription: "Shooting is painfully slow. Adds 3 weeks to production.",
        weeksDelay: 3
      },
      {
        text: "A trade journalist spots the diesel generators. Pay them off.",
        effectDescription: "Costs $100k to kill the story.",
        cashPenalty: 100000
      }
    ]
  },
  {
    description: "Your prestige drama’s historical consultant just published an op-ed calling the script 'a catastrophic insult to actual history'.",
    options: [
      {
        text: "Hire a team of writers to urgently rewrite and reshoot key historical scenes.",
        effectDescription: "Costs $1.2M and delays production by 3 weeks.",
        cashPenalty: 1200000,
        weeksDelay: 3
      },
      {
        text: "Publicly attack the consultant's credentials.",
        effectDescription: "Messy PR war. Loses 20 buzz.",
        buzzPenalty: 20
      },
      {
        text: "Ignore it and market the film as an 'alternate history' fantasy.",
        effectDescription: "Costs $400k in pivot marketing.",
        cashPenalty: 400000
      }
    ]
  },
  {
    description: "The lead actor's personal 'spiritual advisor' has convinced them that the script's ending brings bad karma, and they refuse to film it.",
    options: [
      {
        text: "Bribe the spiritual advisor to change their reading of the karma.",
        effectDescription: "Costs $250k in 'donations'.",
        cashPenalty: 250000
      },
      {
        text: "Rewrite the ending to be overwhelmingly positive and karmically aligned.",
        effectDescription: "The ending makes no sense for the genre. Lose 25 buzz.",
        buzzPenalty: 25
      },
      {
        text: "Wait them out while lawyers draft breach of contract letters.",
        effectDescription: "Delays production by 2 weeks.",
        weeksDelay: 2
      }
    ]
  },
  {
    description: "A rival production is shooting down the street and keeps blasting an air horn to ruin your audio takes.",
    options: [
      {
        text: "Bribe the city permit office to revoke their location permit.",
        effectDescription: "Costs $300k in 'expedited processing fees'.",
        cashPenalty: 300000
      },
      {
        text: "Loop all the dialogue in post-production (ADR).",
        effectDescription: "Costs $500k and the performances feel slightly disconnected.",
        cashPenalty: 500000,
        buzzPenalty: 10
      },
      {
        text: "Wait for them to wrap their location shoot.",
        effectDescription: "Delays production by 1 week.",
        weeksDelay: 1
      }
    ]
  },
  {
    description: "The highly anticipated tie-in fast-food toys have leaked, and they look incredibly inappropriate due to a manufacturing error.",
    options: [
      {
        text: "Recall and redesign the toys globally.",
        effectDescription: "Costs a staggering $2M.",
        cashPenalty: 2000000
      },
      {
        text: "Cancel the toy line entirely.",
        effectDescription: "Breach of contract with the fast-food chain costs $800k in penalties.",
        cashPenalty: 800000
      },
      {
        text: "Let them hit the market. It's 'edgy'.",
        effectDescription: "Parents are outraged. Massive 45 buzz penalty.",
        buzzPenalty: 45
      }
    ]
  },
  {
    description: "Your foreign co-financing partner has suddenly been indicted for massive embezzlement in their home country.",
    options: [
      {
        text: "Scramble to find gap financing at predatory interest rates.",
        effectDescription: "Costs $1.5M immediately to cover the shortfall.",
        cashPenalty: 1500000
      },
      {
        text: "Halt production until legal clears the funds.",
        effectDescription: "Delays production by 4 weeks.",
        weeksDelay: 4
      },
      {
        text: "Distance the film completely. Strip their name from the credits.",
        effectDescription: "Legal fees and restructuring cost $750k.",
        cashPenalty: 750000
      }
    ]
  },
  {
    description: "An extra fell asleep in a background vehicle and woke up in the shot of your massive explosion stunt. They are fine, but traumatized.",
    options: [
      {
        text: "Settle out of court immediately with an ironclad NDA.",
        effectDescription: "Costs $800k.",
        cashPenalty: 800000
      },
      {
        text: "They go to the press. The safety investigation shuts down the set.",
        effectDescription: "Delays production by 3 weeks.",
        weeksDelay: 3
      },
      {
        text: "CGI them out of the explosion shot to hide evidence.",
        effectDescription: "VFX costs $300k, but the rumor mill still causes a 15 buzz drop.",
        cashPenalty: 300000,
        buzzPenalty: 15
      }
    ]
  },
  {
    description: "The showrunner's extremely messy public divorce is spilling onto the set, with their ex showing up to scream at them during takes.",
    options: [
      {
        text: "Hire elite private security to lock down the lot.",
        effectDescription: "Costs $150k.",
        cashPenalty: 150000
      },
      {
        text: "Give the showrunner a forced leave of absence.",
        effectDescription: "The production lacks leadership. Delays by 2 weeks.",
        weeksDelay: 2
      },
      {
        text: "Do nothing. The tabloids are eating it up.",
        effectDescription: "The crew is miserable, but the chaotic drama gives a weird 10 buzz boost.",
        buzzPenalty: -10
      }
    ]
  },
  {
    description: "A localized outbreak of an obscure stomach bug has decimated the camera department.",
    options: [
      {
        text: "Fly in an emergency replacement crew from out of state.",
        effectDescription: "Costs $400k in flights, rush rates, and per diems.",
        cashPenalty: 400000
      },
      {
        text: "Shut down the production until they recover.",
        effectDescription: "Delays production by 2 weeks.",
        weeksDelay: 2
      }
    ]
  },
  {
    description: "The method actor playing the villain went entirely too far during an improvisation and actually broke the hero's nose.",
    options: [
      {
        text: "Shut down until the hero's face heals.",
        effectDescription: "Delays production by 3 weeks.",
        weeksDelay: 3
      },
      {
        text: "Shoot around them with body doubles and fix the face in CGI later.",
        effectDescription: "Costs $900k in extensive digital face replacement.",
        cashPenalty: 900000
      },
      {
        text: "Write the broken nose into the script.",
        effectDescription: "Saves money, but the original script structure is compromised. Lose 15 buzz.",
        buzzPenalty: 15
      }
    ]
  },
  {
    description: "The 'child prodigy' actor you hired has hit a massive growth spurt midway through the shoot and no longer matches the earlier scenes.",
    options: [
      {
        text: "Use forced perspective and digital shrinking.",
        effectDescription: "Costs $600k in complex VFX.",
        cashPenalty: 600000
      },
      {
        text: "Reshoot the early scenes with the 'new' taller kid.",
        effectDescription: "Costs $1M and delays by 2 weeks.",
        cashPenalty: 1000000,
        weeksDelay: 2
      },
      {
        text: "Ignore it.",
        effectDescription: "The continuity errors become a massive meme. Lose 25 buzz.",
        buzzPenalty: 25
      }
    ]
  },
  {
    description: "Your highly touted 'cutting edge AI' script polishing software has hallucinated a completely nonsensical subplot into the shooting script, and they already filmed half of it.",
    options: [
      {
        text: "Scrap the AI scenes and reshoot with human pages.",
        effectDescription: "Costs $800k and delays by 2 weeks.",
        cashPenalty: 800000,
        weeksDelay: 2
      },
      {
        text: "Hire expensive human editors to try and make the footage make sense in post.",
        effectDescription: "Costs $400k in post-production scrambling.",
        cashPenalty: 400000
      },
      {
        text: "Leave it in. Claim it's 'surrealist commentary'.",
        effectDescription: "Audiences are deeply confused. Lose 30 buzz.",
        buzzPenalty: 30
      }
    ]
  },
  {
    description: "The studio's marketing department accidentally bought the domain name for the movie with a crucial typo, leading users to a very explicit site.",
    options: [
      {
        text: "Pay an extortionate fee to buy the typo domain from the squatters.",
        effectDescription: "Costs $750k.",
        cashPenalty: 750000
      },
      {
        text: "Completely rebrand the movie title to match a new domain.",
        effectDescription: "Costs $500k in new marketing materials and loses 20 buzz from brand confusion.",
        cashPenalty: 500000,
        buzzPenalty: 20
      },
      {
        text: "Ignore it. All press is good press?",
        effectDescription: "A family-friendly demographic is traumatized. Lose 40 buzz.",
        buzzPenalty: 40
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
    headlines: [...(state.headlines || []), { id: `crisis-${crypto.randomUUID()}`, text: `Crisis resolved for "${project.title}": ${option.text}`, week: state.week, category: 'general' as const }]
  } as GameState;
}

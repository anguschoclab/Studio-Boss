import { AwardBody, AwardCategory, Project } from '../types';

export const CANNES_EQUIVALENTS: AwardBody[] = ['Cannes Film Festival', 'Venice Film Festival', 'Berlin International Film Festival', 'Telluride Film Festival'];
export const SUNDANCE_EQUIVALENTS: AwardBody[] = ['Sundance Film Festival', 'Toronto International Film Festival', 'SXSW Film Festival', 'Tribeca Film Festival', 'Slamdance Film Festival'];

export const AWARDS_CALENDAR: Record<number, AwardBody[]> = {
  2: ['Golden Globes'],
  3: ['Sundance Film Festival'],
  4: ['Critics Choice Awards', 'The Razzies'],
  5: ['SAG Awards'],
  6: ['Directors Guild Awards'],
  7: ['Producers Guild Awards', 'Berlin International Film Festival'],
  8: ['Writers Guild Awards', 'BAFTAs'],
  9: ['Annie Awards', 'Independent Spirit Awards'],
  10: ['Academy Awards'],
  11: ['SXSW Film Festival'],
  15: ['Tribeca Film Festival'],
  20: ['Peabody Awards'],
  21: ['Cannes Film Festival'],
  34: ['Venice Film Festival', 'Telluride Film Festival'],
  35: ['Toronto International Film Festival'],
  36: ['Slamdance Film Festival'],
  37: ['Primetime Emmys']
};

export interface AwardConfig {
  id: string; // 🌌 Standardized UUID for this award category configuration
  body: AwardBody;
  category: AwardCategory;
  format: 'film' | 'tv' | 'both';
  evaluator: (p: Project) => number;
}

export const AWARD_CONFIGS: AwardConfig[] = [
  // --- ACADEMY AWARDS (Oscars) ---
  {
    id: 'AWD-98beaa23-e89a-0a3b-ea53-2485fde6',
    body: 'Academy Awards', category: 'Best Picture', format: 'film',
    evaluator: p => {
      const base = (p.awardsProfile?.academyAppeal || 0) + (p.awardsProfile?.prestigeScore || 0) + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5;
      // Award Season Momentum: +15% if won Golden Globe Best Picture
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.category === 'Best Picture' && a.status === 'won');
      return hasGlobe ? base * 1.15 : base;
    }
  },
  {
    id: 'AWD-2aa20225-3650-149e-4037-06160e95',
    body: 'Academy Awards', category: 'Best Director', format: 'film',
    evaluator: p => {
      const base = (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.academyAppeal || 0) * 0.8;
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.status === 'won'); // Any Globe win helps Director momentum
      return hasGlobe ? base * 1.10 : base;
    }
  },
  {
    id: 'AWD-148e9c3f-c5b5-fda5-6fed-59c02cf5',
    body: 'Academy Awards', category: 'Best Actor', format: 'film',
    evaluator: p => {
      const base = (p.awardsProfile?.craftScore || 0) + (p.buzz || 0) * 0.5;
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.category.includes('Actor') && a.status === 'won');
      return hasGlobe ? base * 1.15 : base;
    }
  },
  {
    id: 'AWD-58774c16-ed7c-9ac0-77ea-fb9effd9',
    body: 'Academy Awards', category: 'Best Actress', format: 'film',
    evaluator: p => {
      const base = (p.awardsProfile?.craftScore || 0) + (p.buzz || 0) * 0.5;
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.category.includes('Actress') && a.status === 'won');
      return hasGlobe ? base * 1.15 : base;
    }
  },
  {
    id: 'AWD-c9b2aee6-464f-fdcc-cf34-c8c90664',
    body: 'Academy Awards', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => {
      const base = (p.awardsProfile?.craftScore || 0) * 0.8 + (p.buzz || 0) * 0.4;
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.category.includes('Actor') && a.status === 'won');
      return hasGlobe ? base * 1.15 : base;
    }
  },
  {
    id: 'AWD-95ec2bf6-c927-a3c0-9008-29aac0ab',
    body: 'Academy Awards', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => {
      const base = (p.awardsProfile?.craftScore || 0) * 0.8 + (p.buzz || 0) * 0.4;
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.category.includes('Actress') && a.status === 'won');
      return hasGlobe ? base * 1.15 : base;
    }
  },

  // --- PRIMETIME EMMYS ---
  {
    id: 'AWD-d7be4b32-a15e-a664-edcd-78487f56',
    body: 'Primetime Emmys', category: 'Best Drama Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.criticScore || 0) + (p.awardsProfile?.prestigeScore || 0) + (p.awardsProfile?.industryNarrativeScore || 0) * 0.8
  },
  {
    id: 'AWD-e3068187-9a43-a5be-8644-b86d2e54',
    body: 'Primetime Emmys', category: 'Best Comedy Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.criticScore || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.awardsProfile?.populistAppeal || 0) * 0.5
  },
  {
    id: 'AWD-9d3f3136-7fff-2ec6-79fc-89b1af87',
    body: 'Primetime Emmys', category: 'Best Limited Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.criticScore || 0)
  },
  {
    id: 'AWD-0d10b106-9a43-a5be-8644-b86d2e54',
    body: 'Primetime Emmys', category: 'Best Actor (Drama)', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    id: 'AWD-0d118187-9a43-a5be-8644-b86d2e54',
    body: 'Primetime Emmys', category: 'Best Actress (Drama)', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    id: 'AWD-0d128187-9a43-a5be-8644-b86d2e54',
    body: 'Primetime Emmys', category: 'Best Actor (Comedy)', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.culturalHeat || 0) * 0.5
  },
  {
    id: 'AWD-0d138187-9a43-a5be-8644-b86d2e54',
    body: 'Primetime Emmys', category: 'Best Actress (Comedy)', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.culturalHeat || 0) * 0.5
  },

  // --- GOLDEN GLOBES ---
  {
    id: 'AWD-0d148187-9a43-a5be-8644-b86d2e54',
    body: 'Golden Globes', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.populistAppeal || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 2)
  },
  {
    id: 'AWD-0d158187-9a43-a5be-8644-b86d2e54',
    body: 'Golden Globes', category: 'Best Drama Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.prestigeScore || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 4)
  },
  {
    id: 'AWD-0d168187-9a43-a5be-8644-b86d2e54',
    body: 'Golden Globes', category: 'Best Comedy Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.populistAppeal || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 3)
  },
  {
    id: 'AWD-0d178187-9a43-a5be-8644-b86d2e54',
    body: 'Golden Globes', category: 'Best TV Movie', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.criticScore || 0)
  },

  // --- INDEPENDENT SPIRIT AWARDS ---
  {
    id: 'AWD-0d188187-9a43-a5be-8644-b86d2e54',
    body: 'Independent Spirit Awards', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 2 + (p.awardsProfile?.criticScore || 0)
  },

  // --- BAFTAs ---
  {
    id: 'AWD-0d198187-9a43-a5be-8644-b86d2e54',
    body: 'BAFTAs', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0)
  },
  {
    id: 'AWD-0d208187-9a43-a5be-8644-b86d2e54',
    body: 'BAFTAs', category: 'Best Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0)
  },
  {
    id: 'AWD-0d218187-9a43-a5be-8644-b86d2e54',
    body: 'BAFTAs', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 0.8 + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    id: 'AWD-0d228187-9a43-a5be-8644-b86d2e54',
    body: 'BAFTAs', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 0.8 + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },

  // --- SAG AWARDS ---
  {
    id: 'AWD-0d238187-9a43-a5be-8644-b86d2e54',
    body: 'SAG Awards', category: 'Best Ensemble', format: 'both',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 0.5 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5 + (p.buzz || 0)
  },

  // --- GUILDS ---
  {
    id: 'AWD-0d248187-9a43-a5be-8644-b86d2e54',
    body: 'Directors Guild Awards', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    id: 'AWD-0d258187-9a43-a5be-8644-b86d2e54',
    body: 'Producers Guild Awards', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.prestigeScore || 0) * 0.8 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5
  },
  {
    id: 'AWD-0d268187-9a43-a5be-8644-b86d2e54',
    body: 'Writers Guild Awards', category: 'Best Screenplay', format: 'both',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5
  },

  // --- CRITICS CHOICE ---
  {
    id: 'AWD-0d278187-9a43-a5be-8644-b86d2e54',
    body: 'Critics Choice Awards', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.criticScore || 0) * 2
  },
  {
    id: 'AWD-0d288187-9a43-a5be-8644-b86d2e54',
    body: 'Critics Choice Awards', category: 'Best Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.criticScore || 0) * 2
  },

  // --- ANNIE AWARDS ---
  {
    id: 'AWD-0d298187-9a43-a5be-8644-b86d2e54',
    body: 'Annie Awards', category: 'Best Animated Feature', format: 'film',
    evaluator: p => (p.genre === 'Animation' ? 200 : 0) + (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.audienceScore || 0)
  },

  // --- PEABODY AWARDS ---
  {
    id: 'AWD-0d308187-9a43-a5be-8644-b86d2e54',
    body: 'Peabody Awards', category: 'Special Achievement', format: 'tv',
    evaluator: p => (p.awardsProfile?.culturalHeat || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0)
  },

  // --- CANNES FILM FESTIVAL ---
  {
    id: 'AWD-0d318187-9a43-a5be-8644-b86d2e54',
    body: 'Cannes Film Festival', category: 'Palme d\'Or', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.2
  },
  {
    id: 'AWD-0d328187-9a43-a5be-8644-b86d2e54',
    body: 'Cannes Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    id: 'AWD-0d338187-9a43-a5be-8644-b86d2e54',
    body: 'Cannes Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 2 + (p.awardsProfile?.indieCredibility || 0) * 0.5
  },
  {
    id: 'AWD-0d348187-9a43-a5be-8644-b86d2e54',
    body: 'Cannes Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    id: 'AWD-0d358187-9a43-a5be-8644-b86d2e54',
    body: 'Cannes Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    id: 'AWD-0d368187-9a43-a5be-8644-b86d2e54',
    body: 'Cannes Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.6
  },
  {
    id: 'AWD-0d378187-9a43-a5be-8644-b86d2e54',
    body: 'Cannes Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.6
  },
  {
    id: 'AWD-0d388187-9a43-a5be-8644-b86d2e54',
    body: 'Cannes Film Festival', category: 'Best Screenplay', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.8 + (p.awardsProfile?.indieCredibility || 0) * 0.8
  },

  // --- SUNDANCE FILM FESTIVAL ---
  {
    id: 'AWD-0d398187-9a43-a5be-8644-b86d2e54',
    body: 'Sundance Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 2 + (p.awardsProfile?.criticScore || 0)
  },
  {
    id: 'AWD-0d408187-9a43-a5be-8644-b86d2e54',
    body: 'Sundance Film Festival', category: 'Audience Award', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.audienceScore || 0) * 1.5
  },
  {
    id: 'AWD-0d418187-9a43-a5be-8644-b86d2e54',
    body: 'Sundance Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0)
  },
  {
    id: 'AWD-0d428187-9a43-a5be-8644-b86d2e54',
    body: 'Sundance Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) + (p.awardsProfile?.criticScore || 0) * 0.8
  },
  {
    id: 'AWD-0d438187-9a43-a5be-8644-b86d2e54',
    body: 'Sundance Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) + (p.awardsProfile?.criticScore || 0) * 0.8
  },
  {
    id: 'AWD-0d448187-9a43-a5be-8644-b86d2e54',
    body: 'Sundance Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 0.8 + (p.awardsProfile?.criticScore || 0) * 0.5
  },
  {
    id: 'AWD-0d458187-9a43-a5be-8644-b86d2e54',
    body: 'Sundance Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 0.8 + (p.awardsProfile?.criticScore || 0) * 0.5
  },
  {
    id: 'AWD-0d468187-9a43-a5be-8644-b86d2e54',
    body: 'Sundance Film Festival', category: 'Best Screenplay', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0) * 0.5
  },

  // --- BERLIN INTERNATIONAL FILM FESTIVAL ---
  {
    id: 'AWD-0d478187-9a43-a5be-8644-b86d2e54',
    body: 'Berlin International Film Festival', category: 'Golden Bear', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.2
  },
  {
    id: 'AWD-0d488187-9a43-a5be-8644-b86d2e54',
    body: 'Berlin International Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    id: 'AWD-0d498187-9a43-a5be-8644-b86d2e54',
    body: 'Berlin International Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 2 + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    id: 'AWD-0d508187-9a43-a5be-8644-b86d2e54',
    body: 'Berlin International Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    id: 'AWD-0d518187-9a43-a5be-8644-b86d2e54',
    body: 'Berlin International Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    id: 'AWD-0d528187-9a43-a5be-8644-b86d2e54',
    body: 'Berlin International Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    id: 'AWD-0d538187-9a43-a5be-8644-b86d2e54',
    body: 'Berlin International Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    id: 'AWD-0d548187-9a43-a5be-8644-b86d2e54',
    body: 'Berlin International Film Festival', category: 'Best Screenplay', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.8 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.8
  },

  // --- VENICE FILM FESTIVAL ---
  {
    id: 'AWD-0d558187-9a43-a5be-8644-b86d2e54',
    body: 'Venice Film Festival', category: 'Golden Lion', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.5
  },
  {
    id: 'AWD-0d568187-9a43-a5be-8644-b86d2e54',
    body: 'Venice Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.2
  },
  {
    id: 'AWD-0d578187-9a43-a5be-8644-b86d2e54',
    body: 'Venice Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 2 + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    id: 'AWD-0d588187-9a43-a5be-8644-b86d2e54',
    body: 'Venice Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    id: 'AWD-0d598187-9a43-a5be-8644-b86d2e54',
    body: 'Venice Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    id: 'AWD-0d608187-9a43-a5be-8644-b86d2e54',
    body: 'Venice Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    id: 'AWD-b0bebb0a-9fbc-4b86-8993-ca17c48c73fa',
    body: 'Venice Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    id: 'AWD-d4b7534c-f93b-457b-bb02-1f6de35b7c64',
    body: 'Venice Film Festival', category: 'Best Screenplay', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.8 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.8
  },

  // --- TORONTO INTERNATIONAL FILM FESTIVAL ---
  {
    id: 'AWD-74f80c16-153a-42df-af38-abb099a60e92',
    body: 'Toronto International Film Festival', category: 'Audience Award', format: 'film',
    evaluator: p => (p.awardsProfile?.audienceScore || 0) * 1.5 + (p.awardsProfile?.populistAppeal || 0)
  },
  {
    id: 'AWD-731eb482-a425-45c6-aaa0-8dd479ebc491',
    body: 'Toronto International Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.populistAppeal || 0) * 0.5
  },
  {
    id: 'AWD-0661b6f8-af1d-9d56-dc51-8362c6ea',
    body: 'Toronto International Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.populistAppeal || 0) * 0.8
  },
  {
    id: 'AWD-2e3c22c3-dd27-b599-657f-b51e8373',
    body: 'Toronto International Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.populistAppeal || 0) * 0.8
  },
  {
    id: 'AWD-4fc14821-ea44-5894-a1a5-ee1b578f',
    body: 'Toronto International Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.populistAppeal || 0) * 0.6
  },
  {
    id: 'AWD-c4bef688-0c61-552a-9edc-d62bafe8',
    body: 'Toronto International Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.populistAppeal || 0) * 0.6
  },

  // --- SXSW FILM FESTIVAL ---
  {
    id: 'AWD-51e94bd5-9370-e073-5b93-efe80653',
    body: 'SXSW Film Festival', category: 'Audience Award', format: 'film',
    evaluator: p => (p.awardsProfile?.audienceScore || 0) * 1.2 + (p.awardsProfile?.culturalHeat || 0) * 1.2
  },
  {
    id: 'AWD-a8171a48-ae35-6430-8742-1e336c07',
    body: 'SXSW Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.culturalHeat || 0) * 1.0
  },
  {
    id: 'AWD-dc16359b-bb3e-b99c-832f-eabde86d',
    body: 'SXSW Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.culturalHeat || 0) * 1.0
  },
  {
    id: 'AWD-fb1166c7-4de6-c087-dd9b-f4f61df9',
    body: 'SXSW Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.culturalHeat || 0) * 1.0
  },
  {
    id: 'AWD-c7c19912-a13b-8928-ae81-b1123030',
    body: 'SXSW Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.0 + (p.awardsProfile?.culturalHeat || 0) * 0.8
  },
  {
    id: 'AWD-ed15d268-bfd2-4956-6d33-67a2a7ad',
    body: 'SXSW Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.0 + (p.awardsProfile?.culturalHeat || 0) * 0.8
  },

  // --- TRIBECA FILM FESTIVAL ---
  {
    id: 'AWD-6800cd4d-e236-ca85-1573-44b72667',
    body: 'Tribeca Film Festival', category: 'Best Narrative Feature', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.industryNarrativeScore || 0)
  },
  {
    id: 'AWD-b70a3b3d-e1af-fdb9-9928-402ca154',
    body: 'Tribeca Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0) * 0.8
  },
  {
    id: 'AWD-8d8d3b60-127c-21e5-cf57-f519f4a7',
    body: 'Tribeca Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.craftScore || 0) * 0.5
  },
  {
    id: 'AWD-9a422153-b455-ffa1-2c11-3b3f5594',
    body: 'Tribeca Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.craftScore || 0) * 0.5
  },
  {
    id: 'AWD-31e2e644-25c2-1b71-80d4-97c06844',
    body: 'Tribeca Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.0 + (p.awardsProfile?.craftScore || 0) * 0.4
  },
  {
    id: 'AWD-536687ee-ced4-8e10-f383-221535b4',
    body: 'Tribeca Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.0 + (p.awardsProfile?.craftScore || 0) * 0.4
  },

  // --- TELLURIDE FILM FESTIVAL (Cannes Equivalent) ---
  {
    id: 'AWD-f37971b6-2dd9-6050-d5d8-1b803ed9',
    body: 'Telluride Film Festival', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.8 + (p.awardsProfile?.prestigeScore || 0) * 1.2
  },
  {
    id: 'AWD-705acf96-3342-815d-87d6-fe74e021',
    body: 'Telluride Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 2.0 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5
  },
  {
    id: 'AWD-31e2e644-25c2-1b71-80d4-97c06844',
    body: 'Telluride Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    id: 'AWD-536687ee-ced4-8e10-f383-221535b4',
    body: 'Telluride Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    id: 'AWD-5c1e72d5-fe76-8c77-8e84-dd7ef5a0',
    body: 'Telluride Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    id: 'AWD-b635badc-5089-a337-27a6-65fd23b9',
    body: 'Telluride Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },

  // --- SLAMDANCE FILM FESTIVAL (Sundance Equivalent) ---
  {
    id: 'AWD-4202dd5b-e29c-2bd9-50a7-2993d768',
    body: 'Slamdance Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 2.5 + (p.awardsProfile?.culturalHeat || 0) * 0.5
  },
  {
    id: 'AWD-b66a48f4-a731-7b55-ad5e-6f0ccf05',
    body: 'Slamdance Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 2.0 + (p.awardsProfile?.craftScore || 0) * 0.5
  },
  {
    id: 'AWD-d0dcf663-017b-333d-80f6-d1e68e8b',
    body: 'Slamdance Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0) * 0.5
  },
  {
    id: 'AWD-ca400782-bc4f-4ff3-84fc-a1864622',
    body: 'Slamdance Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0) * 0.5
  },
  {
    id: 'AWD-d2116d6e-f5ab-c001-b43b-e3c82ed4',
    body: 'Slamdance Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.craftScore || 0) * 0.4
  },
  {
    id: 'AWD-9fcada8a-9dbe-a763-7634-50ca85d8',
    body: 'Slamdance Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.craftScore || 0) * 0.4
  }
];

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
  body: AwardBody;
  category: AwardCategory;
  format: 'film' | 'tv' | 'both';
  evaluator: (p: Project) => number;
}

export const AWARD_CONFIGS: AwardConfig[] = [
  // --- ACADEMY AWARDS (Oscars) ---
  {
    body: 'Academy Awards', category: 'Best Picture', format: 'film',
    evaluator: p => {
      let base = (p.awardsProfile?.academyAppeal || 0) + (p.awardsProfile?.prestigeScore || 0) + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5;
      // Award Season Momentum: +15% if won Golden Globe Best Picture
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.category === 'Best Picture' && a.status === 'won');
      return hasGlobe ? base * 1.15 : base;
    }
  },
  {
    body: 'Academy Awards', category: 'Best Director', format: 'film',
    evaluator: p => {
      let base = (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.academyAppeal || 0) * 0.8;
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.status === 'won'); // Any Globe win helps Director momentum
      return hasGlobe ? base * 1.10 : base;
    }
  },
  {
    body: 'Academy Awards', category: 'Best Actor', format: 'film',
    evaluator: p => {
      let base = (p.awardsProfile?.craftScore || 0) + (p.buzz || 0) * 0.5;
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.category.includes('Actor') && a.status === 'won');
      return hasGlobe ? base * 1.15 : base;
    }
  },
  {
    body: 'Academy Awards', category: 'Best Actress', format: 'film',
    evaluator: p => {
      let base = (p.awardsProfile?.craftScore || 0) + (p.buzz || 0) * 0.5;
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.category.includes('Actress') && a.status === 'won');
      return hasGlobe ? base * 1.15 : base;
    }
  },
  {
    body: 'Academy Awards', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => {
      let base = (p.awardsProfile?.craftScore || 0) * 0.8 + (p.buzz || 0) * 0.4;
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.category.includes('Actor') && a.status === 'won');
      return hasGlobe ? base * 1.15 : base;
    }
  },
  {
    body: 'Academy Awards', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => {
      let base = (p.awardsProfile?.craftScore || 0) * 0.8 + (p.buzz || 0) * 0.4;
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.category.includes('Actress') && a.status === 'won');
      return hasGlobe ? base * 1.15 : base;
    }
  },

  // --- PRIMETIME EMMYS ---
  {
    body: 'Primetime Emmys', category: 'Best Drama Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.criticScore || 0) + (p.awardsProfile?.prestigeScore || 0) + (p.awardsProfile?.industryNarrativeScore || 0) * 0.8
  },
  {
    body: 'Primetime Emmys', category: 'Best Comedy Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.criticScore || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.awardsProfile?.populistAppeal || 0) * 0.5
  },
  {
    body: 'Primetime Emmys', category: 'Best Limited Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.criticScore || 0)
  },
  {
    body: 'Primetime Emmys', category: 'Best Actor (Drama)', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    body: 'Primetime Emmys', category: 'Best Actress (Drama)', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    body: 'Primetime Emmys', category: 'Best Actor (Comedy)', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.culturalHeat || 0) * 0.5
  },
  {
    body: 'Primetime Emmys', category: 'Best Actress (Comedy)', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.culturalHeat || 0) * 0.5
  },

  // --- GOLDEN GLOBES ---
  {
    body: 'Golden Globes', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.populistAppeal || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 2)
  },
  {
    body: 'Golden Globes', category: 'Best Drama Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.prestigeScore || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 4)
  },
  {
    body: 'Golden Globes', category: 'Best Comedy Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.populistAppeal || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 3)
  },
  {
    body: 'Golden Globes', category: 'Best TV Movie', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.criticScore || 0)
  },

  // --- INDEPENDENT SPIRIT AWARDS ---
  {
    body: 'Independent Spirit Awards', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 2 + (p.awardsProfile?.criticScore || 0)
  },

  // --- BAFTAs ---
  {
    body: 'BAFTAs', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0)
  },
  {
    body: 'BAFTAs', category: 'Best Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0)
  },
  {
    body: 'BAFTAs', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 0.8 + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    body: 'BAFTAs', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 0.8 + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },

  // --- SAG AWARDS ---
  {
    body: 'SAG Awards', category: 'Best Ensemble', format: 'both',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 0.5 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5 + (p.buzz || 0)
  },

  // --- GUILDS ---
  {
    body: 'Directors Guild Awards', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Producers Guild Awards', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.prestigeScore || 0) * 0.8 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5
  },
  {
    body: 'Writers Guild Awards', category: 'Best Screenplay', format: 'both',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5
  },

  // --- CRITICS CHOICE ---
  {
    body: 'Critics Choice Awards', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.criticScore || 0) * 2
  },
  {
    body: 'Critics Choice Awards', category: 'Best Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.criticScore || 0) * 2
  },

  // --- ANNIE AWARDS ---
  {
    body: 'Annie Awards', category: 'Best Animated Feature', format: 'film',
    evaluator: p => (p.genre === 'Animation' ? 200 : 0) + (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.audienceScore || 0)
  },

  // --- PEABODY AWARDS ---
  {
    body: 'Peabody Awards', category: 'Special Achievement', format: 'tv',
    evaluator: p => (p.awardsProfile?.culturalHeat || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0)
  },

  // --- CANNES FILM FESTIVAL ---
  {
    body: 'Cannes Film Festival', category: 'Palme d\'Or', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.2
  },
  {
    body: 'Cannes Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Cannes Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 2 + (p.awardsProfile?.indieCredibility || 0) * 0.5
  },
  {
    body: 'Cannes Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Cannes Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Cannes Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.6
  },
  {
    body: 'Cannes Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.6
  },
  {
    body: 'Cannes Film Festival', category: 'Best Screenplay', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.8 + (p.awardsProfile?.indieCredibility || 0) * 0.8
  },

  // --- SUNDANCE FILM FESTIVAL ---
  {
    body: 'Sundance Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 2 + (p.awardsProfile?.criticScore || 0)
  },
  {
    body: 'Sundance Film Festival', category: 'Audience Award', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.audienceScore || 0) * 1.5
  },
  {
    body: 'Sundance Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0)
  },
  {
    body: 'Sundance Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) + (p.awardsProfile?.criticScore || 0) * 0.8
  },
  {
    body: 'Sundance Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) + (p.awardsProfile?.criticScore || 0) * 0.8
  },
  {
    body: 'Sundance Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 0.8 + (p.awardsProfile?.criticScore || 0) * 0.5
  },
  {
    body: 'Sundance Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 0.8 + (p.awardsProfile?.criticScore || 0) * 0.5
  },
  {
    body: 'Sundance Film Festival', category: 'Best Screenplay', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0) * 0.5
  },

  // --- BERLIN INTERNATIONAL FILM FESTIVAL ---
  {
    body: 'Berlin International Film Festival', category: 'Golden Bear', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.2
  },
  {
    body: 'Berlin International Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Berlin International Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 2 + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    body: 'Berlin International Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Berlin International Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Berlin International Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Berlin International Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Berlin International Film Festival', category: 'Best Screenplay', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.8 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.8
  },

  // --- VENICE FILM FESTIVAL ---
  {
    body: 'Venice Film Festival', category: 'Golden Lion', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.5
  },
  {
    body: 'Venice Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.2
  },
  {
    body: 'Venice Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 2 + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    body: 'Venice Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Venice Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Venice Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Venice Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Venice Film Festival', category: 'Best Screenplay', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.8 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.8
  },

  // --- TORONTO INTERNATIONAL FILM FESTIVAL ---
  {
    body: 'Toronto International Film Festival', category: 'Audience Award', format: 'film',
    evaluator: p => (p.awardsProfile?.audienceScore || 0) * 1.5 + (p.awardsProfile?.populistAppeal || 0)
  },
  {
    body: 'Toronto International Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.populistAppeal || 0) * 0.5
  },
  {
    body: 'Toronto International Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.populistAppeal || 0) * 0.8
  },
  {
    body: 'Toronto International Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.populistAppeal || 0) * 0.8
  },
  {
    body: 'Toronto International Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.populistAppeal || 0) * 0.6
  },
  {
    body: 'Toronto International Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.populistAppeal || 0) * 0.6
  },

  // --- SXSW FILM FESTIVAL ---
  {
    body: 'SXSW Film Festival', category: 'Audience Award', format: 'film',
    evaluator: p => (p.awardsProfile?.audienceScore || 0) * 1.2 + (p.awardsProfile?.culturalHeat || 0) * 1.2
  },
  {
    body: 'SXSW Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.culturalHeat || 0) * 1.0
  },
  {
    body: 'SXSW Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.culturalHeat || 0) * 1.0
  },
  {
    body: 'SXSW Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.culturalHeat || 0) * 1.0
  },
  {
    body: 'SXSW Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.0 + (p.awardsProfile?.culturalHeat || 0) * 0.8
  },
  {
    body: 'SXSW Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.0 + (p.awardsProfile?.culturalHeat || 0) * 0.8
  },

  // --- TRIBECA FILM FESTIVAL ---
  {
    body: 'Tribeca Film Festival', category: 'Best Narrative Feature', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.industryNarrativeScore || 0)
  },
  {
    body: 'Tribeca Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0) * 0.8
  },
  {
    body: 'Tribeca Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.craftScore || 0) * 0.5
  },
  {
    body: 'Tribeca Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.craftScore || 0) * 0.5
  },
  {
    body: 'Tribeca Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.0 + (p.awardsProfile?.craftScore || 0) * 0.4
  },
  {
    body: 'Tribeca Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.0 + (p.awardsProfile?.craftScore || 0) * 0.4
  },

  // --- TELLURIDE FILM FESTIVAL (Cannes Equivalent) ---
  {
    body: 'Telluride Film Festival', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.8 + (p.awardsProfile?.prestigeScore || 0) * 1.2
  },
  {
    body: 'Telluride Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 2.0 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5
  },
  {
    body: 'Telluride Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Telluride Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Telluride Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Telluride Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },

  // --- SLAMDANCE FILM FESTIVAL (Sundance Equivalent) ---
  {
    body: 'Slamdance Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 2.5 + (p.awardsProfile?.culturalHeat || 0) * 0.5
  },
  {
    body: 'Slamdance Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 2.0 + (p.awardsProfile?.craftScore || 0) * 0.5
  },
  {
    body: 'Slamdance Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0) * 0.5
  },
  {
    body: 'Slamdance Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0) * 0.5
  },
  {
    body: 'Slamdance Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.craftScore || 0) * 0.4
  },
  {
    body: 'Slamdance Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.craftScore || 0) * 0.4
  }
];

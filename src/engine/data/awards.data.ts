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
    id: 'awd-cfg-001',
    body: 'Academy Awards', category: 'Best Picture', format: 'film',
    evaluator: p => {
      let base = (p.awardsProfile?.academyAppeal || 0) + (p.awardsProfile?.prestigeScore || 0) + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5;
      // Award Season Momentum: +15% if won Golden Globe Best Picture
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.category === 'Best Picture' && a.status === 'won');
      return hasGlobe ? base * 1.15 : base;
    }
  },
  {
    id: 'awd-cfg-002',
    body: 'Academy Awards', category: 'Best Director', format: 'film',
    evaluator: p => {
      let base = (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.academyAppeal || 0) * 0.8;
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.status === 'won'); // Any Globe win helps Director momentum
      return hasGlobe ? base * 1.10 : base;
    }
  },
  {
    id: 'awd-cfg-003',
    body: 'Academy Awards', category: 'Best Actor', format: 'film',
    evaluator: p => {
      let base = (p.awardsProfile?.craftScore || 0) + (p.buzz || 0) * 0.5;
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.category.includes('Actor') && a.status === 'won');
      return hasGlobe ? base * 1.15 : base;
    }
  },
  {
    id: 'awd-cfg-004',
    body: 'Academy Awards', category: 'Best Actress', format: 'film',
    evaluator: p => {
      let base = (p.awardsProfile?.craftScore || 0) + (p.buzz || 0) * 0.5;
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.category.includes('Actress') && a.status === 'won');
      return hasGlobe ? base * 1.15 : base;
    }
  },
  {
    id: 'awd-cfg-005',
    body: 'Academy Awards', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => {
      let base = (p.awardsProfile?.craftScore || 0) * 0.8 + (p.buzz || 0) * 0.4;
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.category.includes('Actor') && a.status === 'won');
      return hasGlobe ? base * 1.15 : base;
    }
  },
  {
    id: 'awd-cfg-006',
    body: 'Academy Awards', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => {
      let base = (p.awardsProfile?.craftScore || 0) * 0.8 + (p.buzz || 0) * 0.4;
      const hasGlobe = p.awards?.some(a => a.body === 'Golden Globes' && a.category.includes('Actress') && a.status === 'won');
      return hasGlobe ? base * 1.15 : base;
    }
  },

  // --- PRIMETIME EMMYS ---
  {
    id: 'awd-cfg-007',
    body: 'Primetime Emmys', category: 'Best Drama Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.criticScore || 0) + (p.awardsProfile?.prestigeScore || 0) + (p.awardsProfile?.industryNarrativeScore || 0) * 0.8
  },
  {
    id: 'awd-cfg-008',
    body: 'Primetime Emmys', category: 'Best Comedy Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.criticScore || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.awardsProfile?.populistAppeal || 0) * 0.5
  },
  {
    id: 'awd-cfg-009',
    body: 'Primetime Emmys', category: 'Best Limited Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.criticScore || 0)
  },
  {
    id: 'awd-cfg-010',
    body: 'Primetime Emmys', category: 'Best Actor (Drama)', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    id: 'awd-cfg-011',
    body: 'Primetime Emmys', category: 'Best Actress (Drama)', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    id: 'awd-cfg-012',
    body: 'Primetime Emmys', category: 'Best Actor (Comedy)', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.culturalHeat || 0) * 0.5
  },
  {
    id: 'awd-cfg-013',
    body: 'Primetime Emmys', category: 'Best Actress (Comedy)', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.culturalHeat || 0) * 0.5
  },

  // --- GOLDEN GLOBES ---
  {
    id: 'awd-cfg-014',
    body: 'Golden Globes', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.populistAppeal || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 2)
  },
  {
    id: 'awd-cfg-015',
    body: 'Golden Globes', category: 'Best Drama Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.prestigeScore || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 4)
  },
  {
    id: 'awd-cfg-016',
    body: 'Golden Globes', category: 'Best Comedy Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.populistAppeal || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 3)
  },
  {
    id: 'awd-cfg-017',
    body: 'Golden Globes', category: 'Best TV Movie', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.criticScore || 0)
  },

  // --- INDEPENDENT SPIRIT AWARDS ---
  {
    id: 'awd-cfg-018',
    body: 'Independent Spirit Awards', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 2 + (p.awardsProfile?.criticScore || 0)
  },

  // --- BAFTAs ---
  {
    id: 'awd-cfg-019',
    body: 'BAFTAs', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0)
  },
  {
    id: 'awd-cfg-020',
    body: 'BAFTAs', category: 'Best Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0)
  },
  {
    id: 'awd-cfg-021',
    body: 'BAFTAs', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 0.8 + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    id: 'awd-cfg-022',
    body: 'BAFTAs', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 0.8 + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },

  // --- SAG AWARDS ---
  {
    id: 'awd-cfg-023',
    body: 'SAG Awards', category: 'Best Ensemble', format: 'both',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 0.5 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5 + (p.buzz || 0)
  },

  // --- GUILDS ---
  {
    id: 'awd-cfg-024',
    body: 'Directors Guild Awards', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    id: 'awd-cfg-025',
    body: 'Producers Guild Awards', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.prestigeScore || 0) * 0.8 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5
  },
  {
    id: 'awd-cfg-026',
    body: 'Writers Guild Awards', category: 'Best Screenplay', format: 'both',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5
  },

  // --- CRITICS CHOICE ---
  {
    id: 'awd-cfg-027',
    body: 'Critics Choice Awards', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.criticScore || 0) * 2
  },
  {
    id: 'awd-cfg-028',
    body: 'Critics Choice Awards', category: 'Best Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.criticScore || 0) * 2
  },

  // --- ANNIE AWARDS ---
  {
    id: 'awd-cfg-029',
    body: 'Annie Awards', category: 'Best Animated Feature', format: 'film',
    evaluator: p => (p.genre === 'Animation' ? 200 : 0) + (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.audienceScore || 0)
  },

  // --- PEABODY AWARDS ---
  {
    id: 'awd-cfg-030',
    body: 'Peabody Awards', category: 'Special Achievement', format: 'tv',
    evaluator: p => (p.awardsProfile?.culturalHeat || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0)
  },

  // --- CANNES FILM FESTIVAL ---
  {
    id: 'awd-cfg-031',
    body: 'Cannes Film Festival', category: 'Palme d\'Or', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.2
  },
  {
    id: 'awd-cfg-032',
    body: 'Cannes Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    id: 'awd-cfg-033',
    body: 'Cannes Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 2 + (p.awardsProfile?.indieCredibility || 0) * 0.5
  },
  {
    id: 'awd-cfg-034',
    body: 'Cannes Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    id: 'awd-cfg-035',
    body: 'Cannes Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    id: 'awd-cfg-036',
    body: 'Cannes Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.6
  },
  {
    id: 'awd-cfg-037',
    body: 'Cannes Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.6
  },
  {
    id: 'awd-cfg-038',
    body: 'Cannes Film Festival', category: 'Best Screenplay', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.8 + (p.awardsProfile?.indieCredibility || 0) * 0.8
  },

  // --- SUNDANCE FILM FESTIVAL ---
  {
    id: 'awd-cfg-039',
    body: 'Sundance Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 2 + (p.awardsProfile?.criticScore || 0)
  },
  {
    id: 'awd-cfg-040',
    body: 'Sundance Film Festival', category: 'Audience Award', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.audienceScore || 0) * 1.5
  },
  {
    id: 'awd-cfg-041',
    body: 'Sundance Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0)
  },
  {
    id: 'awd-cfg-042',
    body: 'Sundance Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) + (p.awardsProfile?.criticScore || 0) * 0.8
  },
  {
    id: 'awd-cfg-043',
    body: 'Sundance Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) + (p.awardsProfile?.criticScore || 0) * 0.8
  },
  {
    id: 'awd-cfg-044',
    body: 'Sundance Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 0.8 + (p.awardsProfile?.criticScore || 0) * 0.5
  },
  {
    id: 'awd-cfg-045',
    body: 'Sundance Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 0.8 + (p.awardsProfile?.criticScore || 0) * 0.5
  },
  {
    id: 'awd-cfg-046',
    body: 'Sundance Film Festival', category: 'Best Screenplay', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0) * 0.5
  },

  // --- BERLIN INTERNATIONAL FILM FESTIVAL ---
  {
    id: 'awd-cfg-047',
    body: 'Berlin International Film Festival', category: 'Golden Bear', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.2
  },
  {
    id: 'awd-cfg-048',
    body: 'Berlin International Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    id: 'awd-cfg-049',
    body: 'Berlin International Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 2 + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    id: 'awd-cfg-050',
    body: 'Berlin International Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    id: 'awd-cfg-051',
    body: 'Berlin International Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    id: 'awd-cfg-052',
    body: 'Berlin International Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    id: 'awd-cfg-053',
    body: 'Berlin International Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    id: 'awd-cfg-054',
    body: 'Berlin International Film Festival', category: 'Best Screenplay', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.8 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.8
  },

  // --- VENICE FILM FESTIVAL ---
  {
    id: 'awd-cfg-055',
    body: 'Venice Film Festival', category: 'Golden Lion', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.5
  },
  {
    id: 'awd-cfg-056',
    body: 'Venice Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.2
  },
  {
    id: 'awd-cfg-057',
    body: 'Venice Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 2 + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    id: 'awd-cfg-058',
    body: 'Venice Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    id: 'awd-cfg-059',
    body: 'Venice Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    id: 'awd-cfg-060',
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

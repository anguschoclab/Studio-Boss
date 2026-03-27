import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { AGENCY_ARCHETYPES } from '@/engine/data/archetypes';
import { TalentProfile } from '@/engine/types';

export const TalentPanel = () => {
  const state = useGameStore(s => s.gameState);
  const talentPool = useMemo(() => state?.industry.talentPool || [], [state?.industry.talentPool]);
  const agencies = useMemo(() => state?.industry.agencies || [], [state?.industry.agencies]);
  const agencyMap = useMemo(() => new Map(agencies.map(a => [a.id, a])), [agencies]);
  const [filter, setFilter] = useState<string>('all');

  const filteredTalent = useMemo(() => {
    return talentPool.filter(t => filter === 'all' || t.roles.includes(filter as import('@/engine/types').TalentRole));
  }, [talentPool, filter]);

  return (
    <div className="space-y-4 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <h2 className="text-2xl font-display font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 drop-shadow-sm">Talent Roster</h2>
        <div className="flex gap-2 flex-wrap justify-end">
          {['all', 'actor', 'director', 'writer', 'producer', 'showrunner'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              aria-pressed={filter === type}
              className={`px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-black rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ${
                filter === type
                  ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-105 border border-primary/50'
                  : 'bg-muted/50 text-muted-foreground hover:bg-secondary/20 hover:text-foreground hover:-translate-y-0.5 border border-transparent hover:border-secondary/30'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-6 custom-scrollbar pr-2">
        {filteredTalent.map((talent: TalentProfile) => (
          <div key={talent.id} className={`p-4 rounded-xl border ${talent.prestige >= 80 ? 'border-primary/50 shadow-[0_0_20px_rgba(234,179,8,0.15)] bg-card/80 bg-gradient-to-br from-primary/10 to-transparent' : 'border-border/60 bg-card/60 bg-gradient-to-br from-card/80 to-transparent'} backdrop-blur-md hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 space-y-3.5 group relative overflow-hidden cursor-pointer`}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex items-start justify-between gap-2 relative z-10">
<div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-[15px] text-foreground leading-tight group-hover:text-primary transition-colors drop-shadow-sm">{talent.name}</h4>
                  {talent.hasRazzie && (
                    <Badge variant="destructive" className="text-[8px] px-1 py-0 h-4 bg-pink-500/20 text-pink-500 border-pink-500/30">RAZZIE WINNER</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {talent.accessLevel !== 'outsider' && talent.accessLevel !== 'soft-access' && (
                    <span className="text-[9px] font-black tracking-widest text-secondary uppercase drop-shadow-[0_0_2px_rgba(255,161,22,0.4)]">
                      {talent.accessLevel}
                    </span>
                  )}
{talent.agencyId && (() => {
                    const agency = agencyMap.get(talent.agencyId);
                    if (!agency) return null;
                    const archetype = agency.archetype ? AGENCY_ARCHETYPES[agency.archetype] : null;
                    return (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <span className="text-[9px] font-bold tracking-widest text-muted-foreground/80 uppercase bg-background/50 backdrop-blur-sm px-1.5 py-0.5 rounded border border-border/40 shadow-sm group-hover:border-primary/20 transition-colors cursor-help">
                            {agency.name}
                          </span>
                        </HoverCardTrigger>
                        {archetype && (
                          <HoverCardContent className="w-80 z-50">
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">{archetype.name} Agency</h4>
                              <p className="text-sm text-muted-foreground">
                                {archetype.description}
                              </p>
                              {agency.traits && agency.traits.length > 0 && (
                                <div className="mt-2 text-xs">
                                  <strong>Traits:</strong>
                                  <ul className="list-disc pl-4 mt-1">
                                    {agency.traits.map((t, i) => <li key={i}>{t}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </HoverCardContent>
                        )}
                      </HoverCard>
                    );
                  })()}
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase shrink-0 bg-background/80 backdrop-blur-md border-border/50 text-foreground/80 group-hover:border-primary/30 transition-colors shadow-sm">
                {talent.roles.map(r => r).join(', ')}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-border/40 relative z-10">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Prestige</div>
                <div className="font-semibold text-primary">{talent.prestige}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Fee</div>
                <div className="font-semibold text-success">{formatMoney(talent.fee)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Draw</div>
                <div className="font-semibold">{talent.draw}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Temperament</div>
                <div className="font-semibold">{talent.temperament}</div>
              </div>
            </div>
          </div>
        ))}
        {filteredTalent.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No talent found matching this filter.
          </div>
        )}
      </div>
    </div>
  );
};

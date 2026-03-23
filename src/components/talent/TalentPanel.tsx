import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { Badge } from '@/components/ui/badge';
import { TalentProfile } from '@/engine/types';

export const TalentPanel = () => {
  const state = useGameStore(s => s.gameState);
  const talentPool = useMemo(() => state?.talentPool || [], [state?.talentPool]);
  const agencies = useMemo(() => state?.agencies || [], [state?.agencies]);
  const agencyMap = useMemo(() => new Map(agencies.map(a => [a.id, a])), [agencies]);
  const [filter, setFilter] = useState<string>('all');

  const filteredTalent = useMemo(() => {
    return talentPool.filter(t => filter === 'all' || t.roles.includes(filter as import('@/engine/types').TalentRole));
  }, [talentPool, filter]);

  return (
    <div className="space-y-4 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Talent Roster</h2>
        <div className="flex gap-2">
          {['all', 'actor', 'director', 'writer', 'producer', 'showrunner'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${
                filter === type
                  ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(234,179,8,0.4)] scale-105'
                  : 'bg-muted/50 text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground hover:scale-105'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-6">
        {filteredTalent.map((talent: TalentProfile) => (
          <div key={talent.id} className={`p-4 rounded-xl border ${talent.prestige >= 80 ? 'border-primary/60 shadow-[0_0_20px_rgba(234,179,8,0.2)] bg-card/80 bg-gradient-to-br from-primary/5 to-transparent' : 'border-border/50 bg-card/40'} backdrop-blur-md hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 space-y-3.5 group relative overflow-hidden`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <h4 className="font-display font-bold text-sm text-foreground leading-tight group-hover:text-primary transition-colors">{talent.name}</h4>
                {talent.accessLevel !== 'outsider' && talent.accessLevel !== 'soft-access' && (
                  <span className="text-[9px] font-black tracking-widest text-secondary uppercase">
                    {talent.accessLevel}
                  </span>
                )}
                {talent.agencyId && (
                  <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase bg-muted/50 px-1.5 py-0.5 rounded w-fit mt-1">
                    {agencyMap.get(talent.agencyId)?.name}
                  </span>
                )}
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {talent.roles.map(r => r.toUpperCase()).join(', ')}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-border/40">
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

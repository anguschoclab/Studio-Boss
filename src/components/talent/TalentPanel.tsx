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
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold">Talent Roster</h2>
        <div className="flex gap-2">
          {['all', 'actor', 'director', 'writer', 'producer', 'showrunner'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                filter === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-6">
        {filteredTalent.map((talent: TalentProfile) => (
          <div key={talent.id} className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <h4 className="font-display font-semibold text-sm text-foreground leading-tight">{talent.name}</h4>
                {talent.accessLevel !== 'outsider' && talent.accessLevel !== 'soft-access' && (
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                    {talent.accessLevel}
                  </span>
                )}
                {talent.agencyId && (
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {agencyMap.get(talent.agencyId)?.name}
                  </span>
                )}
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {talent.roles.map(r => r.toUpperCase()).join(', ')}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="text-muted-foreground">Prestige</div>
                <div className="font-semibold text-primary">{talent.prestige}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Fee</div>
                <div className="font-semibold text-success">{formatMoney(talent.fee)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Draw</div>
                <div className="font-semibold">{talent.draw}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Temperament</div>
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

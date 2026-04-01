import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Talent } from '@/engine/types';
import { TalentModal } from './TalentProfileModal';
import { TalentCard } from './TalentCard';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';

export const TalentPanel = () => {
  const state = useGameStore(s => s.gameState);
  const talentPool = useMemo(() => Object.values(state?.industry.talentPool || {}), [state?.industry.talentPool]);
  const [filter, setFilter] = useState<string>('all');

  const filteredTalent = useMemo(() => {
    return talentPool.filter(t => filter === 'all' || t.roles.includes(filter as any));
  }, [talentPool, filter]);

  return (
    <div className="space-y-4 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <h2 className="text-2xl font-display font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 drop-shadow-sm">Talent Roster</h2>
        <div className="flex gap-2 flex-wrap justify-end">
          {['all', 'actor', 'director', 'writer', 'producer'].map(type => (
            <TooltipWrapper key={type} tooltip={`Filter by ${type === 'all' ? 'all professional roles' : `the ${type} category`}`} side="bottom">
              <button
                onClick={() => setFilter(type)}
                className={`px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-black rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ${
                  filter === type
                    ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-105 border border-primary/50'
                    : 'bg-muted/50 text-muted-foreground hover:bg-secondary/20 hover:text-foreground hover:-translate-y-0.5 border border-transparent hover:border-secondary/30'
                }`}
              >
                {type}
              </button>
            </TooltipWrapper>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-6 custom-scrollbar pr-2">
        {filteredTalent.map((talent: Talent) => (
          <TalentCard key={talent.id} talent={talent} />
        ))}
        {filteredTalent.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No talent found matching this filter.
          </div>
        )}
      </div>
      <TalentModal />
    </div>
  );
};

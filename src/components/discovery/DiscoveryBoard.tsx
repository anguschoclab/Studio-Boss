import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Opportunity } from '@/engine/types';

import { selectOpportunities } from '@/store/selectors';

import { TrendBoard } from '@/components/trends/TrendBoard';
import { NewsFeed } from '@/components/news/NewsFeed';
import { ScrollArea } from '@/components/ui/scroll-area';

export const DiscoveryBoard = () => {
  const opportunities = useGameStore(s => selectOpportunities(s.gameState));
  const { openCreateProject } = useUIStore();

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      {/* Main Market Area */}
      <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="font-display text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 tracking-tight">Discovery Market</h2>
          <Button onClick={openCreateProject} size="sm" className="font-display gap-1.5 font-bold hover:scale-105 transition-transform active:scale-95 shadow-sm hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            <Plus className="h-4 w-4" />
            Create Original
          </Button>
        </div>

        <ScrollArea className="flex-1 h-full pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-8">
            {opportunities.length === 0 ? (
              <div className="col-span-full border-2 border-dashed border-border/50 rounded-xl p-16 text-center bg-card/20 backdrop-blur-sm shadow-inner">
                <p className="text-base text-muted-foreground/80 font-medium">The town is quiet. No active scripts or pitches.</p>
              </div>
            ) : (
              opportunities.map(opp => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Industry Sidebar */}
      <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0 h-full overflow-hidden">
        <div className="h-1/2">
          <TrendBoard />
        </div>
        <div className="flex-1 min-h-0 bg-card/30 rounded-xl border border-border/40 overflow-hidden flex flex-col">
          <NewsFeed />
        </div>
      </div>
    </div>
  );
};

const OpportunityCard = ({ opportunity: opp }: { opportunity: Opportunity }) => {
  const acquireOpportunity = useGameStore(s => s.acquireOpportunity);
  return (
    <div className="bg-card/40 backdrop-blur-md rounded-xl border border-border/60 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between h-full group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="space-y-3 relative z-10">
        <div className="flex justify-between items-start gap-3">
          <h3 className="font-display font-bold text-foreground leading-tight group-hover:text-primary transition-colors drop-shadow-sm" title={opp.title}>
            {opp.title}
          </h3>
          <span className="shrink-0 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md bg-muted/60 border border-border/50 text-muted-foreground shadow-sm group-hover:border-primary/30 transition-colors">
            {opp.type}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-medium text-muted-foreground/90">{opp.genre} <span className="text-muted-foreground/50 mx-1">•</span> {opp.format.toUpperCase()}</p>
          <p className="text-[11px] font-semibold text-secondary">{opp.budgetTier.toUpperCase()} BUDGET</p>
        </div>

        <div className="text-xs bg-muted/30 p-2.5 rounded-md italic text-foreground/80 border-l-2 border-primary/40 leading-relaxed shadow-inner">
          "{opp.flavor}"
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-border/50 flex justify-between items-center relative z-10">
        <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse shadow-[0_0_5px_rgba(250,204,21,0.5)]"></span>
          {opp.weeksUntilExpiry} weeks left
        </div>
        <Button size="sm" variant="secondary" className="h-8 text-[11px] px-4 font-bold hover:bg-primary hover:text-primary-foreground transition-colors hover:shadow-[0_0_10px_rgba(234,179,8,0.4)]" onClick={() => acquireOpportunity(opp.id)}>
          Acquire
        </Button>
      </div>
    </div>
  );
};

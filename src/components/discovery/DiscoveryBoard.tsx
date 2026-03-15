import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Opportunity } from '@/engine/types';

export const DiscoveryBoard = () => {
  const opportunities = useGameStore(s => s.gameState?.opportunities || []);
  const { openCreateProject } = useUIStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Discovery Market</h2>
        <Button onClick={openCreateProject} size="sm" className="font-display gap-1.5">
          <Plus className="h-4 w-4" />
          Create Original
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {opportunities.length === 0 ? (
          <div className="col-span-3 border border-dashed border-border rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">The town is quiet. No active scripts or pitches.</p>
          </div>
        ) : (
          opportunities.map(opp => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))
        )}
      </div>
    </div>
  );
};

const OpportunityCard = ({ opportunity: opp }: { opportunity: Opportunity }) => {
  const { acquireOpportunity } = useGameStore();
  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-sm hover:border-primary/50 transition-colors flex flex-col justify-between h-full">
      <div className="space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-display font-semibold text-foreground line-clamp-1" title={opp.title}>
            {opp.title}
          </h3>
          <span className="shrink-0 text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {opp.type}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">{opp.genre} • {opp.format.toUpperCase()} • {opp.budgetTier} budget</p>

        <div className="text-xs bg-muted/50 p-2 rounded italic text-foreground/80 line-clamp-2">
          "{opp.flavor}"
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
        <div className="text-[10px] text-muted-foreground">
          {opp.weeksUntilExpiry} weeks left
        </div>
        <Button size="sm" variant="secondary" className="h-7 text-[11px] px-3" onClick={() => acquireOpportunity(opp.id)}>
          Acquire
        </Button>
      </div>
    </div>
  );
};

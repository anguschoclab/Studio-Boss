import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export const ProjectDetailModal = () => {
  const { selectedProjectId, selectProject } = useUIStore();
  const projects = useGameStore(s => s.gameState?.projects || []);
  const project = projects.find(p => p.id === selectedProjectId);

  if (!project) return null;

  const tier = BUDGET_TIERS[project.budgetTier];

  return (
    <Dialog open={!!selectedProjectId} onOpenChange={() => selectProject(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{project.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{project.format.toUpperCase()}</Badge>
            <Badge variant="outline">{project.genre}</Badge>
            <Badge variant="outline">{tier.name}</Badge>
            <Badge variant="outline" className="capitalize">{project.status}</Badge>
          </div>

          {project.flavor && (
            <p className="text-sm text-muted-foreground italic">"{project.flavor}"</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded bg-accent/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Budget</p>
              <p className="text-sm font-semibold text-foreground">{formatMoney(project.budget)}</p>
            </div>
            <div className="p-3 rounded bg-accent/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Weekly Cost</p>
              <p className="text-sm font-semibold text-destructive">{formatMoney(project.weeklyCost)}/wk</p>
            </div>
            <div className="p-3 rounded bg-accent/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Buzz</p>
              <p className="text-sm font-semibold text-secondary">{Math.round(project.buzz)}%</p>
            </div>
            <div className="p-3 rounded bg-accent/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Target</p>
              <p className="text-sm font-semibold text-foreground">{project.targetAudience}</p>
            </div>
          </div>

          {/* Progress */}
          {(project.status === 'development' || project.status === 'production') && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="capitalize">{project.status} Progress</span>
                <span>
                  {project.weeksInPhase}/{project.status === 'development' ? project.developmentWeeks : project.productionWeeks} weeks
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${(project.weeksInPhase / (project.status === 'development' ? project.developmentWeeks : project.productionWeeks)) * 100}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Revenue */}
          {(project.status === 'released' || project.status === 'archived') && (
            <div className="p-3 rounded bg-accent/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Gross</p>
              <p className="text-lg font-display font-bold text-success">{formatMoney(project.revenue)}</p>
              {project.status === 'released' && (
                <p className="text-xs text-muted-foreground">Current weekly: {formatMoney(project.weeklyRevenue)}</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

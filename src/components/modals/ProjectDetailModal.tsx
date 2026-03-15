import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ProjectDetailModal = () => {
  const { selectedProjectId, selectProject } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const signContract = useGameStore(s => s.signContract);
  const renewProject = useGameStore(s => s.renewProject);
  const projects = useMemo(() => gameState?.projects || [], [gameState?.projects]);
  const project = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
  const talentPool = useMemo(() => gameState?.talentPool || [], [gameState?.talentPool]);
  const contracts = useMemo(() => gameState?.contracts || [], [gameState?.contracts]);

  if (!project) return null;

  const tier = BUDGET_TIERS[project.budgetTier];

  return (
    <Dialog open={!!selectedProjectId} onOpenChange={() => selectProject(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
              {project.title}
              {project.format === 'tv' && project.season && (
                  <span className="text-muted-foreground text-sm ml-2">Season {project.season}</span>
              )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{project.format.toUpperCase()}</Badge>
            {project.format === 'tv' && project.tvFormat && (
                <Badge variant="secondary">{TV_FORMATS[project.tvFormat].name}</Badge>
            )}
            {project.format === 'tv' && project.releaseModel && (
                <Badge variant="outline" className="capitalize">{project.releaseModel}</Badge>
            )}
            <Badge variant="outline">{project.genre}</Badge>
            <Badge variant="outline">{tier.name}</Badge>
            <Badge variant="outline" className="capitalize">{project.status}</Badge>
          </div>

          {project.flavor && (
            <p className="text-sm text-muted-foreground italic">"{project.flavor}"</p>
          )}

          {/* Casting Section */}
          <div className="space-y-2 border-t border-border pt-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Cast & Crew</h4>
            {['director', 'actor', 'writer', 'producer'].map(role => {
              const roleContracts = contracts.filter(c => c.projectId === project.id);
              const roleTalentIds = roleContracts.map(c => c.talentId);
              const attachedTalent = talentPool.filter(t => roleTalentIds.includes(t.id) && t.roles.includes(role as import('@/engine/types').TalentRole));
              const availableTalent = talentPool.filter(t => t.roles.includes(role as import('@/engine/types').TalentRole) && !roleTalentIds.includes(t.id));

              return (
                <div key={role} className="flex items-center justify-between text-xs p-2 bg-accent/30 rounded">
                  <span className="capitalize w-16">{role}</span>
                  {attachedTalent.length > 0 ? (
                    <div className="flex flex-col gap-1 w-full max-w-[200px]">
                      {attachedTalent.map(t => (
                        <span key={t.id} className="text-foreground font-semibold">{t.name}</span>
                      ))}
                    </div>
                  ) : project.status === 'development' ? (
                    <Select onValueChange={(val) => {
                      if (val && gameState && gameState.cash >= talentPool.find(t => t.id === val)!.fee) {
                        signContract(val, project.id);
                      }
                    }}>
                      <SelectTrigger className="h-6 w-[200px] text-xs">
                        <SelectValue placeholder="Cast Role..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTalent.map(t => (
                          <SelectItem key={t.id} value={t.id} disabled={gameState ? gameState.cash < t.fee : true}>
                            {t.name} ({formatMoney(t.fee)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-muted-foreground w-[200px] text-right">None</span>
                  )}
                </div>
              );
            })}
          </div>

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
            {project.format === 'tv' && (
                <div className="p-3 rounded bg-accent/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Episodes</p>
                  <p className="text-sm font-semibold text-foreground">{project.episodes}</p>
                </div>
            )}
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
                <p className="text-xs text-muted-foreground mt-1">
                    Current weekly: {formatMoney(project.weeklyRevenue)}
                    {project.format === 'tv' && project.episodesReleased !== undefined && (
                        <span className="ml-2">| Released: {project.episodesReleased}/{project.episodes}</span>
                    )}
                </p>
              )}
            </div>
          )}

          {/* Renew Button */}
          {project.status === 'archived' && project.format === 'tv' && project.renewable && (
            <div className="pt-4 border-t border-border flex justify-end">
                <Button
                    onClick={() => {
                        renewProject(project.id);
                        selectProject(null);
                    }}
                    className="font-display w-full"
                >
                    Renew for Season {(project.season || 1) + 1}
                </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

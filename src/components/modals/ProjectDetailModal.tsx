import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { evaluateGreenlight } from '@/engine/systems/greenlight';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ProjectDetailModal = () => {
  const { selectedProjectId, selectProject } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const signContract = useGameStore(s => s.signContract);
  const renewProject = useGameStore(s => s.renewProject);
  const greenlightProject = useGameStore(s => s.greenlightProject);
  const exploitFranchise = useGameStore(s => s.exploitFranchise);
  const projects = useMemo(() => gameState?.projects || [], [gameState?.projects]);
  const project = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
  const talentPool = useMemo(() => gameState?.talentPool || [], [gameState?.talentPool]);
  const contracts = useMemo(() => gameState?.contracts || [], [gameState?.contracts]);
  const talentMap = useMemo(() => new Map(talentPool.map(t => [t.id, t])), [talentPool]);

  const tier = project ? BUDGET_TIERS[project.budgetTier] : null;

  const greenlightReport = useMemo(() => {
    if (!project || project.status !== 'needs_greenlight' || !gameState) return null;
    const projectContracts = contracts.filter(c => c.projectId === project.id);
    const talentPoolMap = new Map(talentPool.map(t => [t.id, t]));
    const attachedTalent = projectContracts.reduce((acc, c) => {
      const t = talentPoolMap.get(c.talentId);
      if (t) acc.push(t);
      return acc;
    }, [] as import('@/engine/types').TalentProfile[]);
    return evaluateGreenlight(project, gameState.cash, attachedTalent);
  }, [project, gameState, contracts, talentPool]);

  if (!project || !tier) return null;

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


          {/* Greenlight Committee */}
          {project.status === 'needs_greenlight' && greenlightReport && (
            <div className="space-y-3 border border-warning/50 bg-warning/10 p-4 rounded-lg">
              <div className="flex items-center justify-between border-b border-warning/20 pb-2">
                <h4 className="font-display font-semibold text-warning-foreground">Greenlight Committee Readout</h4>
                <Badge variant={greenlightReport.score >= 60 ? 'default' : 'destructive'}>
                  {greenlightReport.recommendation}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                {greenlightReport.positives.length > 0 && (
                  <div>
                    <span className="font-semibold text-success">Pros:</span>
                    <ul className="list-disc list-inside text-muted-foreground ml-2">
                      {greenlightReport.positives.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
                {greenlightReport.negatives.length > 0 && (
                  <div>
                    <span className="font-semibold text-destructive">Cons:</span>
                    <ul className="list-disc list-inside text-muted-foreground ml-2">
                      {greenlightReport.negatives.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              <Button
                className="w-full mt-2"
                variant={greenlightReport.score >= 60 ? 'default' : 'destructive'}
                onClick={() => {
                  greenlightProject(project.id);
                  selectProject(null);
                }}
              >
                Approve Greenlight
              </Button>
            </div>
          )}


          {/* Casting Section */}
          <div className="space-y-2 border-t border-border pt-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Cast & Crew</h4>
            {(() => {
              const projectContracts = contracts.filter(c => c.projectId === project.id);
              const projectTalentIds = new Set(projectContracts.map(c => c.talentId));

              return ['director', 'actor', 'writer', 'producer'].map(role => {
                const roleEnum = role as import('@/engine/types').TalentRole;
                const attachedTalent = [];
                const availableTalent = [];

                for (const t of talentPool) {
                  if (t.roles.includes(roleEnum)) {
                    if (projectTalentIds.has(t.id)) {
                      attachedTalent.push(t);
                    } else {
                      availableTalent.push(t);
                    }
                  }
                }


              return (
                <div key={role} className="flex items-center justify-between text-xs p-2 bg-accent/30 rounded">
                  <span className="capitalize w-16">{role}</span>
                  {attachedTalent.length > 0 ? (
                    <div className="flex flex-col gap-1 w-full max-w-[200px]">
                      {attachedTalent.map(t => (
                        <span key={t.id} className="text-foreground font-semibold">{t.name}</span>
                      ))}
                    </div>
                  ) : (project.status === 'development' || project.status === 'needs_greenlight') ? (
                    <Select onValueChange={(val) => {
                      if (val && gameState && gameState.cash >= talentMap.get(val)!.fee) {
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
            })})()}
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

          {/* Franchise Exploitation Button */}
          {project.status === 'released' && project.revenue > project.budget * 1.5 && (
            <div className="pt-4 border-t border-border flex justify-end">
                <Button
                    onClick={() => {
                        exploitFranchise(project.id);
                        selectProject(null);
                    }}
                    className="font-display w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                >
                    Develop Spinoff
                </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

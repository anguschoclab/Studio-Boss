import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Target, TrendingUp } from 'lucide-react';
import { selectReleasedProjects } from '@/store/selectors';

export const StrategyPanel: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);

  const prestige = gameState?.studio?.prestige ?? 0;
  const prestigeGoal = prestige >= 80 ? 100 : 80;
  const prestigeLabel = prestige >= 80 ? 'Build Prestige to 100' : 'Build Prestige to 80+';

  const currentYear = Math.floor((gameState?.week ?? 0) / 52);
  const releasedThisYear = useMemo(() => {
    return selectReleasedProjects(gameState).filter(p =>
      p.releaseWeek !== null && Math.floor((p.releaseWeek ?? 0) / 52) === currentYear
    ).length;
  }, [gameState, currentYear]);
  const releaseGoal = 3;

  const tier = prestige >= 90 ? 'Tier 1 Studio' : prestige >= 70 ? 'Tier 2 Studio' : prestige >= 50 ? 'Tier 3 Studio' : 'Emerging Studio';
  const tierDesc = prestige >= 90 ? 'Industry leader' : prestige >= 70 ? 'Rising competitor' : prestige >= 50 ? 'Building reputation' : 'Establishing foothold';

  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-6 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Current Goal</span>
            </div>
            <p className="font-bold text-sm">{prestigeLabel}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Current: {prestige}/{prestigeGoal}
            </p>
            <div className="mt-2 h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((prestige / prestigeGoal) * 100))}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-transparent border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Next Milestone</span>
            </div>
            <p className="font-bold text-sm">Release {releaseGoal} Projects This Year</p>
            <p className="text-xs text-muted-foreground mt-1">
              Progress: {releasedThisYear}/{releaseGoal} complete
            </p>
            <div className="mt-2 h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((releasedThisYear / releaseGoal) * 100))}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Market Position</span>
            </div>
            <p className="font-bold text-sm">{tier}</p>
            <p className="text-xs text-muted-foreground mt-1">{tierDesc}</p>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 bg-card/40 border border-border/40 rounded-xl">
        <h4 className="text-sm font-black uppercase tracking-wider mb-4">Strategic Recommendations</h4>
        <div className="space-y-3">
          {prestige < 80 && (
            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="text-sm font-bold">Focus on Prestige Projects</p>
                <p className="text-xs text-muted-foreground">Your prestige is at {prestige}. Greenlight 2-3 high-quality dramas to reach 80+.</p>
              </div>
            </div>
          )}

          {releasedThisYear < releaseGoal && (
            <div className="flex items-start gap-3 p-3 bg-secondary/5 rounded-lg border border-secondary/10">
              <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-secondary">{prestige < 80 ? 2 : 1}</span>
              </div>
              <div>
                <p className="text-sm font-bold">Accelerate Releases</p>
                <p className="text-xs text-muted-foreground">{releaseGoal - releasedThisYear} more release{releaseGoal - releasedThisYear > 1 ? 's' : ''} needed this year. Check the production pipeline.</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-3 bg-secondary/5 rounded-lg border border-secondary/10">
            <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-secondary">{(prestige < 80 ? 1 : 0) + (releasedThisYear < releaseGoal ? 1 : 0) + 1}</span>
            </div>
            <div>
              <p className="text-sm font-bold">Secure A-List Talent</p>
              <p className="text-xs text-muted-foreground">Talent with 80+ prestige boosts project quality. Check the Talent Marketplace.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

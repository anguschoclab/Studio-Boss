import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/engine/utils';
import { Skull, Trophy, BarChart3, RefreshCw, Star } from 'lucide-react';

// ---------------------------------------------------------------------------
// GameOverModal
//
// Rendered directly in App when gameState.studio.isBankrupt === true.
// It is NOT driven by the modal queue.
// ---------------------------------------------------------------------------

export const GameOverModal = () => {
  const gameState = useGameStore((s) => s.gameState);
  const clearGame = useGameStore((s) => s.clearGame);

  const [showBreakdown, setShowBreakdown] = useState(false);

  const stats = useMemo(() => {
    if (!gameState) return null;

    // Peak cash from weekly history
    const history = gameState.finance.weeklyHistory ?? [];
    const peakCash = history.length > 0
      ? Math.max(...history.map((s) => s.cash))
      : gameState.finance.cash;

    // Best project by revenue
    const allProjects = Object.values(gameState.entities.projects ?? {});
    const releasedProjects = allProjects.filter((p) => p.state === 'released' || p.state === 'archived');
    const bestProject = releasedProjects.reduce<typeof releasedProjects[0] | null>((best, p) => {
      if (!best) return p;
      return (p.revenue ?? 0) > (best.revenue ?? 0) ? p : best;
    }, null);

    const prestige = gameState.studio.prestige ?? 0;
    const weeksSurvived = gameState.week ?? 0;
    const legacyScore = prestige * 100 + weeksSurvived * 10;

    return {
      peakCash,
      bestProject,
      prestige,
      weeksSurvived,
      legacyScore,
      releasedCount: releasedProjects.length,
      currentCash: gameState.finance.cash,
    };
  }, [gameState]);

  if (!stats) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-2xl">
      <div className="relative w-full max-w-2xl space-y-8 px-6 py-12 text-center">

        {/* ---------------------------------------------------------------- */}
        {/* Header                                                             */}
        {/* ---------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Skull className="h-16 w-16 text-destructive opacity-80" />
          </div>

          <h1 className="font-display font-black text-6xl uppercase tracking-tighter text-destructive drop-shadow-[0_0_32px_rgba(var(--destructive),0.6)]">
            Studio Bankrupt
          </h1>

          <p className="text-base text-muted-foreground">
            The creditors have called. The lights are out. Your Hollywood dream has come to an end.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Legacy Score                                                       */}
        {/* ---------------------------------------------------------------- */}
        <Card className="glass-card border-primary/30 bg-primary/5">
          <CardContent className="py-6">
            <p className="text-[10px] font-display font-black uppercase tracking-widest text-muted-foreground">
              Legacy Score
            </p>
            <p className="font-tabular-nums mt-2 font-display font-black text-6xl text-primary drop-shadow-[0_0_16px_rgba(var(--primary),0.5)]">
              {stats.legacyScore.toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Prestige ({stats.prestige}) × 100 + Weeks Survived ({stats.weeksSurvived}) × 10
            </p>
          </CardContent>
        </Card>

        {/* ---------------------------------------------------------------- */}
        {/* Key Stats Grid                                                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              icon: <Star className="h-4 w-4" />,
              label: 'Peak Cash',
              value: formatMoney(stats.peakCash),
              color: 'text-primary',
            },
            {
              icon: <Trophy className="h-4 w-4" />,
              label: 'Best Project',
              value: stats.bestProject?.title ?? 'None',
              color: 'text-success',
            },
            {
              icon: <BarChart3 className="h-4 w-4" />,
              label: 'Prestige Reached',
              value: `${stats.prestige}`,
              color: 'text-warning',
            },
            {
              icon: <RefreshCw className="h-4 w-4" />,
              label: 'Weeks Survived',
              value: `${stats.weeksSurvived}`,
              color: 'text-secondary',
            },
          ].map((stat) => (
            <Card key={stat.label} className="glass-card border-border/40">
              <CardContent className="flex flex-col items-center gap-1 py-5">
                <span className="text-muted-foreground">{stat.icon}</span>
                <p className="text-[9px] font-display font-black uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
                <p className={`font-tabular-nums text-xl font-display font-black ${stat.color} truncate`}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Stats Breakdown (toggled)                                         */}
        {/* ---------------------------------------------------------------- */}
        {showBreakdown && (
          <Card className="glass-card border-border/40 text-left">
            <CardContent className="py-6">
              <p className="mb-4 text-[10px] font-display font-black uppercase tracking-widest text-muted-foreground">
                Full Breakdown
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Final Cash Position</span>
                  <span className="font-tabular-nums font-bold text-destructive">
                    {formatMoney(stats.currentCash)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peak Cash Held</span>
                  <span className="font-tabular-nums font-bold text-primary">
                    {formatMoney(stats.peakCash)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projects Released</span>
                  <span className="font-bold">{stats.releasedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Best Project Revenue</span>
                  <span className="font-tabular-nums font-bold text-success">
                    {stats.bestProject ? formatMoney(stats.bestProject.revenue ?? 0) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Final Prestige</span>
                  <span className="font-bold text-warning">{stats.prestige}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weeks Active</span>
                  <span className="font-bold">{stats.weeksSurvived}</span>
                </div>
              </div>

              {/* Score formula breakdown */}
              <div className="mt-6 rounded-lg border border-border/30 bg-background/30 p-4">
                <p className="mb-3 text-[9px] font-display font-black uppercase tracking-widest text-muted-foreground">
                  Legacy Score Formula
                </p>
                <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
                  <Badge variant="outline" className="font-tabular-nums border-primary/30 text-primary">
                    {stats.prestige} prestige
                  </Badge>
                  <span className="text-muted-foreground">× 100</span>
                  <span className="text-muted-foreground">+</span>
                  <Badge variant="outline" className="font-tabular-nums border-secondary/30 text-secondary">
                    {stats.weeksSurvived} weeks
                  </Badge>
                  <span className="text-muted-foreground">× 10</span>
                  <span className="text-muted-foreground">=</span>
                  <Badge className="font-tabular-nums bg-primary text-primary-foreground">
                    {stats.legacyScore.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Action Buttons                                                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            variant="outline"
            className="font-display font-black uppercase tracking-widest"
            onClick={() => setShowBreakdown((v) => !v)}
          >
            {showBreakdown ? 'Hide Stats' : 'Review Stats'}
          </Button>

          <Button
            size="lg"
            className="font-display font-black uppercase tracking-widest bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={clearGame}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};

import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { Skull, Trophy, BarChart3, RefreshCw, Star, Terminal, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/98 backdrop-blur-3xl overflow-y-auto py-20">
      <div className="relative w-full max-w-4xl space-y-12 px-12 py-20 text-center">
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
           <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Header                                                             */}
        {/* ---------------------------------------------------------------- */}
        <div className="space-y-6 relative">
          <div className="flex justify-center mb-10">
            <div className="p-8 rounded-none border border-rose-500/20 bg-rose-500/5 shadow-[0_0_50px_rgba(244,63,94,0.2)]">
              <Skull className="h-20 w-20 text-rose-500" strokeWidth={1} />
            </div>
          </div>

          <h1 className="font-display font-black text-8xl uppercase tracking-tighter text-rose-500 italic leading-none drop-shadow-[0_0_40px_rgba(244,63,94,0.6)]">
            SYSTEM_TERMINATED
          </h1>

          <div className="max-w-2xl mx-auto space-y-4">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-rose-500/60 italic">CRITICAL_FISCAL_FAILURE // UPLINK_OFFLINE</p>
            <p className="text-sm font-medium text-muted-foreground/40 italic leading-relaxed uppercase tracking-tight">
              THE CREDITORS HAVE SEIZED ALL ASSETS. PRODUCTION SLATE DISSOLVED. THE HOLLYWOOD DREAM HAS REACHED TERMINAL STATUS.
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Legacy Score                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="rounded-none border border-primary/20 bg-primary/5 p-12 relative overflow-hidden shadow-2xl group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
          <div className="relative z-10">
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-primary italic mb-6">HISTORICAL_LEGACY_SCORE</p>
            <p className="font-display font-black text-9xl text-primary italic drop-shadow-[0_0_50px_rgba(var(--primary),0.5)] transition-all duration-1000 group-hover:scale-105">
              {stats.legacyScore.toLocaleString()}
            </p>
            <div className="mt-8 flex items-center justify-center gap-6">
               <div className="h-px bg-primary/20 w-12" />
               <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] italic">
                 PRESTIGE [{stats.prestige}] × 100 + CYCLES_SURVIVED [{stats.weeksSurvived}] × 10
               </p>
               <div className="h-px bg-primary/20 w-12" />
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Key Stats Grid                                                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              icon: <Star className="h-5 w-5" strokeWidth={3} />,
              label: 'PEAK_CAPITAL',
              value: formatMoney(stats.peakCash).toUpperCase(),
              color: 'text-primary border-primary/20 bg-primary/5',
            },
            {
              icon: <Trophy className="h-5 w-5" strokeWidth={3} />,
              label: 'MAGNUM_OPUS',
              value: (stats.bestProject?.title ?? 'NONE_RECORDED').toUpperCase(),
              color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
            },
            {
              icon: <BarChart3 className="h-5 w-5" strokeWidth={3} />,
              label: 'MAX_PRESTIGE',
              value: `${stats.prestige}`,
              color: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
            },
            {
              icon: <RefreshCw className="h-5 w-5" strokeWidth={3} />,
              label: 'CYCLES_SURVIVED',
              value: `${stats.weeksSurvived}`,
              color: 'text-secondary border-secondary/20 bg-secondary/5',
            },
          ].map((stat) => (
            <div key={stat.label} className={cn("p-8 rounded-none border flex flex-col items-center gap-4 transition-all duration-700 hover:bg-white/[0.02]", stat.color)}>
              <span className="opacity-40">{stat.icon}</span>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] italic opacity-40 text-center">
                {stat.label}
              </p>
              <p className="text-xl font-display font-black italic tracking-tighter truncate w-full text-center">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Stats Breakdown (toggled)                                         */}
        {/* ---------------------------------------------------------------- */}
        {showBreakdown && (
          <div className="rounded-none border border-white/10 bg-black/40 p-12 text-left space-y-10 animate-in slide-in-from-bottom-10 duration-700">
            <div>
              <p className="mb-8 text-[11px] font-black uppercase tracking-[0.5em] text-primary italic border-b border-primary/20 pb-4">
                FULL_METRIC_BREAKDOWN
              </p>
              <div className="space-y-6">
                {[
                  { label: 'FINAL_CASH_POSITION', value: formatMoney(stats.currentCash).toUpperCase(), color: 'text-rose-500' },
                  { label: 'PEAK_CASH_RESERVE', value: formatMoney(stats.peakCash).toUpperCase(), color: 'text-primary' },
                  { label: 'PROPERTIES_RELEASED', value: stats.releasedCount, color: 'text-foreground' },
                  { label: 'TOP_PROJECT_REVENUE', value: stats.bestProject ? formatMoney(stats.bestProject.revenue ?? 0).toUpperCase() : 'N/A', color: 'text-emerald-500' },
                  { label: 'TERMINAL_PRESTIGE', value: stats.prestige, color: 'text-amber-500' },
                  { label: 'TOTAL_CYCLES_ACTIVE', value: stats.weeksSurvived, color: 'text-secondary' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center group">
                    <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] italic group-hover:text-muted-foreground transition-colors">{item.label}</span>
                    <div className="h-px bg-white/5 flex-1 mx-8" />
                    <span className={cn("text-xl font-display font-black italic tracking-tighter", item.color)}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Score formula breakdown */}
            <div className="mt-12 p-8 rounded-none border border-white/5 bg-white/[0.01]">
              <p className="mb-6 text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic flex items-center gap-3">
                <Terminal className="h-3 w-3" />
                LEGACY_CALCULATION_ALGORITHM
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="px-4 py-2 border border-primary/20 bg-primary/5 text-primary text-sm font-black italic tracking-widest">
                  {stats.prestige} PRESTIGE
                </div>
                <span className="text-muted-foreground/20 font-black">× 100</span>
                <span className="text-muted-foreground/20 font-black">+</span>
                <div className="px-4 py-2 border border-secondary/20 bg-secondary/5 text-secondary text-sm font-black italic tracking-widest">
                  {stats.weeksSurvived} WEEKS
                </div>
                <span className="text-muted-foreground/20 font-black">× 10</span>
                <span className="text-muted-foreground/20 font-black">=</span>
                <div className="px-6 py-3 bg-primary text-black text-lg font-black italic tracking-[0.2em]">
                  {stats.legacyScore.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Action Buttons                                                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex justify-center gap-8 pt-10">
          <button
            onClick={() => setShowBreakdown((v) => !v)}
            className="h-16 px-12 bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-700 font-black uppercase tracking-[0.5em] italic text-xs rounded-none group flex items-center gap-4"
          >
            {showBreakdown ? 'CLOSE_METRICS' : 'REVIEW_METRICS'}
            <ArrowRight className={cn("h-4 w-4 transition-transform duration-700", showBreakdown ? "rotate-90" : "")} />
          </button>

          <button
            onClick={clearGame}
            className="h-16 px-16 bg-rose-600 text-black font-display font-black uppercase tracking-[0.6em] italic text-xs hover:bg-rose-500 hover:shadow-[0_0_80px_rgba(244,63,94,0.5)] hover:scale-[1.05] active:scale-95 transition-all duration-700 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            INITIATE_NEW_TIMELINE
          </button>
        </div>
      </div>
    </div>
  );
};

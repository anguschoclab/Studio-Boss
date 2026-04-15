import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney, getWeekDisplay } from '@/engine/utils';
import { 
  GlobeIcon as Globe, 
  TrendingUpIcon as TrendingUp, 
  AlertTriangleIcon as AlertTriangle, 
  SaveIcon as Save, 
  FastForwardIcon as FastForward 
} from '@/components/shared/Icons';
import { selectActiveProjects, selectMarketMetrics } from '@/store/selectors';
import { Badge } from '@/components/ui/badge';
import { NewsTicker } from './NewsTicker';
import { Button } from '@/components/ui/button';

export const TopBar = () => {
  const { gameState, doAdvanceWeek, saveToSlot } = useGameStore();
  
  if (!gameState) return null;

  const { studio, week } = gameState;
  const activeProjectsCount = selectActiveProjects(gameState).length;
  const { cycle, debtRate } = selectMarketMetrics(gameState);

  const handleAdvance = async () => {
    await doAdvanceWeek();
  };

  const handleSave = async () => {
    await saveToSlot(0);
  };

  return (
    // Switched from fixed h-16 to min-h-[4rem] with flex-wrap to prevent horizontal overflow and improve mobile responsiveness.
    <div className="min-h-[4rem] border-b border-border bg-card/50 backdrop-blur-md flex flex-wrap items-center justify-between px-6 py-2 z-50 sticky top-0">
      <div className="flex items-center gap-8">
        {/* Studio Branding & Week */}
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground leading-none mb-1">Production Week</span>
          <div className="flex items-center gap-3">
            <span className="font-display font-black text-2xl italic tracking-tighter bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
              W{getWeekDisplay(week).displayWeek} {getWeekDisplay(week).year}
            </span>
            <Badge variant="outline" className="font-mono text-[10px] border-primary/20 text-primary bg-primary/5 px-2 py-0">
              Q{Math.ceil(((week - 1) % 52 + 1) / 13)}
            </Badge>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-border/50" />

        {/* Financials & Market */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">Cash Reserves</span>
            <span className={cn(
               "font-mono font-bold text-lg",
               (gameState.finance?.cash ?? 0) < 0 ? "text-destructive" : "text-emerald-400"
            )}>
              {formatMoney(gameState.finance?.cash ?? 0)}
            </span>

          </div>

          <div className="flex flex-col items-end cursor-default group">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Market: {cycle}</span>
              <Globe className="h-2.5 w-2.5 text-blue-400 group-hover:animate-spin-slow" />
            </div>
            <span className="font-mono font-bold text-sm text-blue-300">
              {(debtRate * 100).toFixed(1)}% <span className="text-[10px] font-normal text-muted-foreground">APR</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-xl px-12">
        <NewsTicker />
      </div>

      <div className="flex items-center gap-4">
        {/* Pipeline Status */}
        <div className="flex items-center gap-6 mr-4">
          <div className="flex flex-col items-end group cursor-default">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Projects</span>
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            </div>
            <span className="font-mono font-bold text-sm">
              {activeProjectsCount} <span className="text-[10px] font-normal text-muted-foreground">Active</span>
            </span>
          </div>

          <div className="flex flex-col items-end group cursor-default">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Prestige</span>
              <TrendingUp className="h-2.5 w-2.5 text-secondary" />
            </div>
            <span className="font-mono font-bold text-sm text-secondary">
              {studio.prestige}
            </span>
          </div>
        </div>

        {/* Market Event Alert */}
        {gameState.market.activeMarketEvents && gameState.market.activeMarketEvents.length > 0 && (
          <div className="relative group">
            <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse cursor-help" />
            <div className="absolute top-full right-0 mt-2 p-3 bg-card border border-amber-500/20 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 w-64 text-xs">
              <p className="font-bold text-amber-500 mb-1">Active Market Events</p>
              <ul className="list-disc list-inside text-muted-foreground">
                {gameState.market.activeMarketEvents.map((ev, i) => (
                  <li key={i}>{ev.name}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSave} 
          aria-label="Save Game"
          className="h-11 w-11 p-3 m-2 rounded-full hover:bg-white/10 transition-colors duration-200 text-muted-foreground hover:text-primary transition-colors"
        >
          <Save className="w-4 h-4" />
        </Button>

        <Button 
          onClick={handleAdvance} 
          disabled={gameState.tickCount > 0}
          className="h-9 px-4 font-display font-black uppercase tracking-widest text-[10px] gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary),0.1)] hover:shadow-[0_0_25px_rgba(var(--primary),0.3)] hover:scale-105 active:scale-95 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          <FastForward className="w-4 h-4 ml-1" />
          Advance Week
        </Button>
      </div>
    </div>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

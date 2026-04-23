import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { formatMoney, getWeekDisplay } from '@/engine/utils';
import { Save, FastForward, AlertTriangle, TrendingUp } from 'lucide-react';
import { selectActiveProjects } from '@/store/selectors';
import { Badge } from '@/components/ui/badge';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { NewsTicker } from './NewsTicker';

export const TopBar = () => {
  const gameState = useGameStore(s => s.gameState);
  const doAdvanceWeek = useGameStore(s => s.doAdvanceWeek);
  const saveToSlot = useGameStore(s => s.saveToSlot);

  const { showSummary } = useUIStore();
  const activeProjectsList = useGameStore(s => selectActiveProjects(s.gameState));

  if (!gameState) return null;

  const cash = gameState.finance.cash;
  const history = gameState.finance.history || [];
  const lastWeekCash = history.length > 0 ? history[history.length - 1].cash : cash;
  const cashDelta = cash - lastWeekCash;

  const { week, studio } = gameState;
  const { displayWeek, year } = getWeekDisplay(week);

  const handleAdvanceWeek = () => {
    const summary = doAdvanceWeek();
    showSummary(summary);
  };

  const handleSave = () => {
    saveToSlot(1);
  };

  return (
    <header className="h-16 glass-header flex items-center px-6 gap-8 shrink-0 relative transition-all duration-300">
      {/* Date & Fiscal Period */}
      <TooltipWrapper tooltip={`Current Year: ${year}, Week: ${displayWeek}. Business quarters cycle every 13 weeks.`}>
        <div className="flex items-center gap-4 cursor-default">
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-[0.2em] leading-none mb-1.5">Fiscal Period</span>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-[15px] tracking-tighter uppercase">W{displayWeek}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="font-display font-black text-[15px] tracking-tighter uppercase text-muted-foreground/60">Y{year}</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/5" />
          <div className="flex flex-col">
             <span className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest leading-none mb-1">Quarter</span>
             <span className="font-display font-black text-xs text-primary/80">Q{(Math.floor((displayWeek-1)/13) + 1)}</span>
          </div>
        </div>
      </TooltipWrapper>

      {/* Global News Ticker */}
      <div className="flex-1 max-w-2xl">
        <NewsTicker />
      </div>

      {/* Primary Metrics Cluster */}
      <div className="flex items-center gap-8 ml-auto">
        {/* Cash Status */}
        <TooltipWrapper tooltip="Total liquid capital available for acquisitions and project funding.">
          <div className="flex flex-col items-end cursor-default">
            <span className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest leading-none mb-1">Liquid Capital</span>
            <div className="flex items-center gap-2">
               {cashDelta !== 0 && (
                 <span className={cn("text-[10px] font-display font-black", cashDelta > 0 ? "text-success" : "text-destructive")}>
                   {cashDelta > 0 ? '+' : ''}{formatMoney(cashDelta).replace('$', '')}
                 </span>
               )}
               <span className={cn("font-display font-black text-lg tracking-tighter", cash < 0 ? 'text-destructive' : 'text-primary')}>
                {formatMoney(cash)}
              </span>
            </div>
          </div>
        </TooltipWrapper>

        {/* Reputation/Prestige */}
        <TooltipWrapper tooltip="Studio reputation level. High prestige unlocks elite talent and better distribution terms.">
          <div className="flex flex-col items-end cursor-default">
            <span className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest leading-none mb-1">Prestige</span>
            <span className="font-display font-black text-lg text-secondary tracking-tighter">
              ★ {studio.prestige}
            </span>
          </div>
        </TooltipWrapper>

        {/* Project Pipeline Count */}
        <TooltipWrapper tooltip="Total number of properties currently in active development or production phases.">
          <div className="flex flex-col items-end cursor-default">
            <span className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest leading-none mb-1">Slate</span>
            <span className="font-display font-black text-lg text-foreground tracking-tighter">
              {activeProjectsList.length}
            </span>
          </div>
        </TooltipWrapper>
      </div>

      {/* Functional Actions */}
      <div className="flex items-center gap-4 ml-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSave} 
          className="h-9 w-9 rounded-xl hover:bg-white/5 text-muted-foreground/40 hover:text-primary transition-all active:scale-90"
        >
          <Save className="h-4.5 w-4.5" />
        </Button>

        <Button 
          onClick={handleAdvanceWeek} 
          className="h-10 px-6 font-display font-black uppercase tracking-[0.15em] text-[10px] gap-3 transition-all duration-500 shadow-xl shadow-primary/5 hover:shadow-primary/15 hover:scale-[1.02] active:scale-95 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <FastForward className="h-4 w-4" />
          Advance Week
        </Button>
      </div>
    </header>
  );
};

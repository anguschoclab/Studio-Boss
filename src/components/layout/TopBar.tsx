import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { formatMoney, getWeekDisplay } from '@/engine/utils';
import { Save, FastForward, AlertTriangle, TrendingUp, Newspaper } from 'lucide-react';
import { selectActiveProjectsCount } from '@/store/selectors';
import { Badge } from '@/components/ui/badge';
import { NewsTicker } from './NewsTicker';

export const TopBar = () => {
  const gameState = useGameStore(s => s.gameState);
  const doAdvanceWeek = useGameStore(s => s.doAdvanceWeek);
  const saveToSlot = useGameStore(s => s.saveToSlot);

  const { showSummary, setActiveTab } = useUIStore();

  const activeProjects = useGameStore(s => selectActiveProjectsCount(s.gameState));

  if (!gameState) return null;

  const { cash, week, studio } = gameState;
  const { displayWeek, year } = getWeekDisplay(week);

  const handleAdvanceWeek = () => {
    const summary = doAdvanceWeek();
    showSummary(summary);
  };

  const handleSave = () => {
    saveToSlot(1);
  };

  return (
    <header className="h-14 glass-header flex items-center px-6 gap-8 shrink-0 relative transition-all duration-300">
      {/* Date & Urgency Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Fiscal Period</span>
          <span className="font-mono font-bold text-sm tracking-tight">Week {displayWeek} · Year {year}</span>
        </div>
        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-mono px-2 py-0 text-[10px]">Q{(Math.floor((displayWeek-1)/13) + 1)}</Badge>
      </div>

      {/* Global News Ticker */}
      <NewsTicker 
        news={gameState.industry.newsHistory || []} 
        onClick={() => setActiveTab('trades')} 
      />

      {/* Primary Metrics Cluster */}
      <div className="flex items-center gap-6 ml-auto">
        {/* Cash Status */}
        <div className="flex flex-col items-end">
          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Liquid Capital</span>
          <span className={`font-mono font-bold text-sm ${cash < 0 ? 'text-destructive' : 'text-primary'} text-glow`}>
            {formatMoney(cash)}
          </span>
        </div>

        <div className="w-px h-6 bg-white/10" />

        {/* Reputation/Prestige */}
        <div className="flex flex-col items-end group cursor-help" title="Studio Prestige Level">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Prestige</span>
            <TrendingUp className="h-2.5 w-2.5 text-secondary" />
          </div>
          <span className="font-mono font-bold text-sm text-secondary">
            {studio.prestige}
          </span>
        </div>

        <div className="w-px h-6 bg-white/10" />

        {/* Project Pipeline Count */}
        <div className="flex flex-col items-end">
          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Active Slate</span>
          <span className="font-mono font-bold text-sm text-foreground/80">
            {activeProjects}
          </span>
        </div>
      </div>

      {/* Functional Actions */}
      <div className="flex items-center gap-3 ml-4">
        {/* Market Event Alert */}
        {gameState.market.activeMarketEvents && gameState.market.activeMarketEvents.length > 0 && (
          <div className="relative group">
            <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse cursor-help" />
            <div className="absolute top-full right-0 mt-2 p-3 bg-card border border-amber-500/20 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 w-64 text-xs">
              <p className="font-bold text-amber-500 mb-1">Active Market Events</p>
              <ul className="list-disc list-inside text-muted-foreground">
                {gameState.market.activeMarketEvents.map(e => (
                  <li key={e.id}>{e.name}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSave} 
          className="h-8 w-8 rounded-full hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors"
          title="Manual Cloud Save"
        >
          <Save className="h-4 w-4" />
        </Button>

        <Button 
          onClick={handleAdvanceWeek} 
          className="h-9 px-4 font-display font-black uppercase tracking-widest text-[10px] gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary),0.1)] hover:shadow-[0_0_25px_rgba(var(--primary),0.3)] hover:scale-105 active:scale-95 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          <FastForward className="h-3.5 w-3.5" />
          Advance Week
        </Button>
      </div>
    </header>
  );
};

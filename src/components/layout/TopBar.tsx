import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { formatMoney, getWeekDisplay } from '@/engine/utils';
import { Save, FastForward, AlertTriangle } from 'lucide-react';
import { selectActiveProjectsCount } from '@/store/selectors';

export const TopBar = () => {
  const navigate = useNavigate();
  const gameState = useGameStore(s => s.gameState);
  const doAdvanceWeek = useGameStore(s => s.doAdvanceWeek);
  const saveToSlot = useGameStore(s => s.saveToSlot);
  const clearGame = useGameStore(s => s.clearGame);

  const { showSummary } = useUIStore();

  const activeProjects = useGameStore(s => selectActiveProjectsCount(s.gameState));

  if (!gameState) return null;

  const { studio, cash, week } = gameState;
  const { displayWeek, year } = getWeekDisplay(week);

  const handleAdvanceWeek = () => {
    const summary = doAdvanceWeek();
    showSummary(summary);
  };

  const handleSave = () => {
    saveToSlot(1);
  };

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit to the main menu? Unsaved progress will be lost.')) {
      clearGame();
      navigate({ to: '/' });
    }
  };

  return (
    <div className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60 flex items-center px-6 gap-6 shrink-0 z-50 sticky top-0 shadow-sm transition-all duration-300 relative">
      <div className="absolute inset-x-0 -bottom-[1px] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      {/* Brand + Studio */}
      <div className="flex items-center gap-4 min-w-0">
        <button onClick={handleExit} title="Exit to Main Menu" aria-label="Exit to Main Menu" className="font-display text-base font-black text-primary tracking-widest hover:text-primary/80 hover:scale-105 transition-all duration-300 drop-shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded">
          SB
        </button>
        <div className="w-px h-8 bg-border/50 rotate-12" />
        <span className="font-display text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50 truncate drop-shadow-sm tracking-tight">{studio.name}</span>
      </div>

      <div className="flex-1" />

      {/* Metrics */}
      <div className="flex items-center gap-8 text-sm bg-muted/20 backdrop-blur-md border border-border/40 px-6 py-2 rounded-full shadow-inner ring-1 ring-inset ring-border/20">
        <div className="flex flex-col items-center justify-center">
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Cash</p>
          <p className={`font-mono font-bold text-[13px] drop-shadow-sm ${cash < 0 ? 'text-destructive drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]' : 'text-primary drop-shadow-[0_0_4px_rgba(234,179,8,0.4)]'}`}>
            {formatMoney(cash)}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Prestige</p>
          <p className="font-mono font-bold text-[13px] text-secondary drop-shadow-[0_0_4px_rgba(255,161,22,0.4)]">{studio.prestige}</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Projects</p>
          <p className="font-mono font-bold text-[13px] text-foreground/90">{activeProjects}</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Date</p>
          <p className="font-mono font-bold text-[13px] text-foreground/90 tracking-tight">W{displayWeek} · Y{year}</p>
        </div>
      </div>

      <div className="flex-1 flex justify-end">
        <div className="flex items-center gap-4">
          {/* Global Market Events Indicator */}
          {gameState.market.activeMarketEvents && gameState.market.activeMarketEvents.length > 0 && (
            <div className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
              <span className="text-[11px] uppercase tracking-widest">{gameState.market.activeMarketEvents.length} Active Event{gameState.market.activeMarketEvents.length > 1 ? 's' : ''}</span>
            </div>
          )}

          <div className="w-px h-8 bg-border/50 rotate-12 mx-1" />

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={handleSave} aria-label="Save Game" title="Save Game" className="h-9 w-9 rounded-full border-border/40 bg-background/50 backdrop-blur-sm hover:bg-card hover:text-primary transition-all duration-300 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] focus-visible:ring-offset-background group">
              <Save className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
            </Button>
            <Button size="default" onClick={handleAdvanceWeek} className="h-9 px-5 font-display font-black uppercase tracking-widest text-[11px] gap-2 transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-offset-background group overflow-hidden relative bg-primary text-primary-foreground">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <FastForward className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
              Advance Week
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { formatMoney, getWeekDisplay } from '@/engine/utils';
import { Save, FastForward } from 'lucide-react';

export const TopBar = () => {
  const navigate = useNavigate();
  const { gameState, doAdvanceWeek, saveToSlot, clearGame } = useGameStore();
  const { showSummary } = useUIStore();

  if (!gameState) return null;

  const { studio, cash, week, projects } = gameState;
  const { displayWeek, year } = getWeekDisplay(week);

  const activeProjects = projects.filter(p => p.status === 'development' || p.status === 'production').length;

  const handleAdvanceWeek = () => {
    const summary = doAdvanceWeek();
    showSummary(summary);
  };

  const handleSave = () => {
    saveToSlot(1);
  };

  const handleExit = () => {
    clearGame();
    navigate({ to: '/' });
  };

  return (
    <div className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
      {/* Brand + Studio */}
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={handleExit} title="Exit to Main Menu" aria-label="Exit to Main Menu" className="font-display text-sm font-bold text-primary tracking-wider hover:opacity-80 transition-opacity">
          SB
        </button>
        <div className="w-px h-6 bg-border" />
        <span className="font-display font-semibold text-foreground truncate">{studio.name}</span>
      </div>

      <div className="flex-1" />

      {/* Metrics */}
      <div className="flex items-center gap-5 text-sm">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cash</p>
          <p className={`font-semibold ${cash < 0 ? 'text-destructive' : 'text-primary'}`}>
            {formatMoney(cash)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Prestige</p>
          <p className="font-semibold text-secondary">{studio.prestige}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Projects</p>
          <p className="font-semibold text-foreground">{activeProjects}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Week</p>
          <p className="font-semibold text-foreground">W{displayWeek} · {year}</p>
        </div>
      </div>

      <div className="w-px h-6 bg-border" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleSave} aria-label="Save Game" title="Save Game">
          <Save className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={handleAdvanceWeek} className="font-display font-semibold gap-1.5">
          <FastForward className="h-3.5 w-3.5" />
          Advance Week
        </Button>
      </div>
    </div>
  );
};

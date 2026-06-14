import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { formatMoney, getWeekDisplay } from "@/engine/utils";
import { Save, FastForward, Activity } from "lucide-react";
import { selectActiveProjects } from "@/store/selectors";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { NewsTicker } from "./NewsTicker";
import { cn } from "@/lib/utils";

export const TopBar = () => {
  const gameState = useGameStore((s) => s.gameState);
  const doAdvanceWeek = useGameStore((s) => s.doAdvanceWeek);
  const saveToSlot = useGameStore((s) => s.saveToSlot);

  const { showSummary } = useUIStore();
  const activeProjectsList = useGameStore((s) => selectActiveProjects(s.gameState));

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
    <header className="h-20 bg-black/95 backdrop-blur-3xl border-b border-white/5 flex items-center px-8 gap-10 shrink-0 relative transition-all duration-700 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
      {/* Date & Fiscal Period */}
      <TooltipWrapper
        tooltip={`Current Year: ${year}, Week: ${displayWeek}. Business quarters cycle every 13 weeks.`}
      >
        <div className="flex items-center gap-6 cursor-default group">
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground/30 font-black uppercase tracking-[0.4em] leading-none mb-2 italic group-hover:text-primary transition-colors">
              FISCAL_PERIOD
            </span>
            <div className="flex items-center gap-3">
              <span className="font-display font-black text-xl tracking-tighter uppercase italic text-foreground">
                W{displayWeek}
              </span>
              <div className="w-1.5 h-1.5 bg-white/10 rotate-45" />
              <span className="font-display font-black text-xl tracking-tighter uppercase italic text-muted-foreground/40">
                Y{year}
              </span>
            </div>
          </div>
          <div className="h-10 w-px bg-white/5" />
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground/20 font-black uppercase tracking-[0.4em] leading-none mb-2 italic">
              QUARTER
            </span>
            <span className="font-display font-black text-sm text-primary/60 italic">
              Q{Math.floor((displayWeek - 1) / 13) + 1}
            </span>
          </div>
        </div>
      </TooltipWrapper>

      {/* Global News Ticker */}
      <div className="flex-1 max-w-2xl">
        <NewsTicker />
      </div>

      {/* Primary Metrics Cluster */}
      <div className="flex items-center gap-10 ml-auto">
        {/* Cash Status */}
        <TooltipWrapper tooltip="Total liquid capital available for acquisitions and project funding.">
          <div className="flex flex-col items-end cursor-default group">
            <span className="text-[9px] text-muted-foreground/30 font-black uppercase tracking-[0.4em] leading-none mb-2 italic group-hover:text-primary transition-colors">
              LIQUID_CAPITAL
            </span>
            <div className="flex items-center gap-3">
              {cashDelta !== 0 && (
                <span
                  className={cn(
                    "text-[10px] font-display font-black italic",
                    cashDelta > 0 ? "text-emerald-500" : "text-rose-500"
                  )}
                >
                  {cashDelta > 0 ? "+" : ""}
                  {formatMoney(cashDelta).replace("$", "").toUpperCase()}
                </span>
              )}
              <span
                className={cn(
                  "font-display font-black text-2xl tracking-tighter italic",
                  cash < 0
                    ? "text-rose-500"
                    : "text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                )}
              >
                {formatMoney(cash).toUpperCase()}
              </span>
            </div>
          </div>
        </TooltipWrapper>

        {/* Reputation/Prestige */}
        <TooltipWrapper tooltip="Studio reputation level. High prestige unlocks elite talent and better distribution terms.">
          <div className="flex flex-col items-end cursor-default group">
            <span className="text-[9px] text-muted-foreground/30 font-black uppercase tracking-[0.4em] leading-none mb-2 italic group-hover:text-secondary transition-colors">
              PRESTIGE
            </span>
            <div className="flex items-center gap-3">
              <Star
                className="h-4 w-4 text-secondary/40 group-hover:text-secondary transition-colors"
                fill="currentColor"
              />
              <span className="font-display font-black text-2xl text-secondary tracking-tighter italic">
                {studio.prestige}
              </span>
            </div>
          </div>
        </TooltipWrapper>

        {/* Project Pipeline Count */}
        <TooltipWrapper tooltip="Total number of properties currently in active development or production phases.">
          <div className="flex flex-col items-end cursor-default group">
            <span className="text-[9px] text-muted-foreground/30 font-black uppercase tracking-[0.4em] leading-none mb-2 italic group-hover:text-foreground transition-colors">
              ACTIVE_SLATE
            </span>
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-muted-foreground/20 group-hover:text-foreground transition-colors" />
              <span className="font-display font-black text-2xl text-foreground tracking-tighter italic">
                {activeProjectsList.length}
              </span>
            </div>
          </div>
        </TooltipWrapper>
      </div>

      {/* Functional Actions */}
      <div className="flex items-center gap-4 ml-6">
        <button
          type="button"
          onClick={handleSave}
          title="SAVE_SYSTEM_STATE"
          aria-label="Save system state"
          className="h-12 w-12 rounded-none bg-white/[0.02] border border-white/5 flex items-center justify-center text-muted-foreground/40 hover:text-primary hover:bg-primary/10 hover:border-primary/40 transition-all duration-700 active:scale-90 shadow-2xl focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary focus-visible:outline-none focus-visible:transition-none"
        >
          <Save className="h-5 w-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={handleAdvanceWeek}
          className="h-12 px-10 rounded-none bg-primary text-black font-display font-black uppercase tracking-[0.3em] text-[10px] italic flex items-center gap-4 transition-all duration-700 shadow-[0_0_50px_rgba(var(--primary),0.2)] hover:shadow-[0_0_80px_rgba(var(--primary),0.4)] hover:scale-[1.02] active:scale-95 group overflow-hidden relative focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary focus-visible:outline-none focus-visible:transition-none"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <FastForward className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
          ADVANCE_CYCLE
        </button>
      </div>
    </header>
  );
};

import React from "react";
import { useUIStore, TabId } from "@/store/uiStore";
import { useGameStore } from "@/store/gameStore";
import { formatMoney } from "@/engine/utils";
import {
  Building2,
  Clapperboard,
  Newspaper,
  Users,
  Tv2,
  Archive,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Star,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "@tanstack/react-router";

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
  tooltip: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "command",
    label: "COMMAND_CENTER",
    icon: Building2,
    tooltip: "STUDIO_OVERVIEW_ALERTS_TOPLINE_METRICS",
  },
  {
    id: "pipeline",
    label: "PRODUCTION_PIPELINE",
    icon: Clapperboard,
    tooltip: "ACTIVE_PROJECTS_FROM_DEVELOPMENT_THRU_RELEASE",
  },
  {
    id: "trades",
    label: "THE_TRADES",
    icon: Newspaper,
    tooltip: "IP_OPPORTUNITIES_INDUSTRY_NEWS_MARKET_TRENDS",
  },
  {
    id: "talent",
    label: "TALENT_HUB",
    icon: Users,
    tooltip: "TALENT_ROSTER_INDUSTRY_DATABASE_SBDB",
  },
  {
    id: "distribution",
    label: "DISTRIBUTION_HUB",
    icon: Tv2,
    tooltip: "DEALS_DESK_STREAMING_NIELSEN_RATINGS",
  },
  { id: "ip", label: "IP_VAULT", icon: Archive, tooltip: "OWNED_IP_FRANCHISES_LIBRARY_RIGHTS" },
  {
    id: "industry",
    label: "INDUSTRY_INTELLIGENCE",
    icon: TrendingUp,
    tooltip: "RIVAL_STUDIOS_M&A_MARKET_INTELLIGENCE",
  },
  {
    id: "finance",
    label: "FINANCE_COMMAND",
    icon: DollarSign,
    tooltip: "PL_STATEMENTS_REVENUE_STREAMS_CASH_FLOW",
  },
];

export const StudioSidebar = () => {
  const { activeTab, setActiveTab } = useUIStore();
  const gameState = useGameStore((s) => s.gameState);
  const clearGame = useGameStore((s) => s.clearGame);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const navigate = useNavigate();

  if (!gameState) return null;

  const handleExit = () => {
    if (window.confirm("TERMINATE_SESSION_AND_EXIT_TO_MENU?")) {
      clearGame();
      navigate({ to: "/" });
    }
  };

  return (
    <aside
      className={cn(
        "glass-panel h-screen flex flex-col transition-all duration-700 ease-in-out z-40 sticky top-0 border-r border-white/5 bg-black/90 backdrop-blur-3xl shadow-[50px_0_100px_rgba(0,0,0,0.8)]",
        isCollapsed ? "w-[80px]" : "w-72"
      )}
    >
      {/* Brand Header */}
      <div className="p-8 flex items-center justify-between overflow-hidden">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center font-display font-black text-black text-2xl italic shadow-[0_0_30px_rgba(var(--primary),0.4)]">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black tracking-[0.2em] text-xl uppercase italic leading-none">
                BOSS
              </span>
              <span className="text-[8px] font-black tracking-[0.4em] text-primary mt-1 italic">
                V1.0_PRO_EDITION
              </span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-full flex justify-center">
            <div className="w-12 h-12 rounded-none bg-primary flex items-center justify-center font-display font-black text-black text-2xl italic shadow-[0_0_30px_rgba(var(--primary),0.4)] mx-auto">
              S
            </div>
          </div>
        )}
      </div>

      <div className="px-8 mb-8">
        <div className="h-0.5 bg-white/5 w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/20 animate-shimmer" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Tooltip key={item.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-4 transition-all duration-500 relative group overflow-hidden",
                    isCollapsed ? "justify-center h-14" : "h-12 px-6",
                    isActive
                      ? "bg-primary/10 text-primary border-l-4 border-primary shadow-2xl"
                      : "text-muted-foreground/40 hover:bg-white/[0.02] hover:text-foreground hover:translate-x-1"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-all duration-700",
                      isActive
                        ? "drop-shadow-[0_0_12px_rgba(var(--primary),0.6)]"
                        : "group-hover:text-primary"
                    )}
                    strokeWidth={isActive ? 3 : 2}
                  />
                  {!isCollapsed && (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] truncate italic">
                      {item.label}
                    </span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="absolute right-4">
                      <Zap className="h-3 w-3 fill-current animate-pulse" />
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="rounded-none font-black text-[10px] uppercase tracking-[0.3em] bg-black border border-white/20 text-primary italic px-4 py-2 shadow-2xl z-[100]"
              >
                {isCollapsed ? item.label : item.tooltip}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Quick Stats */}
      {!isCollapsed && (
        <div className="px-8 py-8 border-t border-white/5 space-y-6 bg-white/[0.01]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 italic">
              <span className="flex items-center gap-2">
                <DollarSign className="h-3 w-3" /> CASH_RESERVES
              </span>
              <span
                className={cn(
                  (gameState.finance?.cash ?? 0) < 0 ? "text-rose-500" : "text-primary"
                )}
              >
                {(gameState.finance?.cash ?? 0) < 0 ? "DEFICIT" : "STABLE"}
              </span>
            </div>
            <div
              className={cn(
                "text-2xl font-display font-black tracking-tighter italic leading-none",
                (gameState.finance?.cash ?? 0) < 0 ? "text-rose-500" : "text-foreground"
              )}
            >
              {formatMoney(gameState.finance?.cash ?? 0).toUpperCase()}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic flex items-center gap-2">
                <Star className="h-2.5 w-2.5" /> PRESTIGE
              </span>
              <span className="text-lg font-display font-black text-secondary italic leading-none">
                {gameState.studio.prestige}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic flex items-center justify-end gap-2">
                SLATE <Clapperboard className="h-2.5 w-2.5" />
              </span>
              <span className="text-lg font-display font-black text-foreground italic leading-none">
                {
                  Object.values(gameState.studio.internal.projects).filter(
                    (p) =>
                      p.state !== "released" && p.state !== "post_release" && p.state !== "archived"
                  ).length
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-4 bg-black space-y-2 border-t border-white/5">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              className="w-full flex items-center gap-4 h-12 px-6 text-muted-foreground/30 hover:bg-white/5 hover:text-foreground transition-all duration-500 group overflow-hidden"
              onClick={() => {}}
            >
              <Settings className="h-5 w-5 shrink-0 group-hover:rotate-90 transition-transform duration-700" />
              {!isCollapsed && (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">
                  CONFIGURATION
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="rounded-none font-black text-[10px] uppercase tracking-[0.3em] bg-black border border-white/20 text-foreground italic px-4 py-2 shadow-2xl z-[100]"
          >
            STUDIO_CONFIGURATION_&_PREFERENCES
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={handleExit}
              className="w-full flex items-center gap-4 h-12 px-6 text-rose-900 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-500 group overflow-hidden"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">
                  TERMINATE_SESSION
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="rounded-none font-black text-[10px] uppercase tracking-[0.3em] bg-rose-500 text-black italic px-4 py-2 shadow-2xl z-[100]"
          >
            RETURN_TO_MAIN_COMMAND
          </TooltipContent>
        </Tooltip>

        <button
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex justify-center h-10 items-center hover:bg-white/5 text-muted-foreground/20 hover:text-primary transition-all duration-500"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" strokeWidth={3} />
          ) : (
            <ChevronLeft className="h-5 w-5" strokeWidth={3} />
          )}
        </button>
      </div>
    </aside>
  );
};

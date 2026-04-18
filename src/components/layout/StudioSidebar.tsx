import React from 'react';
import { useUIStore, HubId } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { 
  LayoutDashboardIcon as LayoutDashboard, 
  FilmIcon as Film, 
  UsersIcon as Users, 
  GlobeIcon as Globe,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
  LogOutIcon as LogOut,
  SettingsIcon as Settings,
  DollarSignIcon as DollarSign,
  StarIcon as Star,
  ClapperboardIcon as Clapperboard
} from '@/components/shared/Icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';

const SidebarCashChart = React.lazy(() => import('./SidebarCashChart'));

interface NavItem {
  id: HubId;
  label: string;
  icon: React.ElementType;
  tooltip: string;
  badge?: (state: GameState) => number | null;
  badgeType?: 'urgent' | 'info' | 'neutral';
}

import { GameState } from '@/engine/types';

// Badge calculation functions for each hub
const getOpsAlertsCount = (state: GameState) => {
  const projects = Object.values(state.entities.projects);
  return projects.filter(p => {
    const isOverBudget = (p.accumulatedCost || 0) > (p.budget || 0) * 1.2;
    const isTroubled = p.state === 'turnaround' || p.state === 'needs_greenlight';
    const hasCrisis = p.activeCrisis && !p.activeCrisis.resolved;
    return (isOverBudget || isTroubled || hasCrisis) && 
           p.state !== 'released' && p.state !== 'archived';
  }).length;
};

const getProductionAlerts = (state: GameState) => {
  const projects = Object.values(state.entities.projects);
  const needsGreenlight = projects.filter(p => p.state === 'needs_greenlight').length;
  return needsGreenlight > 0 ? needsGreenlight : null;
};

const getMarketplaceAlerts = (state: GameState) => {
  return Object.values(state.market?.opportunities || {}).length;
};

const getIntelligenceAlerts = (state: GameState) => {
  const marketEvents = state.market?.activeMarketEvents?.length || 0;
  const rivals = Object.keys(state.entities?.rivals || {}).length;
  return marketEvents > 0 ? marketEvents : rivals > 0 ? null : null;
};

// New 4-Hub Navigation
const NAV_ITEMS: NavItem[] = [
  { 
    id: 'hq', 
    label: 'Studio HQ', 
    icon: LayoutDashboard, 
    tooltip: 'Studio overview, operations, strategy, and news',
    badge: getOpsAlertsCount,
    badgeType: 'urgent'
  },
  { 
    id: 'production', 
    label: 'Production', 
    icon: Film, 
    tooltip: 'Complete project lifecycle: slate, development, distribution, catalog',
    badge: getProductionAlerts,
    badgeType: 'info'
  },
  { 
    id: 'talent', 
    label: 'Talent & Deals', 
    icon: Users, 
    tooltip: 'Roster, marketplace, negotiations, and agency network',
    badge: getMarketplaceAlerts,
    badgeType: 'neutral'
  },
  { 
    id: 'intelligence', 
    label: 'Intelligence', 
    icon: Globe, 
    tooltip: 'Rivals, awards, market trends, and financial analysis',
    badge: getIntelligenceAlerts,
    badgeType: 'neutral'
  },
];

export const StudioSidebar = () => {
  const { activeHub, setActiveHub } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const clearGame = useGameStore(s => s.clearGame);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const navigate = useNavigate();

  const cashHistory = React.useMemo(() => {
    if (!gameState?.finance?.weeklyHistory) return [];
    return gameState.finance.weeklyHistory.slice(-12).map(h => ({ cash: h.cash }));
  }, [gameState?.finance?.weeklyHistory]);

  if (!gameState) return null;


  const handleExit = () => {
    if (window.confirm('Exit to main menu?')) {
      clearGame();
      navigate({ to: '/' });
    }
  };

  return (
    <aside 
      className={cn(
        "glass-panel h-screen flex flex-col transition-all duration-300 ease-in-out z-40 sticky top-0",
        isCollapsed ? "w-[72px]" : "w-60"
      )}
    >
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between overflow-hidden">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-primary-foreground text-xl shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
              S
            </div>
            <span className="font-display font-black tracking-tighter text-xl">BOSS</span>
          </div>
        )}
        {isCollapsed && (
           <div className="w-full flex justify-center">
             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-primary-foreground text-xl shadow-[0_0_15px_hsl(var(--primary)/0.3)] mx-auto">
              S
            </div>
           </div>
        )}
      </div>

      <Separator className="bg-border/30 mx-5 w-auto mb-4" />

      {/* Navigation */}
      <div className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = activeHub === item.id;
          const badgeCount = item.badge ? item.badge(gameState) : null;
          const hasBadge = badgeCount && badgeCount > 0;
          
          // Determine badge styling based on type and state
          const getBadgeStyles = () => {
            if (!hasBadge) return '';
            if (isActive) return "bg-primary text-primary-foreground";
            switch (item.badgeType) {
              case 'urgent': return "bg-red-500 text-white animate-pulse";
              case 'info': return "bg-amber-500/80 text-white";
              default: return "bg-muted text-muted-foreground";
            }
          };
          
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={isCollapsed ? "icon" : "default"}
                  onClick={() => setActiveHub(item.id)}
                  className={cn(
                    "w-full justify-start gap-3 transition-all duration-200 relative group rounded-lg",
                    isCollapsed ? "justify-center h-12" : "h-11 px-4",
                    isActive 
                      ? "bg-primary/15 text-primary hover:bg-primary/25 hover:text-primary shadow-[0_0_15px_hsl(var(--primary)/0.15)]" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    hasBadge && !isActive && item.badgeType === 'urgent' && "border-l-2 border-l-red-500/50"
                  )}
                >
                  <div className="relative">
                    <item.icon className={cn(
                      "h-5 w-5 shrink-0 transition-all",
                      isActive ? "drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]" : "opacity-70 group-hover:opacity-100"
                    )} />
                    {hasBadge && isCollapsed && (
                      <span className={cn(
                        "absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center",
                        item.badgeType === 'urgent' ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                      )}>
                        {badgeCount > 9 ? '9+' : badgeCount}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className={cn(
                      "font-semibold truncate text-[13px] tracking-tight",
                      isActive && "font-bold"
                    )}>
                      {item.label}
                    </span>
                  )}
                  {hasBadge && !isCollapsed && (
                    <Badge 
                      variant="secondary"
                      className={cn(
                        "ml-auto h-5 min-w-5 px-1.5 text-[10px] font-bold flex items-center justify-center",
                        getBadgeStyles()
                      )}
                    >
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </Badge>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full shadow-[0_0_10px_hsl(var(--primary)/0.5)]" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold text-[11px] uppercase tracking-widest bg-card border-border max-w-[200px]">
                <div className="space-y-1">
                  <p>{item.label}</p>
                  <p className="text-[10px] font-normal normal-case text-muted-foreground">{item.tooltip}</p>
                  {hasBadge && item.badgeType === 'urgent' && (
                    <p className="text-[10px] text-red-400">{badgeCount} items need attention</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Quick Stats */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-t border-border/20 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cash</span>
            </div>
            <div className="flex items-center gap-2">
              {cashHistory.length > 1 && (
                <div className="w-12 h-4 opacity-70">
                  <React.Suspense fallback={null}>
                    <SidebarCashChart 
                      data={cashHistory} 
                      isNegative={(gameState.finance?.cash ?? 0) < 0} 
                    />
                  </React.Suspense>
                </div>
              )}
              <span className={cn("text-xs font-mono font-bold", (gameState.finance?.cash ?? 0) < 0 ? "text-destructive" : "text-primary")}>
                {formatMoney(gameState.finance?.cash ?? 0)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-secondary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prestige</span>
            </div>
            <span className="text-xs font-mono font-bold text-secondary">{gameState.studio.prestige}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clapperboard className="h-3.5 w-3.5 text-foreground/60" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active</span>
            </div>
            <span className="text-xs font-mono font-bold text-foreground/80">
              {Object.values(gameState.entities.projects).filter(p => p.state !== 'released' && p.state !== 'post_release' && p.state !== 'archived').length}
            </span>
          </div>
        </div>
      )}
      {isCollapsed && (
        <div className="px-2 py-3 border-t border-border/20 flex flex-col items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn("text-[10px] font-mono font-bold", (gameState.finance?.cash ?? 0) < 0 ? "text-destructive" : "text-primary")}>
                <DollarSign className="h-3.5 w-3.5 mx-auto" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs bg-card border-border">
              {formatMoney(gameState.finance?.cash ?? 0)}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-secondary"><Star className="h-3.5 w-3.5 mx-auto" /></div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs bg-card border-border">
              Prestige: {gameState.studio.prestige}
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-3 bg-accent/20 space-y-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={isCollapsed ? "icon" : "default"}
              className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent/50"
              onClick={() => navigate({ to: '/' })}
            >
              <Settings className="h-4.5 w-4.5 shrink-0" />
              {!isCollapsed && <span className="text-[13px]">Settings</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-bold text-[11px] uppercase tracking-widest bg-card border-border">
            Studio Configuration & Preferences
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={isCollapsed ? "icon" : "default"}
              onClick={handleExit}
              className="w-full justify-start gap-3 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" />
              {!isCollapsed && <span className="text-[13px]">Quit Studio</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-bold text-[11px] uppercase tracking-widest bg-card border-border">
            Return to Main Menu
          </TooltipContent>
        </Tooltip>

        <Separator className="bg-border/30 my-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex justify-center hover:bg-accent/50"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-bold text-[11px] uppercase tracking-widest bg-card border-border">
            {isCollapsed ? "Expand" : "Collapse"}
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
};

import React from 'react';
import { useUIStore, TabId } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { selectActiveProjects } from '@/store/selectors';
import { formatMoney } from '@/engine/utils';
import { 
  LayoutDashboard, 
  Film, 
  Library, 
  Globe, 
  Users, 
  Briefcase, 
  Newspaper,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  DollarSign,
  Star,
  Clapperboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from '@tanstack/react-router';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
  tooltip: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'command', label: 'HQ', icon: LayoutDashboard, tooltip: 'Studio overview, alerts, and top-line metrics' },
  { id: 'pipeline', label: 'Production', icon: Film, tooltip: 'Active projects from development through release' },
  { id: 'trades', label: 'The Trades', icon: Newspaper, tooltip: 'Scout IP opportunities, industry news, and market trends' },
  { id: 'talent', label: 'Talent', icon: Users, tooltip: 'Talent roster and industry database (SBDB)' },
  { id: 'distribution', label: 'Distribution', icon: Globe, tooltip: 'Deals desk, streaming platforms, and Nielsen ratings' },
  { id: 'ip', label: 'IP Vault', icon: Library, tooltip: 'Owned intellectual property, franchises, and library rights' },
  { id: 'industry', label: 'Industry', icon: Building2, tooltip: 'Rival studios, M&A activity, and market intelligence' },
  { id: 'finance', label: 'Finance', icon: Briefcase, tooltip: 'P&L statements, revenue streams, and cash flow' },
];

export const StudioSidebar = () => {
  const { activeTab, setActiveTab } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const clearGame = useGameStore(s => s.clearGame);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const navigate = useNavigate();

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
      <div className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={isCollapsed ? "icon" : "default"}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full justify-start gap-3 transition-all duration-200 relative group",
                    isCollapsed ? "justify-center h-11" : "h-10 px-4",
                    isActive 
                      ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" 
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4.5 w-4.5 shrink-0", isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]")} />
                  {!isCollapsed && (
                    <span className="font-semibold truncate text-[13px] tracking-tight">{item.label}</span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full shadow-[0_0_10px_hsl(var(--primary)/0.5)]" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold text-[11px] uppercase tracking-widest bg-card border-border">
                {isCollapsed ? item.label : item.tooltip}
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
            <span className={cn("text-xs font-mono font-bold", (gameState.finance?.cash ?? 0) < 0 ? "text-destructive" : "text-primary")}>
              {formatMoney(gameState.finance?.cash ?? 0)}
            </span>
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
              {Object.values(gameState.studio.internal.projects).filter(p => p.state !== 'released' && p.state !== 'post_release' && p.state !== 'archived').length}
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
              onClick={() => {}}
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

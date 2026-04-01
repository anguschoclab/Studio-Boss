import React from 'react';
import { useUIStore, TabId } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { 
  LayoutDashboard, 
  Film, 
  Library, 
  Handshake, 
  Globe, 
  Users, 
  Briefcase, 
  Newspaper,
  Tv,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings
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
  { id: 'command', label: 'Command Center', icon: LayoutDashboard, tooltip: 'Global studio overview, active alerts, and top-line metrics' },
  { id: 'pipeline', label: 'Production Pipeline', icon: Film, tooltip: 'Manage active projects from development through principal photography' },
  { id: 'ip', label: 'IP Vault', icon: Library, tooltip: 'Catalog of owned intellectual property, franchises, and library rights' },
  { id: 'deals', label: 'Deals Desk', icon: Handshake, tooltip: 'Review incoming talent offers, script submissions, and production bids' },
  { id: 'industry', label: 'Industry Analysis', icon: Globe, tooltip: 'Market trends, rival studio intelligence, and box office forecasts' },
  { id: 'talent', label: 'Talent Roster', icon: Users, tooltip: 'Directory of represented talent and upcoming industry stars' },
  { id: 'finance', label: 'Finance & P&L', icon: Briefcase, tooltip: 'Detailed financial statements, tax incentives, and studio overhead' },
  { id: 'trades', label: 'The Trades', icon: Newspaper, tooltip: 'Scout new IP opportunities and monitor industry headlines' },
  { id: 'sbdb', label: 'SBDB', icon: Users, tooltip: 'Comprehensive historical database of all industry talent and credits' },
  { id: 'streaming', label: 'Streaming & Distribution', icon: Tv, tooltip: 'Manage platform content licenses and home video syndication' },
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
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between overflow-hidden">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-primary-foreground text-xl shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              S
            </div>
            <span className="font-display font-black tracking-tighter text-xl">BOSS</span>
          </div>
        )}
        {isCollapsed && (
           <div className="w-full flex justify-center">
             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-primary-foreground text-xl shadow-[0_0_15px_rgba(var(--primary),0.3)] mx-auto">
              S
            </div>
           </div>
        )}
      </div>

      <Separator className="bg-white/5 mx-6 w-auto mb-6" />

      {/* Navigation */}
      <div className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
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
                    isCollapsed ? "justify-center h-12" : "h-11 px-4",
                    isActive 
                      ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]")} />
                  {!isCollapsed && (
                    <span className="font-medium truncate text-[13px] tracking-tight">{item.label}</span>
                  )}
                  
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
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

      {/* Footer Actions */}
      <div className="p-3 bg-white/5 space-y-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={isCollapsed ? "icon" : "default"}
              className="w-full justify-start gap-3 text-muted-foreground hover:bg-white/5"
              onClick={() => {}} // Future: Settings
            >
              <Settings className="h-5 w-5 shrink-0" />
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
              <LogOut className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="text-[13px]">Quit Studio</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-bold text-[11px] uppercase tracking-widest bg-card border-border">
            Terminate Session & Return to Menu
          </TooltipContent>
        </Tooltip>

        <Separator className="bg-white/5 my-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex justify-center hover:bg-white/5"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-bold text-[11px] uppercase tracking-widest bg-card border-border">
            {isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
};

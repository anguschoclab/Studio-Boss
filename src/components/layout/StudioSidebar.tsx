import React from 'react';
import { useUIStore } from '@/store/uiStore';
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
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from '@tanstack/react-router';

const NAV_ITEMS = [
  { id: 'command', label: 'Command Center', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Production Pipeline', icon: Film },
  { id: 'ip', label: 'IP Vault', icon: Library },
  { id: 'deals', label: 'Deals Desk', icon: Handshake },
  { id: 'industry', label: 'Industry Analysis', icon: Globe },
  { id: 'talent', label: 'Talent Roster', icon: Users },
  { id: 'finance', label: 'Finance & P&L', icon: Briefcase },
  { id: 'trades', label: 'The Trades', icon: Newspaper },
] as const;

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
        <TooltipProvider delayDuration={0}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={isCollapsed ? "icon" : "default"}
                    onClick={() => setActiveTab(item.id as any)}
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
                {isCollapsed && (
                  <TooltipContent side="right" className="font-bold text-[11px] uppercase tracking-widest bg-card border-border">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-white/5 space-y-1">
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          className="w-full justify-start gap-3 text-muted-foreground hover:bg-white/5"
          onClick={() => {}} // Future: Settings
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="text-[13px]">Settings</span>}
        </Button>
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          onClick={handleExit}
          className="w-full justify-start gap-3 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="text-[13px]">Quit Studio</span>}
        </Button>

        <Separator className="bg-white/5 my-2" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex justify-center hover:bg-white/5"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
};

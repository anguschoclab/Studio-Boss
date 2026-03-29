import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Building2, MoreVertical, Zap, UserPlus, ShieldAlert, DollarSign } from 'lucide-react';
import { ARCHETYPES } from '@/engine/data/archetypes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatMoney } from '@/engine/utils';

const strengthColor = (s: number) => {
  if (s >= 70) return 'bg-gradient-to-r from-primary to-primary/80 shadow-[0_0_8px_rgba(234,179,8,0.5)]';
  if (s >= 45) return 'bg-gradient-to-r from-secondary to-secondary/80';
  return 'bg-gradient-to-r from-muted-foreground to-muted-foreground/80';
};

export const RivalsPanel = () => {
  const gameState = useGameStore(s => s.gameState);
  const rivals = gameState?.industry.rivals || [];
  const playerCash = gameState?.cash || 0;
  
  const { corporateSabotage, poachExec, attemptTakeover } = useGameStore();

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
          <h3 className="font-display text-xs font-black uppercase tracking-widest text-foreground/80 drop-shadow-sm">
            Rival Studios
          </h3>
        </div>
      </div>
      <div className="space-y-3">
        {rivals.map(rival => (
          <div key={rival.id} className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-md space-y-3.5 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-destructive/40 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex flex-col">
                <h4 className="font-display text-[15px] font-black text-foreground group-hover:text-destructive transition-colors tracking-tight drop-shadow-sm">{rival.name}</h4>
                <span className="text-[9px] font-black tracking-widest text-muted-foreground/90 uppercase">
                  {ARCHETYPES[rival.archetype]?.name}
                </span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Strategic actions" className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-950 border-destructive/20 text-slate-200">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest opacity-50">Strategic Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-destructive/10" />
                  
                  <DropdownMenuItem 
                    disabled={playerCash < 1_000_000}
                    onClick={() => corporateSabotage(rival.id)}
                    className="gap-2 cursor-pointer focus:bg-destructive focus:text-white"
                  >
                    <Zap className="h-4 w-4 text-amber-500" />
                    <div className="flex flex-col">
                      <span className="font-bold">Corporate Sabotage</span>
                      <span className="text-[10px] opacity-70">Trigger rumor ($1M)</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    disabled={playerCash < 3_000_000}
                    onClick={() => poachExec(rival.id)}
                    className="gap-2 cursor-pointer focus:bg-destructive focus:text-white"
                  >
                    <UserPlus className="h-4 w-4 text-blue-400" />
                    <div className="flex flex-col">
                      <span className="font-bold">Poach Executive</span>
                      <span className="text-[10px] opacity-70">Steal 5% Power ($3M)</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-destructive/10" />
                  
                  <DropdownMenuItem 
                    onClick={() => attemptTakeover(rival.id)}
                    className="gap-2 cursor-pointer bg-destructive/10 focus:bg-destructive focus:text-white"
                  >
                    <ShieldAlert className="h-4 w-4 text-destructive group-focus:text-white" />
                    <div className="flex flex-col">
                      <span className="font-bold text-destructive group-focus:text-white">Hostile Takeover</span>
                      <span className="text-[10px] opacity-70">Buyout studio (Dynamic)</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-[12px] font-medium text-muted-foreground/90 leading-relaxed border-l-2 border-border/50 group-hover:border-destructive/50 pl-2.5 relative z-10 transition-colors">{rival.recentActivity}</p>
            
            <div className="space-y-1.5 relative z-10">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                <span>Power Level</span>
                <span className="font-mono text-foreground/80">{rival.strength}%</span>
              </div>
              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden shadow-inner ring-1 ring-inset ring-border/50">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${strengthColor(rival.strength)} shadow-sm group-hover:shadow-[0_0_10px_rgba(239,68,68,0.4)]`}
                  style={{ width: `${rival.strength}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-muted-foreground/60 pt-1 font-bold italic tracking-tight">
                 <span>{rival.projectCount} active projects</span>
                 {rival.cash > 0 && <span>Valuation: {formatMoney(rival.cash * 2)}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

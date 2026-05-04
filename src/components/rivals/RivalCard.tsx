import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Zap, UserPlus, ShieldAlert } from 'lucide-react';
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
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { cn } from '@/lib/utils';
import { RivalStudio } from '@/engine/types/studio.types';

const strengthColor = (s: number) => {
  if (s >= 70) return 'bg-destructive shadow-[0_0_15px_hsl(var(--destructive)/0.4)]';
  if (s >= 45) return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]';
  return 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]';
};

interface RivalCardProps {
  rival: RivalStudio;
  playerCash: number;
  corporateSabotage: (rivalId: string) => void;
  poachExec: (rivalId: string) => void;
  attemptTakeover: (rivalId: string) => void;
}

export const RivalCard: React.FC<RivalCardProps> = ({
  rival,
  playerCash,
  corporateSabotage,
  poachExec,
  attemptTakeover,
}) => {
  return (
    <div className="p-8 rounded-none glass-card border-white/5 bg-white/[0.01] space-y-8 hover:bg-white/[0.03] hover:border-destructive/30 transition-all duration-700 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-none blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="flex items-start justify-between relative z-10">
        <TooltipWrapper tooltip="STUDIO ARCHETYPE ANALYSIS" side="top">
          <div className="flex flex-col">
            <h4 className="font-display text-xl font-black text-foreground group-hover:text-destructive transition-colors tracking-tighter italic uppercase leading-none">{rival.name}</h4>
            <span className="text-[10px] font-black tracking-[0.3em] text-muted-foreground/40 uppercase mt-2">
              {ARCHETYPES[rival.archetype]?.name}
            </span>
          </div>
        </TooltipWrapper>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 hover:bg-white/10 rounded-none border border-white/5"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-black border-white/10 rounded-none backdrop-blur-3xl">
            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 p-4">STRATEGIC VECTORS</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />

            <DropdownMenuItem
              disabled={playerCash < 1_000_000}
              onClick={() => corporateSabotage(rival.id)}
              className="p-4 gap-4 cursor-pointer focus:bg-white/10"
            >
              <Zap className="h-4 w-4 text-amber-500" />
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-widest text-foreground">SABOTAGE DATA</span>
                <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1">COST: $1.0M</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={playerCash < 3_000_000}
              onClick={() => poachExec(rival.id)}
              className="p-4 gap-4 cursor-pointer focus:bg-white/10"
            >
              <UserPlus className="h-4 w-4 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-widest text-foreground">POACH ASSET</span>
                <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1">COST: $3.0M</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/5" />

            <DropdownMenuItem
              onClick={() => attemptTakeover(rival.id)}
              className="p-4 gap-4 cursor-pointer bg-destructive/10 focus:bg-destructive"
            >
              <ShieldAlert className="h-4 w-4 text-destructive focus:text-white" />
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-widest text-destructive focus:text-white">HOSTILE TAKEOVER</span>
                <span className="text-[9px] font-black text-destructive/40 focus:text-white/40 uppercase tracking-widest mt-1">TARGET ACQUISITION</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-[11px] font-medium text-muted-foreground/60 italic leading-relaxed border-l border-white/10 pl-6 relative z-10 group-hover:border-destructive/30 transition-colors py-1">{rival.recentActivity}</p>

      <div className="space-y-3 relative z-10">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/40">
          <span>POWER LEVEL</span>
          <span className="font-display font-black italic tracking-tighter text-foreground group-hover:text-destructive transition-colors">{rival.strength}%</span>
        </div>
        <div className="h-2 bg-black/60 rounded-none overflow-hidden border border-white/5">
          <div
            className={cn("h-full rounded-none transition-all duration-1000 ease-out", strengthColor(rival.strength))}
            style={{ width: `${rival.strength}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/20 pt-4 border-t border-white/5">
            <span>{rival.projectCount} ACTIVE SLATES</span>
            {rival.cash > 0 && (
              <span className="text-right">VALUATION: {formatMoney(rival.cash * 2)}</span>
            )}
        </div>
      </div>
    </div>
  );
};

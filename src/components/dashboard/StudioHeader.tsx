import { Badge } from "@/components/ui/badge";
import { Star, Zap } from "lucide-react";
import { GameState } from "@/engine/types";

interface StudioHeaderProps {
  gameState: GameState;
}

export const StudioHeader = ({ gameState }: StudioHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-white/5 pb-12 relative overflow-hidden">
      <div className="absolute -left-20 -top-20 w-80 h-80 bg-primary/5 rounded-none blur-[100px] pointer-events-none" />
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-6">
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase italic bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent leading-none">
            {gameState.studio.name}
          </h1>
          <Badge className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 uppercase tracking-[0.3em] text-[10px] py-1.5 px-6 rounded-none shadow-[0_0_25px_rgba(var(--primary),0.1)] transition-all duration-700 backdrop-blur-md">
            {gameState.studio.archetype.replace("-", " ")}
          </Badge>
        </div>
        <p className="text-muted-foreground/40 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] italic">
          <Star className="h-3.5 w-3.5 text-secondary animate-pulse" />
          EXECUTIVE HQ // OPERATIONAL COMMAND
        </p>
      </div>

      <div className="flex flex-wrap gap-4 relative z-10">
        <div className="px-8 py-4 flex flex-col items-end group rounded-none bg-white/[0.01] border border-white/5 transition-all duration-700 hover:bg-white/[0.03] hover:border-white/10">
          <span className="text-[9px] uppercase font-black text-muted-foreground/40 tracking-[0.25em] leading-none mb-3">
            Market Position
          </span>
          <span className="text-lg font-display font-black flex items-center gap-3 text-foreground uppercase italic tracking-tighter leading-none">
            <Zap className="h-4 w-4 text-primary group-hover:scale-125 transition-transform duration-700" />
            TIER{" "}
            {gameState.studio.prestige >= 80 ? "1" : gameState.studio.prestige >= 50 ? "2" : "3"}{" "}
            ASSET
          </span>
        </div>
        <div className="px-8 py-4 flex flex-col items-end rounded-none bg-white/[0.01] border border-white/5 transition-all duration-700 hover:bg-white/[0.03] hover:border-white/10">
          <span className="text-[9px] uppercase font-black text-muted-foreground/40 tracking-[0.25em] leading-none mb-3">
            Fiscal Year
          </span>
          <span className="text-lg font-display font-black text-foreground italic tracking-tighter leading-none">
            {Math.floor(gameState.week / 52) + 1}
          </span>
        </div>
      </div>
    </div>
  );
};

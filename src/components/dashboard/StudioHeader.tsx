import { Badge } from '@/components/ui/badge';
import { Star, Zap } from 'lucide-react';
import { GameState } from '@/engine/types';

interface StudioHeaderProps {
  gameState: GameState;
}

export const StudioHeader = ({ gameState }: StudioHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6 relative">
      <div className="absolute -left-8 -top-8 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter uppercase bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            {gameState.studio.name}
          </h1>
          <Badge tabIndex={0} className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 uppercase tracking-[0.25em] text-[11px] py-1 px-4 rounded-full shadow-[0_0_20px_hsl(var(--primary)_/_0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)_/_0.4)] transition-all duration-500 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none hover:scale-105 cursor-default">
            {gameState.studio.archetype.replace('-', ' ')}
          </Badge>
        </div>
        <p className="text-muted-foreground/90 flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.2em] drop-shadow-md">
          <Star className="h-3.5 w-3.5 text-secondary animate-pulse drop-shadow-[0_0_8px_hsl(var(--secondary)_/_0.8)]" />
          Executive HQ & Operational Overview
        </p>
      </div>
      
      <div className="flex flex-wrap gap-3 relative z-10">
        <div className="px-5 py-2.5 flex flex-col items-end group rounded-xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:shadow-lg">
          <span className="text-[9px] uppercase font-black text-muted-foreground/80 tracking-[0.25em] leading-none mb-1">Market Position</span>
          <span className="text-sm font-display font-black flex items-center gap-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent drop-shadow-md">
            <Zap className="h-3.5 w-3.5 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)_/_0.8)] group-hover:scale-110 transition-transform duration-300" />
            Tier {gameState.studio.prestige >= 80 ? '1' : gameState.studio.prestige >= 50 ? '2' : '3'} Studio
          </span>
        </div>
        <div className="px-5 py-2.5 flex flex-col items-end rounded-xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:shadow-lg">
          <span className="text-[9px] uppercase font-black text-muted-foreground/80 tracking-[0.25em] leading-none mb-1">Fiscal Year</span>
          <span className="text-sm font-display font-black text-white">{Math.floor(gameState.week / 52) + 1}</span>
        </div>
      </div>
    </div>
  );
};

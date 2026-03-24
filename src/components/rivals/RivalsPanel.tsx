import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { ARCHETYPES } from '@/engine/data/archetypes';

const strengthColor = (s: number) => {
  if (s >= 70) return 'bg-gradient-to-r from-primary to-primary/80 shadow-[0_0_8px_rgba(234,179,8,0.5)]';
  if (s >= 45) return 'bg-gradient-to-r from-secondary to-secondary/80';
  return 'bg-gradient-to-r from-muted-foreground to-muted-foreground/80';
};

export const RivalsPanel = () => {
  const rivals = useGameStore(s => s.gameState?.industry.rivals || []);
  const acquireRival = useGameStore(s => s.acquireRival);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-primary drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
        <h3 className="font-display text-xs font-black uppercase tracking-widest text-foreground/80 drop-shadow-sm">
          Rival Studios
        </h3>
      </div>
      <div className="space-y-3">
        {rivals.map(rival => (
          <div key={rival.id} className="p-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md space-y-3.5 shadow-sm hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <h4 className="font-display text-[15px] font-black text-foreground group-hover:text-primary transition-colors tracking-tight drop-shadow-sm">{rival.name}</h4>
              <span className="text-[9px] font-black tracking-widest text-muted-foreground/90 uppercase bg-background/60 border border-border/50 px-2 py-0.5 rounded-full shadow-sm">
                {ARCHETYPES[rival.archetype]?.name.split(' ')[0]}
              </span>
            </div>
            <p className="text-[13px] font-medium text-muted-foreground/90 leading-relaxed border-l-2 border-primary/30 pl-2 relative z-10">{rival.recentActivity}</p>
            <div className="space-y-1.5 relative z-10">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                <span>Power</span>
                <span>{rival.projectCount} proj</span>
              </div>
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden border border-border/20 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${strengthColor(rival.strength)}`}
                  style={{ width: `${rival.strength}%` }}
                />
              </div>
            </div>
            
            {rival.isAcquirable && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3 h-8 text-xs font-bold uppercase tracking-wider bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary border-primary/30 shadow-[0_0_10px_rgba(234,179,8,0.15)] transition-all relative z-10 animate-pulse"
                onClick={() => acquireRival(rival.id)}
              >
                <Building2 className="w-3 h-3 mr-2" /> Look into Buyout
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

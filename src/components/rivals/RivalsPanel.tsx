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
      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
        <Building2 className="w-4 h-4 text-primary drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
        <h3 className="font-display text-xs font-black uppercase tracking-widest text-foreground/80 drop-shadow-sm">
          Rival Studios
        </h3>
      </div>
      <div className="space-y-3">
        {rivals.map(rival => (
          <div key={rival.id} className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-md space-y-3.5 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-destructive/40 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-destructive/10 transition-colors duration-500 pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <h4 className="font-display text-[15px] font-black text-foreground group-hover:text-destructive transition-colors tracking-tight drop-shadow-sm">{rival.name}</h4>
              <span className="text-[9px] font-black tracking-widest text-muted-foreground/90 uppercase bg-background/80 border border-border/50 px-2.5 py-0.5 rounded-full shadow-inner ring-1 ring-inset ring-border/50 group-hover:border-destructive/30 transition-colors">
                {ARCHETYPES[rival.archetype]?.name.split(' ')[0]}
              </span>
            </div>
            <p className="text-[12px] font-medium text-muted-foreground/90 leading-relaxed border-l-2 border-border/50 group-hover:border-destructive/50 pl-2.5 relative z-10 transition-colors">{rival.recentActivity}</p>
            <div className="space-y-1.5 relative z-10 group/power">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                <span className="group-hover/power:text-foreground/80 transition-colors">Power</span>
                <span className="font-mono text-foreground/80">{rival.projectCount} proj</span>
              </div>
              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden shadow-inner ring-1 ring-inset ring-border/50">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${strengthColor(rival.strength)} shadow-sm group-hover:shadow-[0_0_10px_rgba(239,68,68,0.4)]`}
                  style={{ width: `${rival.strength}%` }}
                />
              </div>
            </div>
            
            {rival.isAcquirable && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3 h-8 text-[11px] font-black uppercase tracking-wider bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary border-primary/30 shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all relative z-10 animate-pulse hover:scale-[1.02] active:scale-95 focus-visible:ring-offset-background"
                onClick={() => acquireRival(rival.id)}
              >
                <Building2 className="w-3.5 h-3.5 mr-2" /> Look into Buyout
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

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
    <div className="p-4 space-y-3">
      <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Rival Studios
      </h3>
      <div className="space-y-2">
        {rivals.map(rival => (
          <div key={rival.id} className="p-3.5 rounded-lg border border-border/60 bg-card/40 backdrop-blur-sm space-y-2.5 shadow-sm hover:shadow-md hover:border-border/80 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">{rival.name}</h4>
              <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase bg-muted/50 px-1.5 py-0.5 rounded">
                {ARCHETYPES[rival.archetype]?.name.split(' ')[0]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{rival.recentActivity}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Strength</span>
              <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className={`h-full rounded-full transition-all ${strengthColor(rival.strength)}`}
                  style={{ width: `${rival.strength}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{rival.projectCount} proj</span>
            </div>
            
            {rival.isAcquirable && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2 h-7 text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                onClick={() => acquireRival(rival.id)}
              >
                <Building2 className="w-3 h-3 mr-1" /> Look into Buyout
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

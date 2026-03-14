import { useGameStore } from '@/store/gameStore';
import { ARCHETYPES } from '@/engine/data/archetypes';

const strengthColor = (s: number) => {
  if (s >= 70) return 'bg-primary';
  if (s >= 45) return 'bg-secondary';
  return 'bg-muted-foreground';
};

export const RivalsPanel = () => {
  const rivals = useGameStore(s => s.gameState?.rivals || []);

  return (
    <div className="p-4 space-y-3">
      <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Rival Studios
      </h3>
      <div className="space-y-2">
        {rivals.map(rival => (
          <div key={rival.id} className="p-3 rounded-lg border border-border bg-card space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-semibold text-foreground">{rival.name}</h4>
              <span className="text-[10px] text-muted-foreground uppercase">
                {ARCHETYPES[rival.archetype]?.name.split(' ')[0]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{rival.recentActivity}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Strength</span>
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${strengthColor(rival.strength)}`}
                  style={{ width: `${rival.strength}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{rival.projectCount} proj</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

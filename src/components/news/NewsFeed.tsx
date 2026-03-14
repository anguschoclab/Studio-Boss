import { useGameStore } from '@/store/gameStore';
import { HeadlineCategory } from '@/engine/types';
import { Badge } from '@/components/ui/badge';

const categoryStyles: Record<HeadlineCategory, string> = {
  rival: 'border-destructive/50 text-destructive',
  market: 'border-primary/50 text-primary',
  talent: 'border-secondary/50 text-secondary',
  awards: 'border-primary/50 text-primary',
  general: 'border-muted-foreground/50 text-muted-foreground',
};

export const NewsFeed = () => {
  const headlines = useGameStore(s => s.gameState?.headlines || []);

  return (
    <div className="p-4 space-y-3 border-b border-border">
      <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Industry Pulse
      </h3>
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {headlines.slice(0, 12).map(h => (
          <div key={h.id} className="p-2.5 rounded border border-border bg-card/50 space-y-1.5">
            <p className="text-xs text-foreground leading-relaxed">{h.text}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${categoryStyles[h.category]}`}>
                {h.category}
              </Badge>
              <span className="text-[10px] text-muted-foreground">Wk {h.week}</span>
            </div>
          </div>
        ))}
        {headlines.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No headlines yet</p>
        )}
      </div>
    </div>
  );
};

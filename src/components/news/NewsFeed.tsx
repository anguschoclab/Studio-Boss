import { useGameStore } from '@/store/gameStore';
import { HeadlineCategory } from '@/engine/types';
import { Badge } from '@/components/ui/badge';

const categoryStyles: Record<HeadlineCategory, string> = {
  rival: 'border-destructive/30 bg-destructive/10 text-destructive',
  market: 'border-primary/30 bg-primary/10 text-primary',
  talent: 'border-secondary/30 bg-secondary/10 text-secondary',
  awards: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
  general: 'border-muted-foreground/30 bg-muted/50 text-muted-foreground',
  rumor: 'border-purple-500/30 bg-purple-500/10 text-purple-500',
};

export const NewsFeed = () => {
  const headlines = useGameStore(s => s.gameState?.industry.headlines || []);

  return (
    <div className="p-4 space-y-3 border-b border-border/50 bg-card/20 backdrop-blur-sm">
      <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Industry Pulse
      </h3>
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {headlines.slice(0, 12).map(h => (
          <div key={h.id} className="p-3 rounded-lg border border-border/40 bg-card/40 backdrop-blur shadow-sm hover:shadow-md hover:bg-card/60 transition-all duration-300 space-y-2 group">
            <p className="text-xs text-foreground/90 leading-relaxed font-medium group-hover:text-foreground transition-colors">{h.text}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${categoryStyles[h.category]}`}>
                {h.category}
              </Badge>
              <span className="text-[10px] font-mono font-medium text-muted-foreground">Wk {h.week}</span>
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

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
    <div className="p-5 space-y-4 border-b border-border/50 bg-gradient-to-b from-card/30 to-transparent backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        <h3 className="font-display text-xs font-black uppercase tracking-widest text-foreground/80 drop-shadow-sm">
          Industry Pulse
        </h3>
      </div>
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
        {headlines.slice(0, 12).map(h => (
          <div key={h.id} className="p-3.5 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 space-y-2.5 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            <p className="text-[13px] text-foreground/90 leading-relaxed font-medium group-hover:text-foreground transition-colors relative z-10">{h.text}</p>
            <div className="flex items-center justify-between relative z-10 pt-1">
              <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 ${categoryStyles[h.category]}`}>
                {h.category}
              </Badge>
              <span className="text-[10px] font-mono font-bold text-muted-foreground/80 bg-background/50 px-1.5 py-0.5 rounded border border-border/40">Wk {h.week}</span>
            </div>
          </div>
        ))}
        {headlines.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6 italic opacity-70 border border-dashed border-border/50 rounded-lg">No breaking news yet...</p>
        )}
      </div>
    </div>
  );
};

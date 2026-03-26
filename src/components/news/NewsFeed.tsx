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
    <div className="p-5 space-y-4 border-b border-border/50 bg-gradient-to-b from-card/30 to-transparent backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="flex items-center gap-2 pb-2 border-b border-border/30 relative z-10">
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        <h3 className="font-display text-xs font-black uppercase tracking-widest text-foreground/80 drop-shadow-sm">
          Industry Pulse
        </h3>
      </div>
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
        {headlines.slice(0, 12).map(h => (
          <div key={h.id} className="p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 space-y-2.5 group relative overflow-hidden cursor-default flex flex-col justify-between">
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-border/50 to-transparent group-hover:via-primary/50 transition-colors duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <p className="text-[12px] text-foreground/90 leading-relaxed font-medium group-hover:text-foreground transition-colors relative z-10 pl-2">{h.text}</p>

            <div className="flex items-center justify-between relative z-10 pt-2 border-t border-border/30 mt-auto pl-2">
              <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border shadow-sm ${categoryStyles[h.category]}`}>
                {h.category}
              </Badge>
              <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Wk {h.week}</span>
              </div>
            </div>
          </div>
        ))}
        {headlines.length === 0 && (
          <div className="py-12 text-center opacity-70">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-dashed border-border/40 inline-block px-4 py-2 rounded-lg bg-muted/5">No breaking news</p>
          </div>
        )}
      </div>
    </div>
  );
};

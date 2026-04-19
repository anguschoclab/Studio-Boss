import { Card, CardContent } from '@/components/ui/card';
import { Zap, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NewsEvent } from '@/engine/types';

interface IntelligenceFeedProps {
  newsHistory: NewsEvent[];
}

export const IntelligenceFeed = ({ newsHistory }: IntelligenceFeedProps) => {
  return (
    <Card aria-label="Studio Intelligence Feed" className={cn("animate-in fade-in slide-in-from-bottom-8 duration-1000 relative overflow-hidden text-left group", "bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-2xl border border-white/20 shadow-2xl hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)] transition-all duration-300")}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
      <CardContent className="p-0 relative z-10">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
          <h3 className="text-sm font-extrabold tracking-[0.15em] uppercase flex items-center gap-3 text-foreground/90 drop-shadow-md">
            <div className="p-1.5 rounded-lg bg-primary/20 border border-primary/30 shadow-[0_0_15px_hsl(var(--primary)_/_0.3)]">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
            </div>
            Global Intelligence Feed
          </h3>
          <span className="text-[10px] font-black uppercase text-primary tracking-[0.25em] bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_hsl(var(--primary)_/_0.2)] backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-primary animate-ping relative">
              <div className="absolute inset-0 rounded-full bg-primary" />
            </div>
            Live
          </span>
        </div>
        
        <div className="divide-y divide-white/5">
          {newsHistory && newsHistory.length > 0 ? (
            newsHistory.slice(0, 4).map((news, i) => (
              <div
                key={news.id}
                tabIndex={0}
                className={cn(
                  "flex items-center gap-6 p-6 transition-all duration-500 hover:bg-white/10 backdrop-blur-md border-l-4 border-l-transparent hover:border-l-primary relative overflow-hidden group/item cursor-pointer",
                  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                  i === 0 && "bg-white/5 border-l-primary/50"
              )}>
                {i === 0 && <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none opacity-50" />}
                <div className="w-14 h-14 rounded-2xl bg-black/60 border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] flex items-center justify-center font-mono text-xs font-black text-muted-foreground group-hover/item:text-primary group-hover/item:border-primary/40 group-hover/item:shadow-[0_0_20px_hsl(var(--primary)_/_0.2)] transition-all duration-500 relative z-10 group-hover/item:scale-110">
                  W{news.week}
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                  <p className="text-base font-extrabold text-foreground/90 leading-tight mb-1.5 truncate group-hover/item:text-white transition-colors tracking-tight drop-shadow-sm">{news.headline}</p>
                  <p className="text-sm text-muted-foreground/80 line-clamp-1 group-hover/item:text-muted-foreground/90 transition-colors font-medium">{news.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/60 group-hover/item:text-primary group-hover/item:translate-x-1 transition-all duration-300 relative z-10" />
              </div>
            ))
          ) : (
            <div className="text-center py-20 px-8 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                <Zap className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <p className="text-muted-foreground/70 font-bold uppercase tracking-widest text-sm">Awaiting Intelligence</p>
              <p className="text-muted-foreground/60 text-xs max-w-sm">The global feed is currently silent. Industry activity will be logged here as it happens.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

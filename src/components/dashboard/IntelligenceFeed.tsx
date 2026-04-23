import { Card, CardContent } from '@/components/ui/card';
import { Zap, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NewsEvent } from '@/engine/types';

interface IntelligenceFeedProps {
  newsHistory: NewsEvent[];
}

export const IntelligenceFeed = ({ newsHistory }: IntelligenceFeedProps) => {
  return (
    <Card aria-label="Studio Intelligence Feed" className={cn("animate-in fade-in duration-1000 relative overflow-hidden text-left group", "bg-white/[0.01] backdrop-blur-2xl border border-white/5 rounded-2xl shadow-2xl")}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />
      <CardContent className="p-0 relative z-10">
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
          <h3 className="text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-4 text-muted-foreground/60 italic leading-none">
            <div className="p-2 rounded-none bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
            </div>
            Global Intelligence Feed
          </h3>
          <span className="text-[9px] font-black uppercase text-primary tracking-[0.25em] bg-primary/5 border border-primary/20 px-4 py-2 rounded-none flex items-center gap-3 shadow-[0_0_20px_rgba(var(--primary),0.1)] backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-none bg-primary animate-ping relative">
              <div className="absolute inset-0 rounded-none bg-primary" />
            </div>
            LIVE
          </span>
        </div>
        
        <div className="divide-y divide-white/5">
          {newsHistory && newsHistory.length > 0 ? (
            newsHistory.slice(0, 4).map((news, i) => (
              <div key={news.id} className={cn(
                "flex items-center gap-8 p-8 transition-all duration-700 hover:bg-white/[0.02] border-l-2 border-l-transparent hover:border-l-primary relative overflow-hidden group/item cursor-pointer",
                i === 0 && "bg-white/[0.01] border-l-primary/30"
              )}>
                {i === 0 && <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none opacity-50" />}
                <div className="w-16 h-16 rounded-none bg-black/40 border border-white/5 flex items-center justify-center font-display text-xs font-black text-muted-foreground/40 group-hover/item:text-primary group-hover/item:border-primary/20 transition-all duration-500 relative z-10 group-hover/item:bg-primary/5">
                  W{news.week}
                </div>
                <div className="flex-1 min-w-0 relative z-10 space-y-2">
                  <p className="text-lg font-display font-black text-foreground uppercase italic tracking-tighter leading-none group-hover/item:text-primary transition-colors">{news.headline}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40 line-clamp-1">{news.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/20 group-hover/item:text-primary group-hover/item:translate-x-2 transition-all duration-500 relative z-10" />
              </div>
            ))
          ) : (
            <div className="text-center py-24 px-8 flex flex-col items-center justify-center gap-6">
              <div className="w-20 h-20 rounded-none bg-white/[0.02] border border-white/5 flex items-center justify-center mb-2">
                <Zap className="h-8 w-8 text-muted-foreground/10" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">Awaiting Intelligence</p>
                <p className="text-[9px] text-muted-foreground/10 font-black uppercase tracking-widest max-w-[240px]">SIGNAL SILENT // GLOBAL FEED STANDBY</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

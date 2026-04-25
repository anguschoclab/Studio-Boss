import { useGameStore } from '@/store/gameStore';
import { NewsEventType } from '@/engine/types';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { 
  Trophy, 
  AlertTriangle, 
  TrendingUp, 
  Search,
  History,
} from 'lucide-react';

const eventTypeConfig: Record<NewsEventType, { icon: React.ElementType, color: string, label: string }> = {
  AWARD: { icon: Trophy, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', label: 'Awards' },
  CRISIS: { icon: AlertTriangle, color: 'text-destructive bg-destructive/10 border-destructive/20', label: 'Crises' },
  RELEASE: { icon: TrendingUp, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', label: 'Release' },
  STUDIO_EVENT: { icon: History, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', label: 'Studio' },
  RIVAL: { icon: History, color: 'text-red-400 bg-red-400/10 border-red-400/20', label: 'Rival' },
};

export const NewsFeed = () => {
  const [filter, setFilter] = useState<NewsEventType | 'ALL'>('ALL');
  const history = useGameStore(s => s.gameState?.industry.newsHistory || []);

  const filteredHistory = filter === 'ALL' 
    ? history 
    : history.filter(h => h.type === filter);

  return (
    <div className="flex flex-col h-full bg-black/40 border-l border-white/5 backdrop-blur-3xl">
      {/* Header & Filter */}
      <div className="p-8 border-b border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <History className="h-4 w-4 text-primary" strokeWidth={3} />
            <h3 className="font-display text-xs font-black uppercase tracking-[0.4em] text-foreground italic leading-none">INDUSTRY_HISTORY</h3>
          </div>
          <Badge variant="outline" className="text-[9px] font-black border-white/10 bg-white/5 text-muted-foreground/60 rounded-md italic">
            {history.length} EVENTS
          </Badge>
        </div>

        {/* The Pixel Perfectionist: Switched from overflow-x-auto to flex wrap to prevent horizontal scrolling. */}
        <div className="flex flex-wrap gap-2 pb-2">
          <button 
            type="button"
            aria-pressed={filter === 'ALL'}
            onClick={() => setFilter('ALL')}
            className={`rounded-md text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-700 border italic focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none p-3 m-2 ${
              filter === 'ALL' ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'bg-white/[0.02] text-muted-foreground/40 border-white/5 hover:border-white/20'
            }`}
          >
            ALL
          </button>
          {(Object.keys(eventTypeConfig) as NewsEventType[]).map(type => (
            <button 
              key={type}
              type="button"
              aria-pressed={filter === type}
              onClick={() => setFilter(type)}
              className={`rounded-md text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-700 border flex items-center gap-2 italic whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none p-3 m-2 ${
                filter === type ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'bg-white/[0.02] text-muted-foreground/40 border-white/5 hover:border-white/20'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {filteredHistory.map((item, idx) => {
          const config = eventTypeConfig[item.type];
          return (
            <div key={item.id} className="relative pl-10 group">
              {/* Vertical line connector */}
              {idx !== filteredHistory.length - 1 && (
                <div className="absolute left-[7px] top-4 bottom-[-24px] w-[2px] bg-white/5 pointer-events-none group-hover:bg-primary/20 transition-colors" />
              )}
              
              {/* Timeline Dot/Icon */}
              <div className={`absolute left-0 top-1 w-4 h-4 rounded-md border border-white/10 bg-black z-10 flex items-center justify-center transition-all group-hover:scale-110 group-hover:border-primary/40 ${config.color}`}>
                <config.icon className="h-2 w-2" strokeWidth={3} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                   <span className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.2em] italic">WEEK {item.week}</span>
                   {item.impact && (
                     <span className="text-[9px] font-black text-primary tracking-[0.1em] italic">{item.impact.toUpperCase()}</span>
                   )}
                </div>
                <h4 className="text-xs font-black text-foreground group-hover:text-primary transition-all duration-700 leading-none uppercase italic tracking-tight">{item.headline}</h4>
                <p className="text-[10px] text-muted-foreground/60 leading-relaxed font-black uppercase tracking-wider italic line-clamp-2 group-hover:line-clamp-none transition-all duration-700">{item.description}</p>
              </div>
            </div>
          );
        })}

        {filteredHistory.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-30 grayscale py-20">
            <Search className="h-8 w-8 text-slate-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
};

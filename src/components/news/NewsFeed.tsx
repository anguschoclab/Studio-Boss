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
  Filter
} from 'lucide-react';

const eventTypeConfig: Record<NewsEventType, { icon: any, color: string, label: string }> = {
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
    <div className="flex flex-col h-full bg-slate-950/40 border-l border-slate-800/50 backdrop-blur-xl">
      {/* Header & Filter */}
      <div className="p-4 border-b border-slate-800/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-blue-400" />
            <h3 className="font-display text-xs font-black uppercase tracking-widest text-slate-200">Industry History</h3>
          </div>
          <Badge variant="outline" className="text-[9px] font-black border-slate-700 bg-slate-800/50 text-slate-400">
            {history.length} Events
          </Badge>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border ${
              filter === 'ALL' ? 'bg-white text-black border-white' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            All
          </button>
          {(Object.keys(eventTypeConfig) as NewsEventType[]).map(type => (
            <button 
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border flex items-center gap-1.5 whitespace-nowrap ${
                filter === type ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 text-slate-400 border-slate-800'
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
            <div key={item.id} className="relative pl-6 group">
              {/* Vertical line connector */}
              {idx !== filteredHistory.length - 1 && (
                <div className="absolute left-[7px] top-4 bottom-[-24px] w-[2px] bg-slate-800 pointer-events-none group-hover:bg-slate-700 transition-colors" />
              )}
              
              {/* Timeline Dot/Icon */}
              <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border bg-slate-950 z-10 flex items-center justify-center transition-all group-hover:scale-110 ${config.color}`}>
                <config.icon className="h-2 w-2" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                   <span className="text-[9px] font-mono font-black text-slate-500 uppercase">Week {item.week}</span>
                   {item.impact && (
                     <span className="text-[9px] font-black text-emerald-400 tracking-tighter">{item.impact}</span>
                   )}
                </div>
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-tight">{item.headline}</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium line-clamp-2 group-hover:line-clamp-none transition-all duration-300">{item.description}</p>
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

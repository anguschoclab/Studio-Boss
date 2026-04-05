import React, { useState } from 'react';
import { Newspaper, Trophy, AlertTriangle, TrendingUp, History, Zap } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { NewsEvent, Headline, NewsEventType } from '@/engine/types';
import { cn } from '@/lib/utils';
import { NewsStoryModal } from '@/components/modals/NewsStoryModal';

const eventTypeConfig: Record<string, { icon: any, color: string, label: string }> = {
  AWARD: { icon: Trophy, color: 'text-amber-400', label: 'Awards' },
  CRISIS: { icon: AlertTriangle, color: 'text-destructive', label: 'Crisis' },
  RELEASE: { icon: TrendingUp, color: 'text-emerald-400', label: 'Release' },
  STUDIO_EVENT: { icon: History, color: 'text-blue-400', label: 'Studio' },
  RIVAL: { icon: Zap, color: 'text-red-400', label: 'Rival' },
  GENERAL: { icon: Newspaper, color: 'text-primary', label: 'News' },
};

export const NewsTicker: React.FC = () => {
  const headlines = useGameStore(s => s.news.headlines);
  const [selectedHeadline, setSelectedHeadline] = useState<Headline | null>(null);

  if (!headlines || headlines.length === 0) {
    return (
      <div className="flex-1 flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 overflow-hidden">
        <Newspaper className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-[11px] font-medium text-muted-foreground italic truncate">
          <span className="text-primary font-bold uppercase not-italic mr-2">The Trades:</span>
          Industry steady as summer blockbuster season approaches...
        </span>
      </div>
    );
  }

  // Double the headlines for seamless looping
  const displayHeadlines = [...headlines, ...headlines];

  return (
    <>
      <div className="flex-1 max-w-2xl hidden xl:flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 overflow-hidden group relative">
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md px-2 z-20 border-r border-white/10 relative -ml-1 h-4 shrink-0">
          <Newspaper className="h-3 w-3 text-primary shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]">The Trades</span>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="flex whitespace-nowrap gap-12 items-center animate-marquee cursor-default py-0.5">
            {displayHeadlines.map((item, idx) => {
              const config = eventTypeConfig[item.category.toUpperCase()] || eventTypeConfig.GENERAL;
              const Icon = config.icon;

              return (
                <button
                  key={`${item.id}-${idx}`}
                  onClick={() => setSelectedHeadline(item)}
                  className="flex items-center gap-4 p-2 group/item hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-2">
                      <Icon className={cn("h-3 w-3", config.color)} />
                      <span className="text-[11px] font-bold text-muted-foreground group-hover/item:text-foreground transition-colors hover:underline decoration-primary/30">
                      <span className={cn("uppercase text-[9px] font-black mr-2 opacity-70", config.color)}>{config.label}:</span>
                      {item.text}
                      </span>
                  </div>
                  <span className="text-white/10 select-none">•</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Fade Edges for premium feel */}
        <div className="absolute inset-y-0 left-24 w-12 bg-gradient-to-r from-background via-background/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background via-background/40 to-transparent z-10 pointer-events-none" />
      </div>

      <NewsStoryModal 
        headline={selectedHeadline} 
        open={!!selectedHeadline} 
        onClose={() => setSelectedHeadline(null)} 
      />
    </>
  );
};

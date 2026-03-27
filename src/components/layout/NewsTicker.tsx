import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Trophy, AlertTriangle, TrendingUp, History, Zap } from 'lucide-react';
import { NewsEvent, NewsEventType } from '@/engine/types';
import { cn } from '@/lib/utils';

interface NewsTickerProps {
  news: NewsEvent[];
  onClick?: () => void;
}

const eventTypeConfig: Record<NewsEventType, { icon: any, color: string, label: string }> = {
  AWARD: { icon: Trophy, color: 'text-amber-400', label: 'Awards' },
  CRISIS: { icon: AlertTriangle, color: 'text-destructive', label: 'Crisis' },
  RELEASE: { icon: TrendingUp, color: 'text-emerald-400', label: 'Release' },
  STUDIO_EVENT: { icon: History, color: 'text-blue-400', label: 'Studio' },
  RIVAL: { icon: Zap, color: 'text-red-400', label: 'Rival' },
};

export const NewsTicker: React.FC<NewsTickerProps> = ({ news, onClick }) => {
  const [isPaused, setIsPaused] = useState(false);

  if (!news || news.length === 0) {
    return (
      <div 
        className="flex-1 flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
        onClick={onClick}
      >
        <Newspaper className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-[11px] font-medium text-muted-foreground italic truncate">
          <span className="text-primary font-bold uppercase not-italic mr-2">The Trades:</span>
          Industry steady as summer blockbuster season approaches...
        </span>
      </div>
    );
  }

  // Double the news to ensure seamless looping if we use a CSS marquee,
  // but for a more controlled React app, we can use a simpler approach.
  // Actually, for a single status bar line, a horizontal marquee is the classic "Ticker" feel.
  
  return (
    <div 
      className="flex-1 max-w-2xl hidden xl:flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 overflow-hidden group cursor-pointer hover:bg-white/10 transition-colors relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 bg-background/40 backdrop-blur-md px-2 z-20 border-r border-white/10 relative -ml-1 h-4 shrink-0">
        <Newspaper className="h-3 w-3 text-primary shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-widest text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]">The Trades</span>
      </div>

      <div className="flex-1 overflow-hidden relative h-5">
        <motion.div
          className="flex whitespace-nowrap gap-12 items-center w-max"
          animate={{
            x: isPaused ? undefined : ["0%", "-50%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: news.length * 10, // Adjust speed based on number of items
              ease: "linear",
            },
          }}
        >
          {/* We repeat the items to create the infinite loop effect */}
          {[...news, ...news].map((item, idx) => {
            const config = eventTypeConfig[item.type] || { icon: Zap, color: 'text-primary', label: 'News' };
            const Icon = config.icon;

            return (
              <div key={`${item.id}-${idx}`} className="flex items-center gap-4 group/item">
                <div className="flex items-center gap-2">
                    <Icon className={cn("h-3 w-3", config.color)} />
                    <span className="text-[11px] font-bold text-muted-foreground group-hover/item:text-foreground transition-colors">
                    <span className={cn("uppercase text-[9px] font-black mr-2 opacity-70", config.color)}>{config.label}:</span>
                    {item.headline}
                    </span>
                    {item.impact && (
                    <span className="text-[10px] font-black text-emerald-400 tracking-tighter ml-1 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]">[{item.impact}]</span>
                    )}
                </div>
                <span className="text-white/10 select-none">•</span>
              </div>
            );
          })}
        </motion.div>
      </div>
      
      {/* Fade Edges */}
      <div className="absolute inset-y-0 left-24 w-12 bg-gradient-to-r from-card/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-card/80 to-transparent z-10 pointer-events-none" />
    </div>
  );
};

import React, { useState } from "react";
import { Newspaper, Trophy, AlertTriangle, TrendingUp, History, Zap } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { Headline } from "@/engine/types";
import { cn } from "@/lib/utils";
import { NewsStoryModal } from "@/components/modals/NewsStoryModal";

const eventTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  AWARD: { icon: Trophy, color: "text-amber-400", label: "AWARD_INTEL" },
  CRISIS: { icon: AlertTriangle, color: "text-rose-500", label: "CRITICAL_ALERT" },
  RELEASE: { icon: TrendingUp, color: "text-emerald-500", label: "MARKET_RELEASE" },
  STUDIO_EVENT: { icon: History, color: "text-blue-500", label: "INTERNAL_OPS" },
  RIVAL: { icon: Zap, color: "text-primary", label: "COMPETITIVE_INTEL" },
  GENERAL: { icon: Newspaper, color: "text-muted-foreground/40", label: "INDUSTRY_PULSE" },
};

export const NewsTicker: React.FC = () => {
  const headlines = useGameStore((s) => s.news.headlines);
  const [selectedHeadline, setSelectedHeadline] = useState<Headline | null>(null);

  if (!headlines || headlines.length === 0) {
    return (
      <div className="flex-1 flex items-center gap-4 px-6 py-2 bg-white/[0.01] rounded-none border border-white/5 overflow-hidden backdrop-blur-3xl">
        <Newspaper className="h-4 w-4 text-primary shrink-0 drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
        <span className="text-[10px] font-black text-muted-foreground/20 italic tracking-[0.2em] uppercase truncate">
          <span className="text-primary font-black mr-4">THE_TRADES:</span>
          ESTABLISHING_UPLINK_TO_INDUSTRY_DATABASE...
        </span>
      </div>
    );
  }

  // Double the headlines for seamless looping
  const displayHeadlines = [...headlines, ...headlines];

  return (
    <>
      <div className="flex-1 max-w-2xl hidden xl:flex items-center gap-6 px-0 py-0 bg-white/[0.01] rounded-none border border-white/5 overflow-hidden group relative backdrop-blur-3xl h-10 shadow-2xl">
        <div className="flex items-center gap-3 bg-black/90 px-6 z-20 border-r border-white/10 h-full shrink-0">
          <Newspaper className="h-4 w-4 text-primary shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic drop-shadow-[0_0_15px_rgba(var(--primary),0.6)]">
            THE_TRADES
          </span>
        </div>

        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          <div className="flex whitespace-nowrap gap-16 items-center animate-marquee cursor-default">
            {displayHeadlines.map((item, idx) => {
              const config =
                eventTypeConfig[item.category.toUpperCase()] || eventTypeConfig.GENERAL;
              const Icon = config.icon;

              return (
                <button
                  key={`${item.id}-${idx}`}
                  onClick={() => setSelectedHeadline(item)}
                  className="flex items-center gap-6 group/item hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-3.5 w-3.5", config.color)} />
                    <span className="text-[11px] font-black text-muted-foreground/30 group-hover/item:text-foreground transition-all duration-700 italic tracking-tight">
                      <span
                        className={cn(
                          "uppercase text-[9px] font-black mr-3 tracking-[0.2em]",
                          config.color
                        )}
                      >
                        {config.label}:
                      </span>
                      {item.text.toUpperCase()}
                    </span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-white/10 rotate-45 group-hover/item:bg-primary group-hover/item:scale-125 transition-all duration-700" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Fade Edges for premium feel */}
        <div className="absolute inset-y-0 left-32 w-16 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
      </div>

      <NewsStoryModal
        headline={selectedHeadline}
        open={!!selectedHeadline}
        onClose={() => setSelectedHeadline(null)}
      />
    </>
  );
};

import React, { useEffect, useState } from "react";
import { useUIStore } from "@/store/uiStore";
import { Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AchievementUnlockedPayload {
  achievementId: string;
  name: string;
  description: string;
  week: number;
}

export const AchievementUnlockedModal: React.FC<{ payload?: AchievementUnlockedPayload }> = ({
  payload,
}) => {
  const resolveCurrentModal = useUIStore((s) => s.resolveCurrentModal);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const achievement = payload as AchievementUnlockedPayload | undefined;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9000] flex items-center justify-center bg-black/80 backdrop-blur-2xl transition-all duration-700",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[200px]" />
      </div>

      <div
        className={cn(
          "relative glass-card border border-secondary/30 bg-black/95 p-24 max-w-lg w-full mx-8 shadow-[0_0_120px_rgba(var(--secondary),0.15)] transition-all duration-700",
          visible ? "scale-100 translate-y-0" : "scale-90 translate-y-8"
        )}
      >
        {/* Corner accent */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-secondary/30" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-secondary/30" />

        <div className="text-center space-y-16 relative z-10">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative w-36 h-36 rounded-none bg-secondary/10 border border-secondary/30 flex items-center justify-center shadow-[0_0_60px_rgba(var(--secondary),0.2)]">
              <Trophy className="w-16 h-16 text-secondary" strokeWidth={1} />
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-secondary rounded-none flex items-center justify-center shadow-[0_0_30px_rgba(var(--secondary),0.5)]">
                <Star className="w-5 h-5 text-black" strokeWidth={2.5} fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Label */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.8em] text-secondary/60 italic">
              ACHIEVEMENT UNLOCKED
            </p>
            <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none text-foreground drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {achievement?.name ?? "MILESTONE REACHED"}
            </h2>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/50 leading-relaxed max-w-xs mx-auto">
              {achievement?.description ?? ""}
            </p>
          </div>

          {/* Week badge */}
          {achievement?.week && (
            <div className="inline-flex items-center gap-4 px-8 py-3 border border-secondary/20 bg-secondary/5 text-[10px] font-black tracking-[0.4em] uppercase italic text-secondary/70">
              WEEK {achievement.week} — PERMANENTLY RECORDED
            </div>
          )}

          <Button
            onClick={resolveCurrentModal}
            className="w-full h-16 rounded-none bg-secondary text-black font-display font-black uppercase tracking-[0.4em] text-[11px] hover:bg-secondary/80 transition-all duration-700 shadow-[0_0_40px_rgba(var(--secondary),0.3)]"
          >
            ACKNOWLEDGE
          </Button>
        </div>
      </div>
    </div>
  );
};

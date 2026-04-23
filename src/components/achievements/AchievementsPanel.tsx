import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { ACHIEVEMENT_CATALOGUE, Achievement } from '@/engine/systems/AchievementsSystem';
import { Trophy, Lock, CheckCircle2, Star, DollarSign, Users, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = 'all' | 'financial' | 'creative' | 'talent' | 'empire';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  financial: <DollarSign className="w-3.5 h-3.5" />,
  creative: <Star className="w-3.5 h-3.5" />,
  talent: <Users className="w-3.5 h-3.5" />,
  empire: <Globe className="w-3.5 h-3.5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  financial: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
  creative: 'text-secondary border-secondary/30 bg-secondary/5',
  talent: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  empire: 'text-primary border-primary/30 bg-primary/5',
};

export const AchievementsPanel: React.FC = () => {
  const unlockedIds: string[] = useGameStore(s => (s.gameState?.studio as { achievements?: string[] })?.achievements ?? []);
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const enriched: (Achievement & { earned: boolean })[] = useMemo(() => {
    return ACHIEVEMENT_CATALOGUE.map(def => ({
      ...def,
      unlocked: unlockedIds.includes(def.id),
      earned: unlockedIds.includes(def.id),
    }));
  }, [unlockedIds]);

  const filtered = activeCategory === 'all'
    ? enriched
    : enriched.filter(a => a.category === activeCategory);

  const total = enriched.length;
  const earned = enriched.filter(a => a.earned).length;
  const progress = total > 0 ? (earned / total) * 100 : 0;

  const categories: Category[] = ['all', 'financial', 'creative', 'talent', 'empire'];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-8 border-b border-white/5">
        <div className="flex items-center gap-8">
          <div className="w-14 h-14 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.1)]">
            <Trophy className="w-7 h-7 text-primary" strokeWidth={1} />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-display font-black tracking-tighter uppercase italic leading-none">ACHIEVEMENTS</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 italic">
              LEGACY RECORDS // CAREER MILESTONES
            </p>
          </div>
        </div>
        <div className="text-right space-y-2">
          <p className="text-4xl font-display font-black tracking-tighter italic text-primary leading-none">
            {earned}<span className="text-muted-foreground/20">/{total}</span>
          </p>
          <div className="w-32 h-1 bg-white/5 rounded-none overflow-hidden">
            <div
              className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-3 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'h-9 px-6 text-[9px] font-black uppercase tracking-[0.4em] border transition-all duration-500 rounded-none italic',
              activeCategory === cat
                ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]'
                : 'border-white/10 text-muted-foreground/40 hover:border-white/20 hover:text-muted-foreground/60'
            )}
          >
            {cat === 'all' ? 'ALL' : cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(a => {
          const colorClass = CATEGORY_COLORS[a.category] ?? 'text-primary border-primary/30 bg-primary/5';
          return (
            <div
              key={a.id}
              className={cn(
                'relative p-8 border transition-all duration-700 group rounded-none',
                a.earned
                  ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
                  : 'border-white/5 bg-white/[0.01] opacity-50'
              )}
            >
              {/* Category badge */}
              <div className={cn(
                'absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 border text-[8px] font-black uppercase tracking-[0.3em] italic rounded-none',
                colorClass
              )}>
                {CATEGORY_ICONS[a.category]}
                {a.category}
              </div>

              <div className="flex items-start gap-6 pr-20">
                {/* Status icon */}
                <div className={cn(
                  'w-12 h-12 flex items-center justify-center border rounded-none flex-shrink-0 transition-all duration-700',
                  a.earned
                    ? 'bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.15)]'
                    : 'bg-white/[0.02] border-white/10'
                )}>
                  {a.earned
                    ? <CheckCircle2 className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    : <Lock className="w-5 h-5 text-muted-foreground/20" strokeWidth={1.5} />
                  }
                </div>

                <div className="space-y-3 flex-1 min-w-0">
                  <h4 className={cn(
                    'text-xl font-display font-black uppercase tracking-tight italic leading-none truncate transition-all duration-700',
                    a.earned ? 'text-foreground group-hover:text-primary' : 'text-muted-foreground/30'
                  )}>
                    {a.name}
                  </h4>
                  <p className={cn(
                    'text-[10px] font-black uppercase tracking-[0.15em] leading-relaxed transition-all duration-700',
                    a.earned ? 'text-muted-foreground/50 group-hover:text-muted-foreground/70' : 'text-muted-foreground/20'
                  )}>
                    {a.description}
                  </p>
                </div>
              </div>

              {/* Progress bar for numeric achievements */}
              {a.target && !a.earned && (
                <div className="mt-8 space-y-2">
                  <div className="w-full h-0.5 bg-white/5 rounded-none overflow-hidden">
                    <div
                      className="h-full bg-white/20 transition-all duration-1000"
                      style={{ width: `${Math.min(((a.current ?? 0) / a.target) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">
                    IN PROGRESS
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-24 text-center text-muted-foreground/10 uppercase font-black tracking-[0.5em] italic text-xs">
          NO ACHIEVEMENTS IN THIS CATEGORY.
        </div>
      )}
    </div>
  );
};

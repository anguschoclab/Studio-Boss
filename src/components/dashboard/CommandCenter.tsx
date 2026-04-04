import React from 'react';
import { FinancialOverviewWidget } from './FinancialOverviewWidget';
import { DemographicsWidget } from './DemographicsWidget';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';
import { Badge } from '@/components/ui/badge';
import { Clapperboard, Users, Building2, TrendingUp, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useShallow } from 'zustand/react/shallow';

export const CommandCenter: React.FC = () => {
  // ⚡ Bolt: Destructured with useShallow to prevent unnecessary re-renders on minor state ticks
  const studio = useGameStore(useShallow((state) => state.gameState?.studio));
  const industry = useGameStore(useShallow((state) => state.gameState?.industry));

  if (!studio || !industry) return null;

  const projects = Object.values(studio.internal.projects || {});
  const { talentPool, rivals, newsHistory } = industry;

  const activeProjectsCount = projects.filter(p => p.state !== 'released' && p.state !== 'post_release' && p.state !== 'archived').length;
  const talentCount = Object.keys(talentPool).length;
  const rivalCount = rivals.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Studio Executive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-5xl font-display font-black tracking-tighter uppercase bg-gradient-to-br from-white via-foreground/90 to-foreground/40 bg-clip-text text-transparent drop-shadow-lg">
              {studio.name}
            </h1>
            <Badge className="bg-primary/10 text-primary border border-primary/20 uppercase tracking-[0.2em] text-[10px] py-0.5 px-3 rounded-full shadow-[0_0_15px_hsl(var(--primary) / 0.15)] transition-all duration-500 hover:bg-primary/20 hover:shadow-[0_0_20px_hsl(var(--primary) / 0.3)]">
              {studio.archetype.replace('-', ' ')}
            </Badge>
          </div>
          <p className="text-muted-foreground/80 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest drop-shadow-sm">
            <Star className="h-3 w-3 text-secondary animate-pulse drop-shadow-[0_0_5px_hsl(var(--secondary) / 0.6)]" />
            Executive HQ & Operational Overview
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="px-5 py-2.5 bg-card/40 backdrop-blur-md rounded-xl border border-white/10 shadow-lg flex flex-col items-end transition-all hover:border-white/20 hover:bg-card/60">
            <span className="text-[9px] uppercase font-black text-muted-foreground/70 tracking-[0.2em] leading-none mb-1">Market Position</span>
            <span className="text-sm font-display font-black flex items-center gap-1.5 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent drop-shadow-sm">
              <Zap className="h-3.5 w-3.5 text-primary drop-shadow-[0_0_5px_hsl(var(--primary) / 0.8)]" />
              Tier 2 Studio
            </span>
          </div>
        </div>
      </div>

      {/* High-Impact KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: 'Active Pipeline', value: activeProjectsCount, sub: 'Projects in dev', icon: Clapperboard, color: 'text-primary' },
          { label: 'Talent Roster', value: talentCount, sub: 'Contracted talent', icon: Users, color: 'text-secondary' },
          { label: 'Industry Rivals', value: rivalCount, sub: 'Active competitors', icon: Building2, color: 'text-destructive' },
          { label: 'Prestige XP', value: studio.prestige, sub: 'Reputation level', icon: TrendingUp, color: 'text-success' },
        ].map((kpi, i) => (
          <Card key={i} className="glass-card hover-glow group overflow-hidden relative border border-white/10 hover:border-white/20 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl">
            <div className={cn("absolute -top-6 -right-6 w-24 h-24 opacity-10 blur-[30px] rounded-full transition-all duration-700 group-hover:opacity-40 group-hover:blur-[40px] group-hover:scale-150", kpi.color.replace('text', 'bg'))} />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 group-hover:text-foreground/90 transition-colors duration-300">{kpi.label}</span>
                <div className={cn("p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/5 transition-all duration-500 group-hover:scale-110 group-hover:bg-white/10 group-hover:border-white/20", kpi.color.replace('text', 'text'))}>
                  <kpi.icon className={cn("h-4 w-4 drop-shadow-md group-hover:drop-shadow-[0_0_12px_currentColor]", kpi.color)} />
                </div>
              </div>
              <div className="text-4xl font-display font-black tracking-tighter mb-1 text-foreground/90 group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] transition-all duration-300">{kpi.value}</div>
              <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider group-hover:text-muted-foreground/80 transition-colors duration-300">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strategic Visualization Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FinancialOverviewWidget />
        </div>
        <div className="lg:col-span-1">
          <DemographicsWidget />
        </div>
      </div>
      
      {/* Recent Industry Intelligence */}
      <Card className="glass-card border border-white/10 hover:border-white/20 transition-colors duration-500 bg-card/40 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <CardContent className="p-0 relative z-10">
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <h3 className="text-sm font-extrabold tracking-[0.1em] uppercase flex items-center gap-2 text-foreground/90 drop-shadow-md">
              <Zap className="h-4 w-4 text-primary animate-pulse drop-shadow-[0_0_8px_hsl(var(--primary) / 0.6)]" />
              Recent Intelligence
            </h3>
            <span className="text-[9px] font-black uppercase text-primary tracking-[0.2em] bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_hsl(var(--primary) / 0.1)]">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              Live Feed
            </span>
          </div>
          
          <div className="divide-y divide-white/5">
            {newsHistory && newsHistory.length > 0 ? (
              newsHistory.slice(0, 4).map((news, i) => (
                <div key={news.id} className={cn(
                  "flex items-center gap-5 p-5 transition-all duration-300 group cursor-default hover:bg-white/10 backdrop-blur-sm border-l-2 border-l-transparent hover:border-l-primary relative overflow-hidden",
                  i === 0 && "bg-white/5 border-l-primary/50"
                )}>
                  {i === 0 && <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />}
                  <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 shadow-inner flex items-center justify-center font-mono text-[11px] font-extrabold text-muted-foreground group-hover:text-primary group-hover:border-primary/30 group-hover:shadow-[0_0_15px_hsl(var(--primary) / 0.15)] transition-all duration-300 relative z-10">
                    W{news.week}
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <p className="text-sm font-extrabold text-foreground/80 leading-tight mb-1 truncate group-hover:text-white transition-colors tracking-tight">{news.headline}</p>
                    <p className="text-xs text-muted-foreground/60 line-clamp-1 group-hover:text-muted-foreground/90 transition-colors font-medium">{news.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 px-6 text-muted-foreground/40 italic font-medium">
                No recent industry activity logged in the global feed.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

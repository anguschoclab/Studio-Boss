import React from 'react';
import { FinancialOverviewWidget } from './FinancialOverviewWidget';
import { DemographicsWidget } from './DemographicsWidget';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';
import { Badge } from '@/components/ui/badge';
import { Clapperboard, Users, Building2, TrendingUp, Star, Zap, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useShallow } from 'zustand/react/shallow';

export const CommandCenter: React.FC = () => {
  const gameState = useGameStore(useShallow((state) => state.gameState));

  if (!gameState || !gameState.studio || !gameState.industry) return null;

  const projects = Object.values(gameState.entities?.projects || {});
  const normalizedTalents = gameState.entities?.talents || {};
  const normalizedRivals = gameState.entities?.rivals || {};
  const newsHistory = gameState?.industry?.newsHistory ?? [];

  const activeProjectsCount = projects.filter(p => p.state !== 'released' && p.state !== 'post_release' && p.state !== 'archived').length;
  const talentCount = Object.keys(normalizedTalents).length;
  const rivalCount = Object.keys(normalizedRivals).length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      {/* Studio Executive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6 relative">
        <div className="absolute -left-8 -top-8 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter uppercase bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {gameState.studio.name}
            </h1>
            <Badge className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 uppercase tracking-[0.25em] text-[11px] py-1 px-4 rounded-full shadow-[0_0_20px_hsl(var(--primary)_/_0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)_/_0.4)] transition-all duration-500 backdrop-blur-md">
              {gameState.studio.archetype.replace('-', ' ')}
            </Badge>
          </div>
          <p className="text-muted-foreground/90 flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.2em] drop-shadow-md">
            <Star className="h-3.5 w-3.5 text-secondary animate-pulse drop-shadow-[0_0_8px_hsl(var(--secondary)_/_0.8)]" />
            Executive HQ & Operational Overview
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 relative z-10">
          <div className="px-6 py-3 bg-card/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col items-end transition-all duration-500 hover:border-white/30 hover:bg-card/80 hover:-translate-y-1 group">
            <span className="text-[10px] uppercase font-black text-muted-foreground/80 tracking-[0.25em] leading-none mb-1.5">Market Position</span>
            <span className="text-base font-display font-black flex items-center gap-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent drop-shadow-md">
              <Zap className="h-4 w-4 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)_/_0.8)] group-hover:scale-110 transition-transform duration-300" />
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
          { label: 'Prestige XP', value: gameState.studio.prestige, sub: 'Reputation level', icon: TrendingUp, color: 'text-success' },
        ].map((kpi, i) => (
          <Card key={i} className="glass-card animate-in zoom-in-95 duration-500 group overflow-hidden relative border border-white/10 hover:border-white/30 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(0,0,0,0.6)] bg-gradient-to-br from-white/10 via-white/5 to-black/40 backdrop-blur-3xl">
            <div className={cn("absolute -top-10 -right-10 w-40 h-40 opacity-10 blur-[50px] rounded-full transition-all duration-700 group-hover:opacity-60 group-hover:blur-[60px] group-hover:scale-150", kpi.color.replace('text', 'bg'))} />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            <CardContent className="p-6 relative z-10 text-left">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/70 group-hover:text-white/90 transition-colors duration-500">{kpi.label}</span>
                <div className={cn("p-3 rounded-2xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl border border-white/10 transition-all duration-500 group-hover:scale-110 group-hover:border-white/40 shadow-[0_8px_16px_rgba(0,0,0,0.3)]", kpi.color.replace('text', 'text'))}>
                  <kpi.icon className={cn("h-5 w-5 drop-shadow-lg group-hover:drop-shadow-[0_0_20px_currentColor]", kpi.color)} />
                </div>
              </div>
              <div className="text-6xl font-display font-black tracking-tighter mb-2 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-500">{kpi.value}</div>
              <p className="text-[11px] text-muted-foreground/70 font-extrabold uppercase tracking-[0.2em] group-hover:text-muted-foreground/80 transition-colors duration-500">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strategic Visualization Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 text-left">
        <div className="lg:col-span-2 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <FinancialOverviewWidget />
        </div>
        <div className="lg:col-span-1 relative group">
          <div className="absolute -inset-1 bg-gradient-to-l from-secondary/20 via-transparent to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <DemographicsWidget />
        </div>
      </div>
      
      {/* Recent Industry Intelligence */}
      <Card aria-label="Studio Intelligence Feed" className="glass-card animate-in fade-in slide-in-from-bottom-8 duration-1000 border border-white/10 hover:border-white/20 transition-all duration-700 bg-card/60 backdrop-blur-2xl relative overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)] text-left group">
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
                <div key={news.id} className={cn(
                  "flex items-center gap-6 p-6 transition-all duration-500 hover:bg-white/10 backdrop-blur-md border-l-4 border-l-transparent hover:border-l-primary relative overflow-hidden group/item cursor-pointer",
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
    </div>
  );
};

import React from 'react';
import { FinancialOverviewWidget } from './FinancialOverviewWidget';
import { DemographicsWidget } from './DemographicsWidget';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';
import { Badge } from '@/components/ui/badge';
import { Clapperboard, Users, Building2, TrendingUp, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CommandCenter: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  if (!gameState) return null;

  const { studio, industry } = gameState;
  const { projects } = studio.internal;
  const { talentPool, rivals, newsHistory } = industry;

  const activeProjectsCount = projects.filter(p => p.status !== 'released' && p.status !== 'post_release' && p.status !== 'archived').length;
  const talentCount = talentPool.length;
  const rivalCount = rivals.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Studio Executive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-black tracking-tighter uppercase">{studio.name}</h1>
            <Badge className="bg-primary/20 text-primary border-primary/30 uppercase tracking-widest text-[10px] py-0.5 px-2">
              {studio.archetype.replace('-', ' ')}
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <Star className="h-3.5 w-3.5 text-secondary" />
            Executive HQ & Operational Overview
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5 flex flex-col items-end">
            <span className="text-[9px] uppercase font-black text-muted-foreground tracking-widest leading-none mb-1">Market Position</span>
            <span className="text-sm font-bold flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary" /> Tier 2 Studio</span>
          </div>
        </div>
      </div>

      {/* High-Impact KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Pipeline', value: activeProjectsCount, sub: 'Projects in dev', icon: Clapperboard, color: 'text-primary' },
          { label: 'Talent Roster', value: talentCount, sub: 'Contracted talent', icon: Users, color: 'text-secondary' },
          { label: 'Industry Rivals', value: rivalCount, sub: 'Active competitors', icon: Building2, color: 'text-destructive' },
          { label: 'Prestige XP', value: studio.prestige, sub: 'Reputation level', icon: TrendingUp, color: 'text-success' },
        ].map((kpi, i) => (
          <Card key={i} className="glass-card hover-glow group overflow-hidden relative border-none">
            {/* Visual Flare */}
            <div className={cn("absolute -top-4 -right-4 w-16 h-16 opacity-10 blur-2xl rounded-full", kpi.color.replace('text', 'bg'))} />
            
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">{kpi.label}</span>
                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
              </div>
              <div className="text-3xl font-black tracking-tighter mb-1">{kpi.value}</div>
              <p className="text-[11px] text-muted-foreground/60 font-medium">{kpi.sub}</p>
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
      <Card className="glass-card border-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black tracking-tight uppercase flex items-center gap-2 text-foreground/90">
              <Zap className="h-4 w-4 text-primary" />
              Recent Intelligence
            </h3>
            <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Live Feed</span>
          </div>
          
          <div className="space-y-4">
            {newsHistory && newsHistory.length > 0 ? (
              newsHistory.slice(0, 4).map((news, i) => (
                <div key={news.id} className={cn(
                  "flex items-center gap-4 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group cursor-default",
                  i === 0 && "border-primary/20 bg-primary/5"
                )}>
                  <div className="w-10 h-10 rounded bg-card flex items-center justify-center font-mono text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                    W{news.week}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-foreground/80 leading-tight mb-0.5">{news.headline}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{news.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground/40 italic">
                No recent industry activity logged.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

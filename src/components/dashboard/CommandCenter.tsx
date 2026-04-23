import React from 'react';
import { FinancialOverviewWidget } from './FinancialOverviewWidget';
import { DemographicsWidget } from './DemographicsWidget';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';
import { Badge } from '@/components/ui/badge';
import { Clapperboard, Users, Building2, TrendingUp, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPIStatCard } from '@/components/shared/KPIStatCard';

export const CommandCenter: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  if (!gameState) return null;

  const { studio, industry } = gameState;
  const projects = Object.values(studio.internal.projects);
  const { talentPool, rivals, newsHistory } = industry;

  const activeProjectsCount = projects.filter(p => p.state !== 'released' && p.state !== 'post_release' && p.state !== 'archived').length;
  const talentCount = Object.keys(talentPool).length;
  const rivalCount = rivals.length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Studio Executive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-5xl font-display font-black tracking-tighter uppercase italic">{studio.name}</h1>
            <Badge className="bg-primary text-black border-none uppercase tracking-[0.2em] text-[9px] font-black h-5 px-3">
              {studio.archetype.replace('-', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded border border-white/5">
              <Star className="h-3 w-3 text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Command Center</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Studio Operational Overview • Sector Alpha-1</span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="px-5 py-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-end min-w-[140px]">
            <span className="text-[9px] uppercase font-black text-muted-foreground/40 tracking-[0.2em] leading-none mb-2">Market Position</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-display font-black uppercase tracking-tight">Major Challenger</span>
            </div>
          </div>
        </div>
      </div>

      {/* High-Impact KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPIStatCard 
          label="Active Pipeline" 
          value={activeProjectsCount} 
          subLabel="Live Projects" 
          icon={<Clapperboard className="h-4 w-4" />} 
          variant="primary"
          tooltip="Total number of projects currently in the production funnel."
        />
        <KPIStatCard 
          label="Talent Roster" 
          value={talentCount} 
          subLabel="Industry Database" 
          icon={<Users className="h-4 w-4" />} 
          variant="secondary"
          tooltip="Total volume of actors, directors, and writers in the SBDB."
        />
        <KPIStatCard 
          label="Industry Rivals" 
          value={rivalCount} 
          subLabel="Active Competitors" 
          icon={<Building2 className="h-4 w-4" />} 
          variant="destructive"
          tooltip="Number of rival studios competing for market share."
        />
        <KPIStatCard 
          label="Prestige Score" 
          value={studio.prestige} 
          subLabel="Studio Reputation" 
          icon={<TrendingUp className="h-4 w-4" />} 
          variant="success"
          tooltip="Global reputation level. Affects talent rates and box office leverage."
        />
      </div>

      {/* Strategic Visualization Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FinancialOverviewWidget />
        </div>
        <div className="lg:col-span-1">
          <DemographicsWidget />
        </div>
      </div>
      
      {/* Recent Industry Intelligence */}
      <div className="glass-card p-8 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -mr-48 -mt-48" />
        
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
               <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-display font-black tracking-tight uppercase italic leading-none mb-1">Recent Intelligence</h3>
              <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">Global Industry Surveillance • Real-time Feeds</p>
            </div>
          </div>
          <Badge variant="outline" className="h-6 px-3 text-[9px] font-black border-white/10 text-muted-foreground/60 tracking-[0.2em]">LIVE SECURE</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {newsHistory && newsHistory.length > 0 ? (
            newsHistory.slice(0, 6).map((news, i) => (
              <div key={news.id} className={cn(
                "flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-white/5 hover:border-white/10 transition-all group cursor-default",
                i === 0 && "border-primary/20 bg-primary/5 hover:border-primary/30"
              )}>
                <div className="w-12 h-12 rounded-lg bg-card/80 border border-white/5 shadow-sm flex items-center justify-center font-display text-xs font-black text-muted-foreground group-hover:text-primary transition-all">
                  W{news.week}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-display font-black uppercase tracking-tight leading-tight mb-1 truncate group-hover:text-foreground transition-colors">{news.headline}</p>
                  <p className="text-[11px] text-muted-foreground/60 line-clamp-1 group-hover:text-muted-foreground/80 transition-colors italic">{news.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-muted-foreground/20 uppercase font-black tracking-[0.3em] italic">
              No recent industry activity logged in sector.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

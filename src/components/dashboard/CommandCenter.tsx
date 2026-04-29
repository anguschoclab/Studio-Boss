import React from 'react';
import { FinancialOverviewWidget } from './FinancialOverviewWidget';
import { DemographicsWidget } from './DemographicsWidget';
import { useGameStore } from '@/store/gameStore';
import { Clapperboard, Users, Building2, TrendingUp, Star, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPIStatCard } from '@/components/shared/KPIStatCard';
import { StudioIdentityPanel } from '@/components/studio/StudioIdentityPanel';
import { AchievementsPanel } from '@/components/achievements/AchievementsPanel';

export const CommandCenter: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  if (!gameState) return null;

  const { studio, industry, entities } = gameState;
  const projects = Object.values(entities?.projects || {});
  const { newsHistory } = industry || {};
  const talentPool = entities?.talents || {};
  const rivals = Object.values(entities?.rivals || {});

  const activeProjectsCount = projects.filter(p => p.state !== 'released' && p.state !== 'post_release' && p.state !== 'archived').length;
  const talentCount = Object.keys(talentPool).length;
  const rivalCount = rivals.length;

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Studio Executive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-white/5">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <h1 className="text-7xl font-display font-black tracking-tighter uppercase italic leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">{studio.name}</h1>
            <div className="bg-primary text-black border-none uppercase tracking-[0.3em] text-[10px] font-black h-6 px-4 flex items-center rounded-none shadow-[0_0_20px_rgba(var(--primary),0.3)]">
              {studio.archetype.replace('-', ' ').toUpperCase()}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] rounded-none border border-white/10">
              <Star className="h-3.5 w-3.5 text-secondary" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">COMMAND CENTER</span>
            </div>
            <div className="h-1 w-1 rounded-none bg-white/10" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">STUDIO OPERATIONAL OVERVIEW • SECTOR ALPHA-1</span>
          </div>
        </div>
        
        <div className="flex gap-6">
          <div className="px-8 py-5 bg-white/[0.01] rounded-none border border-white/5 flex flex-col items-end min-w-[200px] transition-all duration-700 hover:bg-white/[0.03]">
            <span className="text-[10px] uppercase font-black text-muted-foreground/20 tracking-[0.3em] leading-none mb-4 italic">MARKET POSITION</span>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-none bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-pulse" />
              <span className="text-sm font-display font-black uppercase tracking-tight italic text-foreground">MAJOR CHALLENGER</span>
            </div>
          </div>
        </div>
      </div>

      {/* High-Impact KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <KPIStatCard 
          label="ACTIVE PIPELINE" 
          value={activeProjectsCount} 
          subLabel="LIVE PROJECTS" 
          icon={<Clapperboard className="h-5 w-5" strokeWidth={1.5} />} 
          variant="primary"
          tooltip="Total number of projects currently in the production funnel."
        />
        <KPIStatCard 
          label="TALENT ROSTER" 
          value={talentCount} 
          subLabel="INDUSTRY DATABASE" 
          icon={<Users className="h-5 w-5" strokeWidth={1.5} />} 
          variant="secondary"
          tooltip="Total volume of actors, directors, and writers in the SBDB."
        />
        <KPIStatCard 
          label="INDUSTRY RIVALS" 
          value={rivalCount} 
          subLabel="ACTIVE COMPETITORS" 
          icon={<Building2 className="h-5 w-5" strokeWidth={1.5} />} 
          variant="destructive"
          tooltip="Number of rival studios competing for market share."
        />
        <KPIStatCard 
          label="PRESTIGE SCORE" 
          value={studio.prestige} 
          subLabel="STUDIO REPUTATION" 
          icon={<TrendingUp className="h-5 w-5" strokeWidth={1.5} />} 
          variant="success"
          tooltip="Global reputation level. Affects talent rates and box office leverage."
        />
      </div>

      {/* Strategic Visualization Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <FinancialOverviewWidget />
        </div>
        <div className="lg:col-span-1">
          <DemographicsWidget />
        </div>
      </div>
      
      {/* Studio Identity & Achievements Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="glass-card p-12 bg-black/40 border border-white/5 rounded-none shadow-2xl">
          <StudioIdentityPanel culture={studio.culture} />
        </div>
        <div className="glass-card p-12 bg-black/40 border border-white/5 rounded-none shadow-2xl">
          <AchievementsPanel />
        </div>
      </div>

      {/* Recent Industry Intelligence */}
      <div className="glass-card p-12 bg-gradient-to-br from-white/[0.03] to-transparent relative overflow-hidden rounded-none border border-white/5">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-none blur-[150px] pointer-events-none -mr-48 -mt-48 opacity-50" />
        
        <div className="flex items-center justify-between mb-12 pb-6 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.1)]">
               <Zap className="h-8 w-8 text-primary" strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-display font-black tracking-tight uppercase italic leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">RECENT INTELLIGENCE</h3>
              <p className="text-[10px] font-black uppercase text-muted-foreground/20 tracking-[0.4em] italic">GLOBAL INDUSTRY SURVEILLANCE • REAL-TIME FEEDS</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-2 border border-emerald-400/20 bg-emerald-400/5 rounded-none shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span className="text-[9px] font-black text-emerald-400 tracking-[0.3em] uppercase italic">LIVE SECURE</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {newsHistory && newsHistory.length > 0 ? (
            newsHistory.slice(0, 6).map((news, i) => (
              <div key={news.id} className={cn(
                "flex items-center gap-6 p-6 rounded-none border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/20 transition-all duration-700 group cursor-default",
                i === 0 && "border-primary/20 bg-primary/5 hover:border-primary/40"
              )}>
                <div className="w-16 h-16 rounded-none bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center font-display text-[10px] font-black text-muted-foreground/40 group-hover:text-primary transition-all duration-700 uppercase italic tracking-tighter">
                  <span className="text-muted-foreground/10 text-[8px] tracking-[0.2em] mb-1">WEEK</span>
                  <span className="text-xl leading-none">{news.week}</span>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-lg font-display font-black uppercase tracking-tight leading-none truncate group-hover:text-foreground transition-all duration-700 italic drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">{news.headline}</p>
                  <p className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.2em] line-clamp-1 group-hover:text-muted-foreground/60 transition-all duration-700 italic">{news.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center text-muted-foreground/10 uppercase font-black tracking-[0.5em] italic text-xs">
              NO RECENT INDUSTRY ACTIVITY LOGGED IN SECTOR.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

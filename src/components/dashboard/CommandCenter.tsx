import React from 'react';
import { FinancialOverviewWidget } from './FinancialOverviewWidget';
import { DemographicsWidget } from './DemographicsWidget';
import { StudioPulse } from './StudioPulse';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';
import { Badge } from '@/components/ui/badge';
import {
  Clapperboard, Users, Star, Zap,
  ChevronRight, DollarSign, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/engine/utils';
import { useShallow } from 'zustand/react/shallow';
import { SparklineChart } from '@/components/shared/SparklineChart';
import { ProgressIndicator } from '@/components/shared/ProgressIndicator';

export const CommandCenter: React.FC = () => {
  const gameState = useGameStore(useShallow((state) => state.gameState));

  if (!gameState || !gameState.studio || !gameState.industry) return null;

  const projects = Object.values(gameState.entities?.projects || {});
  const normalizedTalents = gameState.entities?.talents || {};
  const normalizedRivals = gameState.entities?.rivals || {};
  const newsHistory = gameState?.industry?.newsHistory ?? [];
  const finance = gameState.finance;

  const activeProjectsCount = projects.filter(p => p.state !== 'released' && p.state !== 'post_release' && p.state !== 'archived').length;
  const releasedProjectsCount = projects.filter(p => p.state === 'released' || p.state === 'post_release').length;
  const talentCount = Object.keys(normalizedTalents).length;
  const rivalCount = Object.keys(normalizedRivals).length;
  
  // Calculate cash trend
  const cashHistory = finance.weeklyHistory?.slice(-8).map(h => h.cash) || [];
  const cashTrend = cashHistory.length > 1 
    ? (cashHistory[cashHistory.length - 1] - cashHistory[0]) / Math.abs(cashHistory[0] || 1) * 100
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      {/* Studio Executive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6 relative">
        <div className="absolute -left-8 -top-8 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter uppercase bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
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
          <div className="px-5 py-2.5 bg-card/60 backdrop-blur-xl rounded-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col items-end transition-all duration-500 hover:border-white/30 hover:bg-card/80 hover:-translate-y-1 group">
            <span className="text-[9px] uppercase font-black text-muted-foreground/80 tracking-[0.25em] leading-none mb-1">Market Position</span>
            <span className="text-sm font-display font-black flex items-center gap-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent drop-shadow-md">
              <Zap className="h-3.5 w-3.5 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)_/_0.8)] group-hover:scale-110 transition-transform duration-300" />
              Tier {gameState.studio.prestige >= 80 ? '1' : gameState.studio.prestige >= 50 ? '2' : '3'} Studio
            </span>
          </div>
          <div className="px-5 py-2.5 bg-card/60 backdrop-blur-xl rounded-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col items-end transition-all duration-500 hover:border-white/30 hover:bg-card/80 hover:-translate-y-1">
            <span className="text-[9px] uppercase font-black text-muted-foreground/80 tracking-[0.25em] leading-none mb-1">Fiscal Year</span>
            <span className="text-sm font-display font-black text-white">{Math.floor(gameState.week / 52) + 1}</span>
          </div>
        </div>
      </div>

      {/* Studio Pulse Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StudioPulse />
        </div>
        
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard
            title="Cash Reserves"
            value={formatMoney(finance.cash)}
            subtitle="Available liquidity"
            icon={DollarSign}
            color={finance.cash > 100000000 ? 'success' : finance.cash > 50000000 ? 'primary' : 'warning'}
            trend={cashTrend > 5 ? 'up' : cashTrend < -5 ? 'down' : 'neutral'}
            trendValue={cashTrend !== 0 ? `${Math.abs(Math.round(cashTrend))}%` : undefined}
            size="md"
          >
            {cashHistory.length > 1 && (
              <SparklineChart 
                data={cashHistory} 
                width={200} 
                height={30}
                trend={cashTrend > 5 ? 'up' : cashTrend < -5 ? 'down' : 'neutral'}
              />
            )}
          </StatCard>
          
          <StatCard
            title="Active Pipeline"
            value={activeProjectsCount}
            subtitle={`${releasedProjectsCount} released to date`}
            icon={Clapperboard}
            color="primary"
            trend="up"
            size="md"
          />
          
          <StatCard
            title="Prestige Rating"
            value={gameState.studio.prestige}
            subtitle="Industry reputation"
            icon={Award}
            color="secondary"
            size="md"
          >
            <ProgressIndicator 
              value={gameState.studio.prestige} 
              max={100} 
              size="sm" 
              color="secondary"
              showValue={false}
            />
          </StatCard>
          
          <StatCard
            title="Talent Network"
            value={talentCount}
            subtitle={`vs ${rivalCount} rival studios`}
            icon={Users}
            color="info"
            size="md"
          />
        </div>
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

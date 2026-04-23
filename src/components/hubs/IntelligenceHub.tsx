import React, { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore, IntelligenceSubTab } from '@/store/uiStore';
import {
  selectRivals,
  selectActiveProjects,
  selectAwardsEligibleProjects,
  selectReleasedProjects,
} from '@/store/selectors';
import { SubNav } from '@/components/navigation/SubNav';
import {
  Building2,
  Trophy,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  ShieldAlert,
  Target,
  Monitor,
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/engine/utils';
import { m } from 'framer-motion';
import { GenreTrendsPanel } from './intelligence/GenreTrendsPanel';
import { AwardsTracker } from './intelligence/AwardsTracker';
import { RivalReleaseTracker } from './intelligence/RivalReleaseTracker';
import { KPIStatCard } from '@/components/shared/KPIStatCard';

// Rivals Panel
const RivalsPanel = () => {
  const gameState = useGameStore(s => s.gameState);
  const rivals = selectRivals(gameState);
  const releasedProjects = useMemo(() => selectReleasedProjects(gameState), [gameState]);

  const yourReleases = useMemo(() => releasedProjects
    .filter(p => p.releaseWeek != null)
    .map(p => ({ week: p.releaseWeek ?? 0, title: p.title }))
    .slice(-12), [releasedProjects]);

  const rivalReleases = useMemo(() => rivals.flatMap(r =>
    (r.projectIds || []).map(() => ({
      studioId: r.id,
      studioName: r.name,
      projectTitle: `${r.name} Project`,
      releaseDate: (gameState?.week || 1) + Math.floor(Math.random() * 12),
      genre: 'Drama',
      budgetTier: 'mid' as const,
      targetOverlap: Math.round(r.strength * 0.6),
      threatLevel: r.strength > 70 ? 'high' as const : r.strength > 40 ? 'medium' as const : 'low' as const,
      projectedOpening: r.cash * 0.05,
    }))
  ).slice(0, 10), [rivals, gameState?.week]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-20 pr-6 animate-in fade-in duration-700">
      <RivalReleaseTracker releases={rivalReleases} yourReleases={yourReleases} />
    </div>
  );
};

// Awards Panel
const AwardsPanel = () => {
  const gameState = useGameStore(s => s.gameState);
  const eligibleProjects = useMemo(() => {
    return selectAwardsEligibleProjects(gameState)
      .sort((a, b) => (b.reception?.metaScore || 0) - (a.reception?.metaScore || 0));
  }, [gameState]);

  const allAwards = useMemo(() => gameState?.industry?.awards || [], [gameState]);

  const awardsData = useMemo(() => eligibleProjects.map(p => {
    const projectAwards = allAwards.filter(a => a.projectId === p.id);
    const nominations = projectAwards.map(a => ({
      awardBody: a.body,
      category: a.category,
      nominationDate: gameState?.week || 1,
      ceremonyDate: (gameState?.week || 1) + 4,
      odds: a.status === 'won' ? 100 : 50,
      status: a.status === 'won' ? 'won' as const : 'nominated' as const,
      buzzBonus: 5,
    }));
    return {
      projectId: p.id,
      projectTitle: p.title,
      format: (p.format === 'tv' ? 'tv' : 'film'),
      nominations,
      wins: projectAwards.filter(a => a.status === 'won').length,
      totalNominations: nominations.length,
    };
  }), [eligibleProjects, allAwards, gameState?.week]);

  const totalWins = gameState?.studio?.internal?.projectHistory?.reduce((sum, p) => sum + (p.awards?.length || 0), 0) || 0;
  const totalNominations = awardsData.reduce((sum, p) => sum + p.totalNominations, 0);
  const studioRank = Math.max(1, Math.round(10 - (gameState?.studio?.prestige || 50) / 10));

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-20 pr-6 animate-in fade-in duration-700">
      <AwardsTracker
        projects={awardsData}
        studioRank={studioRank}
        totalWins={totalWins}
        totalNominations={totalNominations}
      />
    </div>
  );
};

// Market Trends Panel
const MarketPanel = () => {
  const gameState = useGameStore(s => s.gameState);
  const trends = useMemo(() => (gameState?.market?.trends || []).map(t => ({
    genre: t.genre,
    heat: t.heat,
    direction: t.direction as 'hot' | 'rising' | 'stable' | 'cooling' | 'dead',
    weeksRemaining: t.weeksRemaining,
  })), [gameState]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-20 pr-6 animate-in fade-in duration-700">
      <GenreTrendsPanel trends={trends} />
    </div>
  );
};

// Financials Panel
const FinancialsPanel = () => {
  const gameState = useGameStore(s => s.gameState);
  const cash = gameState?.finance?.cash ?? 0;
  const prestige = gameState?.studio?.prestige ?? 75;
  const weeklyHistory = gameState?.finance?.weeklyHistory || [];
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-12 pb-20 pr-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <KPIStatCard 
          label="LIQUID_CAPITAL" 
          value={formatMoney(cash)} 
          subValue="FISCAL_RESERVES"
          icon={DollarSign} 
          variant={cash > 10000000 ? 'secondary' : 'destructive'} 
        />
        <KPIStatCard 
          label="BRAND_PRESTIGE" 
          value={prestige.toString()} 
          subValue="INDUSTRY_STANDING"
          icon={Trophy} 
        />
        <KPIStatCard 
          label="MARKET_PULSE" 
          value={`${gameState?.finance?.marketState?.sentiment || 50}%`} 
          subValue={gameState?.finance?.marketState?.cycle?.toUpperCase() || 'STABLE'}
          icon={Activity} 
          variant="secondary"
        />
        <KPIStatCard 
          label="STUDIO_OUTPUT" 
          value={selectActiveProjects(gameState).length.toString()} 
          subValue="ACTIVE_SLATES"
          icon={BarChart3} 
        />
      </div>
      
      <div className="p-10 bg-white/[0.01] border border-white/5 rounded-none backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 mb-10 italic">FISCAL_FLOW_HISTORY</h4>
        <div className="h-64 flex items-end gap-3 px-4">
          {weeklyHistory.slice(-16).map((week, i) => {
            const maxCash = Math.max(...weeklyHistory.slice(-16).map(w => Math.abs(w.cash)), 1);
            const height = Math.max(10, (Math.abs(week.cash) / maxCash) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                <div 
                  className={cn(
                    "w-full rounded-none min-h-[4px] transition-all duration-1000 group-hover/bar:brightness-150",
                    week.cash >= 0 ? 'bg-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'bg-destructive/40 shadow-[0_0_15px_rgba(var(--destructive),0.2)]'
                  )}
                  style={{ height: `${height}%` }}
                />
                <span className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest italic">W{week.week % 52 || 52}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="p-10 bg-primary/5 border border-primary/20 rounded-none relative overflow-hidden shadow-2xl group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <ShieldAlert className="h-24 w-24 text-primary" strokeWidth={1} />
        </div>
        <div className="flex items-start gap-8 relative z-10">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-none shadow-[0_0_15px_rgba(var(--primary),0.1)]">
             <ShieldAlert className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-4">
            <h5 className="text-sm font-black uppercase tracking-[0.3em] text-primary italic leading-none">STRATEGIC_ADVISORY</h5>
            <p className="text-xs text-muted-foreground/60 italic uppercase tracking-wider leading-relaxed border-l-2 border-primary/20 pl-6 py-2 max-w-3xl">
              INTELLIGENCE SUGGESTS M&A ACTIVITY IS COOLING AS MACRO CONDITIONS STABILIZE. 
              EXECUTIVE PRIORITY SHOULD SHIFT TOWARD SECURING RISING TALENT AGENCIES BEFORE THE NEXT FISCAL CYCLE.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const IntelligenceHub: React.FC = () => {
  const { activeSubTab, setActiveSubTab } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  
  // Calculate badge counts
  const badgeCounts = useMemo(() => {
    const rivals = selectRivals(gameState).length;
    const eligibleAwards = selectAwardsEligibleProjects(gameState).length;
    const marketEvents = gameState?.market?.activeMarketEvents?.length || 0;
    
    return {
      rivals: rivals > 0 ? rivals : null,
      awards: eligibleAwards > 0 ? eligibleAwards : null,
      market: marketEvents > 0 ? marketEvents : null,
      financials: gameState?.finance?.cash && gameState.finance.cash < 50000000 ? 1 : null,
    };
  }, [gameState]);
  
  const tabs = [
    { 
      id: 'rivals', 
      label: 'RIVALS', 
      icon: <Building2 className="h-3.5 w-3.5" />,
      badge: badgeCounts.rivals,
      description: 'Competitor analysis and M&A activity'
    },
    { 
      id: 'awards', 
      label: 'AWARDS', 
      icon: <Trophy className="h-3.5 w-3.5" />,
      badge: badgeCounts.awards,
      description: 'FYC campaigns and eligible projects'
    },
    { 
      id: 'market', 
      label: 'MARKET', 
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      badge: badgeCounts.market,
      description: 'Genre trends and audience analysis'
    },
    { 
      id: 'financials', 
      label: 'FINANCIALS', 
      icon: <DollarSign className="h-3.5 w-3.5" />,
      badge: badgeCounts.financials,
      description: 'P&L, revenue, and cash flow'
    },
  ];
  
  const getHeaderContent = () => {
    switch (activeSubTab) {
      case 'rivals':
        return {
          icon: <Building2 className="h-8 w-8 text-destructive" />,
          title: 'STRATEGIC INTELLIGENCE',
          subtitle: 'RIVAL POSITIONING • M&A ACTIVITY • MARKET THREATS'
        };
      case 'awards':
        return {
          icon: <Trophy className="h-8 w-8 text-amber-500" />,
          title: 'ACADEMY HEADQUARTERS',
          subtitle: 'FYC STRATEGY • INDUSTRY CEREMONIES • PRESTIGE AUDIT'
        };
      case 'market':
        return {
          icon: <TrendingUp className="h-8 w-8 text-primary" />,
          title: 'MACRO MARKET ANALYSIS',
          subtitle: 'GENRE VECTORS • AUDIENCE SATURATION • SECTOR HEALTH'
        };
      case 'financials':
        return {
          icon: <DollarSign className="h-8 w-8 text-secondary" />,
          title: 'FISCAL SURVEILLANCE',
          subtitle: 'LIQUIDITY MATRIX • REVENUE PERFORMANCE • CASH PROJECTION'
        };
      default:
        return { icon: null, title: '', subtitle: '' };
    }
  };
  
  const header = getHeaderContent();
  
  return (
    <m.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-1000"
    >
      {/* Executive Header */}
      <div className="flex items-center gap-8 mb-10 bg-white/[0.02] p-10 rounded-none border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] -mr-32 -mt-32" />
        <div className="w-16 h-16 rounded-none bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative z-10">
          {header.icon}
        </div>
        <div className="relative z-10">
          <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none mb-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">{header.title}</h2>
          <p className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.4em] italic">
            {header.subtitle}
          </p>
        </div>
      </div>
      
      {/* Sub Navigation */}
      <div className="flex-1 flex flex-col min-h-0">
        <SubNav 
          tabs={tabs}
          activeTab={activeSubTab}
          onChange={(id) => setActiveSubTab(id as IntelligenceSubTab)}
          variant="pills"
        />
        
        {/* Content */}
        <div className="flex-1 min-h-0 mt-10">
          <React.Suspense fallback={<div className="flex items-center justify-center h-64 font-display font-black uppercase tracking-[0.5em] italic text-muted-foreground/10 animate-pulse">INITIALIZING SURVEILLANCE...</div>}>
            {activeSubTab === 'rivals' && <RivalsPanel />}
            {activeSubTab === 'awards' && <AwardsPanel />}
            {activeSubTab === 'market' && <MarketPanel />}
            {activeSubTab === 'financials' && <FinancialsPanel />}
          </React.Suspense>
        </div>
      </div>
    </m.div>
  );
};

export default IntelligenceHub;

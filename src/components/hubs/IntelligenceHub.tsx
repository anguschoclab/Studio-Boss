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
  Monitor
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
    <div className="h-full overflow-y-auto custom-scrollbar pb-4 pr-4">
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
    <div className="h-full overflow-y-auto custom-scrollbar pb-4 pr-4">
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
    <div className="h-full overflow-y-auto custom-scrollbar pb-4 pr-4">
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
    <div className="h-full overflow-y-auto custom-scrollbar space-y-10 pb-4 pr-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPIStatCard 
          label="Liquid Capital" 
          value={formatMoney(cash)} 
          subValue="Fiscal Reserves"
          icon={DollarSign} 
          variant={cash > 10000000 ? 'secondary' : 'destructive'} 
        />
        <KPIStatCard 
          label="Brand Prestige" 
          value={prestige.toString()} 
          subValue="Industry Standing"
          icon={Trophy} 
        />
        <KPIStatCard 
          label="Market Pulse" 
          value={`${gameState?.finance?.marketState?.sentiment || 50}%`} 
          subValue={gameState?.finance?.marketState?.cycle || 'STABLE'}
          icon={Activity} 
          variant="secondary"
        />
        <KPIStatCard 
          label="Studio Output" 
          value={selectActiveProjects(gameState).length.toString()} 
          subValue="Active Slates"
          icon={BarChart3} 
        />
      </div>
      
      <div className="p-8 glass-card border-white/5 bg-white/[0.01]">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-8">Fiscal Flow History</h4>
        <div className="h-48 flex items-end gap-3">
          {weeklyHistory.slice(-16).map((week, i) => {
            const maxCash = Math.max(...weeklyHistory.slice(-16).map(w => Math.abs(w.cash)), 1);
            const height = Math.max(10, (Math.abs(week.cash) / maxCash) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className={cn(
                    "w-full rounded-none min-h-[4px] transition-all duration-1000",
                    week.cash >= 0 ? 'bg-primary/40 shadow-[0_0_10px_rgba(var(--primary),0.2)]' : 'bg-destructive/40 shadow-[0_0_10px_rgba(var(--destructive),0.2)]'
                  )}
                  style={{ height: `${height}%` }}
                />
                <span className="text-[8px] font-black text-muted-foreground/30">W{week.week % 52 || 52}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="p-6 bg-primary/5 border border-primary/20 rounded-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <ShieldAlert className="h-16 w-16 text-primary" />
        </div>
        <div className="flex items-start gap-4 relative z-10">
          <ShieldAlert className="h-5 w-5 text-primary shrink-0" />
          <div className="space-y-2">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Strategic Advisory</h5>
            <p className="text-[11px] text-muted-foreground/60 italic leading-relaxed border-l border-primary/20 pl-4 py-1 max-w-2xl">
              Intelligence suggests M&A activity is cooling as macro conditions stabilize. 
              Executive priority should shift toward securing rising talent agencies before the next fiscal cycle.
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
      label: 'Rivals', 
      icon: <Building2 className="h-3.5 w-3.5" />,
      badge: badgeCounts.rivals,
      description: 'Competitor analysis and M&A activity'
    },
    { 
      id: 'awards', 
      label: 'Awards', 
      icon: <Trophy className="h-3.5 w-3.5" />,
      badge: badgeCounts.awards,
      description: 'FYC campaigns and eligible projects'
    },
    { 
      id: 'market', 
      label: 'Market', 
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      badge: badgeCounts.market,
      description: 'Genre trends and audience analysis'
    },
    { 
      id: 'financials', 
      label: 'Financials', 
      icon: <DollarSign className="h-3.5 w-3.5" />,
      badge: badgeCounts.financials,
      description: 'P&L, revenue, and cash flow'
    },
  ];
  
  const getHeaderContent = () => {
    switch (activeSubTab) {
      case 'rivals':
        return {
          icon: <Building2 className="h-6 w-6 text-destructive" />,
          title: 'Strategic Intelligence',
          subtitle: 'Rival Positioning • M&A activity • Market Threats'
        };
      case 'awards':
        return {
          icon: <Trophy className="h-6 w-6 text-amber-500" />,
          title: 'Academy Headquarters',
          subtitle: 'FYC Strategy • Industry Ceremonies • Prestige Audit'
        };
      case 'market':
        return {
          icon: <TrendingUp className="h-6 w-6 text-primary" />,
          title: 'Macro Market Analysis',
          subtitle: 'Genre Vectors • Audience Saturation • Sector Health'
        };
      case 'financials':
        return {
          icon: <DollarSign className="h-6 w-6 text-secondary" />,
          title: 'Fiscal Surveillance',
          subtitle: 'Liquidity Matrix • Revenue Performance • Cash Projection'
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
      className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-6 border-b border-white/5 pb-8">
        <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
          {header.icon}
        </div>
        <div>
          <h2 className="text-4xl font-display font-black tracking-tighter uppercase italic leading-none mb-1">{header.title}</h2>
          <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.25em]">
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
        <div className="flex-1 min-h-0 mt-8">
          <React.Suspense fallback={<div className="flex items-center justify-center h-64 font-display font-black uppercase tracking-widest text-muted-foreground/20 italic">Initializing Surveillance...</div>}>
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

export default IntelligenceHub;

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
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Trophy,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/engine/utils';
import { m } from 'framer-motion';
import { GenreTrendsPanel } from './intelligence/GenreTrendsPanel';
import { AwardsTracker } from './intelligence/AwardsTracker';
import { RivalReleaseTracker } from './intelligence/RivalReleaseTracker';

// Rivals Panel
const RivalsPanel = () => {
  const gameState = useGameStore(s => s.gameState);
  const rivals = selectRivals(gameState);
  const releasedProjects = useMemo(() => selectReleasedProjects(gameState), [gameState]);

  const yourReleases = useMemo(() => releasedProjects
    .filter(p => p.releaseWeek != null)
    .map(p => ({ week: p.releaseWeek!, title: p.title }))
    .slice(-12), [releasedProjects]);

  const rivalReleases = useMemo(() => rivals.flatMap(r =>
    (r.projectIds || []).map(pid => ({
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
    <div className="h-full overflow-y-auto custom-scrollbar pb-4">
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
      format: (p.format === 'tv' ? 'tv' : 'film') as 'film' | 'tv',
      nominations,
      wins: projectAwards.filter(a => a.status === 'won').length,
      totalNominations: nominations.length,
    };
  }), [eligibleProjects, allAwards, gameState?.week]);

  const totalWins = gameState?.studio?.internal?.projectHistory?.reduce((sum, p) => sum + (p.awards?.length || 0), 0) || 0;
  const totalNominations = awardsData.reduce((sum, p) => sum + p.totalNominations, 0);
  const studioRank = Math.max(1, Math.round(10 - (gameState?.studio?.prestige || 50) / 10));

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-4">
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
    <div className="h-full overflow-y-auto custom-scrollbar pb-4">
      <GenreTrendsPanel trends={trends} />
    </div>
  );
};

// Financials Panel (simplified from FinancePanel)
const FinancialsPanel = () => {
  const gameState = useGameStore(s => s.gameState);
  const cash = gameState?.finance?.cash ?? 0;
  const prestige = gameState?.studio?.prestige ?? 75;
  const weeklyHistory = gameState?.finance?.weeklyHistory || [];
  
  const stats = [
    { label: 'Cash Reserves', value: formatMoney(cash), icon: DollarSign, color: cash > 0 ? 'text-emerald-400' : 'text-destructive' },
    { label: 'Prestige', value: prestige.toString(), icon: Trophy, color: 'text-amber-400' },
    { label: 'Market Sentiment', value: `${gameState?.finance?.marketState?.sentiment || 50}%`, icon: Activity, color: 'text-primary' },
    { label: 'Active Projects', value: selectActiveProjects(gameState).length.toString(), icon: BarChart3, color: 'text-secondary' },
  ];
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-6 pb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="p-4 bg-card/40 border border-border/40 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={cn("h-5 w-5", stat.color)} />
              <span className="text-[9px] uppercase font-black text-muted-foreground tracking-wider">{stat.label}</span>
            </div>
            <div className={cn("text-2xl font-black font-mono", stat.color)}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 bg-card/40 border border-border/40 rounded-xl">
        <h4 className="text-sm font-black uppercase tracking-wider mb-4">Cash Flow History</h4>
        <div className="h-48 flex items-end gap-2">
          {weeklyHistory.slice(-12).map((week, i) => {
            const maxCash = Math.max(...weeklyHistory.slice(-12).map(w => Math.abs(w.cash)), 1);
            const height = Math.max(10, (Math.abs(week.cash) / maxCash) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className={cn(
                    "w-full rounded-t-sm min-h-[4px]",
                    week.cash >= 0 ? 'bg-primary/60' : 'bg-destructive/60'
                  )}
                  style={{ height: `${height}%` }}
                />
                <span className="text-[8px] text-muted-foreground">W{week.week % 52 || 52}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-bold text-primary">Market Pulse</h5>
            <p className="text-xs text-muted-foreground mt-1">
              Industry insiders suggest major M&A activity is cooling off as interest rates stabilize. 
              Focus on building relationships with rising talent agencies.
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
          title: 'Competitive Intelligence',
          subtitle: 'Rival studios, M&A activity, and market positioning'
        };
      case 'awards':
        return {
          icon: <Trophy className="h-6 w-6 text-amber-500" />,
          title: 'Awards HQ',
          subtitle: 'FYC campaigns and industry ceremonies'
        };
      case 'market':
        return {
          icon: <TrendingUp className="h-6 w-6 text-primary" />,
          title: 'Market Analysis',
          subtitle: 'Genre trends, audience demographics, and saturation'
        };
      case 'financials':
        return {
          icon: <DollarSign className="h-6 w-6 text-emerald-400" />,
          title: 'Financial Intelligence',
          subtitle: 'P&L, revenue streams, and cash flow forecasts'
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
      className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 bg-gradient-to-r from-white/5 to-transparent p-5 rounded-xl border border-white/5">
        <div className="w-12 h-12 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center shadow-[0_0_15px_hsl(var(--destructive)/0.2)]">
          {header.icon}
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">{header.title}</h2>
          <p className="text-[11px] font-black uppercase text-muted-foreground/60 tracking-[0.2em] mt-1">
            {header.subtitle}
          </p>
        </div>
      </div>
      
      {/* Sub Navigation */}
      <div className="mb-4">
        <SubNav 
          tabs={tabs}
          activeTab={activeSubTab}
          onChange={(id) => setActiveSubTab(id as IntelligenceSubTab)}
          variant="pills"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
          {activeSubTab === 'rivals' && <RivalsPanel />}
          {activeSubTab === 'awards' && <AwardsPanel />}
          {activeSubTab === 'market' && <MarketPanel />}
          {activeSubTab === 'financials' && <FinancialsPanel />}
        </React.Suspense>
      </div>
    </m.div>
  );
};

export default IntelligenceHub;

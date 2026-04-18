import React, { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore, IntelligenceSubTab } from '@/store/uiStore';
import {
  selectRivals,
  selectActiveProjects,
  selectAwardsEligibleProjects
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
  Brain,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/engine/utils';
import { m } from 'framer-motion';

// Lazy load the heavy components
const TrendBoard = React.lazy(() => import('@/components/trends/TrendBoard').then(m => ({ default: m.TrendBoard })));

// Rivals Panel (simplified from IndustryPage)
const RivalsPanel = () => {
  const gameState = useGameStore(s => s.gameState);
  const rivals = selectRivals(gameState);
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-4 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rivals.map(rival => (
          <div 
            key={rival.id}
            className="p-4 bg-card/40 border border-border/40 rounded-xl hover:border-destructive/30 transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-sm">{rival.name}</h4>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  {rival.archetype}
                </p>
              </div>
              <Badge variant="outline" className="text-[9px] font-mono">
                PWR {rival.strength}%
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                <Brain className="h-3 w-3" />
                <span className="capitalize">{rival.currentMotivation?.replace('_', ' ') || 'Unknown'}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Cash:</span>
                <span className="font-mono font-bold">{formatMoney(rival.cash)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Projects:</span>
                <span className="font-mono font-bold">{rival.projectIds?.length || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Awards Panel (simplified from AwardsHQ)
const AwardsPanel = () => {
  const gameState = useGameStore(s => s.gameState);
  const eligibleProjects = useMemo(() => {
    return selectAwardsEligibleProjects(gameState)
      .sort((a, b) => (b.reception?.metaScore || 0) - (a.reception?.metaScore || 0));
  }, [gameState]);
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-4 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {eligibleProjects.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed border-border/40 rounded-xl">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              No eligible projects
            </p>
          </div>
        ) : (
          eligibleProjects.map(project => (
            <div 
              key={project.id}
              className="p-4 bg-card/40 border border-border/40 rounded-xl hover:border-primary/30 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-sm">{project.title}</h4>
                  <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                    {project.genre} • Released W{project.releaseWeek}
                  </p>
                </div>
                <div className={cn(
                  "text-2xl font-black italic",
                  (project.reception?.metaScore || 0) >= 75 ? 'text-emerald-500' :
                  (project.reception?.metaScore || 0) >= 40 ? 'text-amber-500' : 'text-rose-500'
                )}>
                  {project.reception?.metaScore || '??'}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="text-[9px]">
                  <Activity className="h-3 w-3 mr-1" />
                  {project.reception?.metaScore && project.reception.metaScore >= 75 ? 'Award Contender' : 'Eligible'}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Market Trends Panel
const MarketPanel = () => {
  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Drama', 'Comedy', 'Action', 'Sci-Fi', 'Horror', 'Romance'].map((genre, i) => (
          <div key={genre} className="p-4 bg-card/40 border border-border/40 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black uppercase tracking-wider">{genre}</span>
              <Badge variant={i < 3 ? 'default' : 'secondary'} className="text-[9px]">
                {i < 2 ? 'Hot' : i < 4 ? 'Stable' : 'Cooling'}
              </Badge>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
                  i < 2 ? 'bg-primary' : i < 4 ? 'bg-secondary' : 'bg-muted-foreground/30'
                )}
                style={{ width: `${Math.max(30, 90 - i * 10)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex-1 bg-card/20 border border-border/20 rounded-xl p-6">
        <React.Suspense fallback={<div>Loading trends...</div>}>
          <TrendBoard />
        </React.Suspense>
      </div>
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

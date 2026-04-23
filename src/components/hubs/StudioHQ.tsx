import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore, HQSubTab } from '@/store/uiStore';
import { useShallow } from 'zustand/react/shallow';
import { SubNav } from '@/components/navigation/SubNav';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  AlertTriangle,
  Target,
  Newspaper,
  Megaphone,
  Zap,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/engine/utils';
import { m } from 'framer-motion';
import { StrategyPanel } from './StrategyPanel';
import { BuzzMeter } from './hq/BuzzMeter';
import { MarketingWarRoom } from './hq/MarketingWarRoom';

// Lazy load heavy components
const ExecutiveDashboard = React.lazy(() => import('@/components/hubs/ExecutiveDashboard').then(m => ({ default: m.ExecutiveDashboard })));
const CrisisTriageDashboard = React.lazy(() => import('@/components/hubs/CrisisTriageDashboard').then(m => ({ default: m.CrisisTriageDashboard })));
const NewsFeed = React.lazy(() => import('@/components/news/NewsFeed').then(m => ({ default: m.NewsFeed })));

const MarketingPanel = () => {
  const gameState = useGameStore(useShallow(s => s.gameState));
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);

  const activeProjects = React.useMemo(() => {
    return Object.values(gameState?.entities?.projects || {})
      .filter(p => p.state === 'production' || p.state === 'development' || p.state === 'released')
      .slice(0, 10);
  }, [gameState]);

  const projectBuzzData = React.useMemo(() => activeProjects.map(p => ({
    projectId: p.id,
    projectTitle: p.title,
    totalBuzz: p.buzz || 0,
    trend: (p.momentum || 50) > 55 ? 'rising' as const : (p.momentum || 50) < 45 ? 'falling' as const : 'stable' as const,
    sources: [] as any[],
    audienceSentiment: (p.buzz || 0) > 60 ? 'positive' as const : (p.buzz || 0) > 30 ? 'mixed' as const : 'negative' as const,
    pressCoverage: Math.round((p.buzz || 0) * 0.3),
  })), [activeProjects]);

  const studioBuzz = React.useMemo(() => {
    if (activeProjects.length === 0) return 0;
    return Math.round(activeProjects.reduce((sum, p) => sum + (p.buzz || 0), 0) / activeProjects.length);
  }, [activeProjects]);

  const currentProject = selectedProjectId
    ? activeProjects.find(p => p.id === selectedProjectId)
    : activeProjects[0];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-10 pb-20 pr-6 animate-in fade-in duration-700">
      <BuzzMeter
        projects={projectBuzzData}
        studioBuzz={studioBuzz}
        industryRank={Math.max(1, Math.round(10 - (gameState?.studio?.prestige || 50) / 10))}
      />
      {activeProjects.length > 0 && (
        <div className="pt-10 border-t border-white/5">
          <div className="flex items-center gap-6 mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic">SELECT_PROJECT_MODULE</span>
            <select
              className="text-[10px] font-black uppercase tracking-widest italic bg-black/40 border border-white/10 rounded-none px-6 py-2 focus:outline-none focus:border-primary/40 transition-all duration-700"
              value={selectedProjectId || activeProjects[0]?.id || ''}
              onChange={e => setSelectedProjectId(e.target.value)}
            >
              {activeProjects.map(p => (
                <option key={p.id} value={p.id}>{p.title.toUpperCase()}</option>
              ))}
            </select>
          </div>
          {currentProject && (
            <MarketingWarRoom projectId={currentProject.id} />
          )}
        </div>
      )}
    </div>
  );
};

const NewsPanel = () => {
  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      <div className="flex items-center gap-4 mb-8">
        <Newspaper className="h-5 w-5 text-primary" strokeWidth={3} />
        <h3 className="text-sm font-black uppercase tracking-[0.3em] italic">INDUSTRY_INTELLIGENCE_FEED</h3>
        <Badge className="text-[9px] bg-primary text-black px-4 py-1 rounded-none font-black uppercase italic tracking-widest border-none shadow-[0_0_15px_rgba(var(--primary),0.2)]">
          LIVE_WIRE
        </Badge>
      </div>
      <div className="flex-1 bg-white/[0.01] rounded-none border border-white/5 overflow-hidden backdrop-blur-3xl shadow-2xl">
        <React.Suspense fallback={<div className="p-20 text-center font-display font-black text-muted-foreground/10 uppercase tracking-[0.5em] italic animate-pulse">INITIALIZING_FEED...</div>}>
          <NewsFeed />
        </React.Suspense>
      </div>
    </div>
  );
};


export const StudioHQ: React.FC = () => {
  const { activeSubTab, setActiveSubTab } = useUIStore();
  const gameState = useGameStore(useShallow(s => s.gameState));

  const projects = Object.values(gameState?.entities?.projects || {});

  // Calculate badge counts
  const badgeCounts = React.useMemo(() => {
    if (!gameState) {
      return {
        overview: null,
        operations: null,
        strategy: null,
        news: null,
        marketing: null,
      };
    }
    const needsAttention = projects.filter(p => {
      const isOverBudget = (p.accumulatedCost || 0) > (p.budget || 0) * 1.2;
      const isTroubled = p.state === 'turnaround' || p.state === 'needs_greenlight';
      const hasCrisis = p.activeCrisis && !p.activeCrisis.resolved;
      return (isOverBudget || isTroubled || hasCrisis) &&
             p.state !== 'released' && p.state !== 'archived';
    }).length;

    const newsCount = gameState.industry?.newsHistory?.length || 0;

    return {
      overview: null,
      operations: needsAttention > 0 ? needsAttention : null,
      strategy: null,
      news: newsCount > 0 ? Math.min(newsCount, 9) : null,
      marketing: null,
    };
  }, [projects, gameState]);

  if (!gameState) return null;

  const tabs = [
    { 
      id: 'overview', 
      label: 'OVERVIEW', 
      icon: <LayoutDashboard className="h-3.5 w-3.5" />,
      badge: badgeCounts.overview,
      description: 'Studio pulse and key metrics'
    },
    { 
      id: 'operations', 
      label: 'OPERATIONS', 
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      badge: badgeCounts.operations,
      description: 'Alerts and actionable items'
    },
    { 
      id: 'strategy', 
      label: 'STRATEGY', 
      icon: <Target className="h-3.5 w-3.5" />,
      badge: badgeCounts.strategy,
      description: 'Long-term goals and milestones'
    },
    { 
      id: 'news', 
      label: 'NEWS', 
      icon: <Newspaper className="h-3.5 w-3.5" />,
      badge: badgeCounts.news,
      description: 'Industry intelligence feed'
    },
    {
      id: 'marketing',
      label: 'MARKETING',
      icon: <Megaphone className="h-3.5 w-3.5" />,
      badge: badgeCounts.marketing,
      description: 'Campaign management and buzz tracking'
    },
  ];
  
  const getHeaderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return {
          icon: <LayoutDashboard className="h-8 w-8 text-primary" />,
          title: (gameState.studio?.name || 'STUDIO_HQ').toUpperCase(),
          subtitle: 'EXECUTIVE DASHBOARD AND STUDIO PULSE'
        };
      case 'operations':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
          title: 'OPERATIONS CENTER',
          subtitle: 'ALERTS, CRISES, AND ACTION ITEMS'
        };
      case 'strategy':
        return {
          icon: <Target className="h-8 w-8 text-secondary" />,
          title: 'STRATEGIC PLANNING',
          subtitle: 'GOALS, MILESTONES, AND RECOMMENDATIONS'
        };
      case 'news':
        return {
          icon: <Newspaper className="h-8 w-8 text-primary" />,
          title: 'INDUSTRY NEWS',
          subtitle: 'GLOBAL ENTERTAINMENT INTELLIGENCE'
        };
      case 'marketing':
        return {
          icon: <Megaphone className="h-8 w-8 text-primary" />,
          title: 'MARKETING WAR ROOM',
          subtitle: 'CAMPAIGN MANAGEMENT, BUZZ, AND AUDIENCE TARGETING'
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/[0.02] p-10 rounded-none border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] -mr-32 -mt-32" />
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-16 h-16 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center shadow-2xl">
            {header.icon}
          </div>
          <div>
            <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none mb-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {header.title}
            </h2>
            <p className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.4em] italic">
              {header.subtitle}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 relative z-10">
          <div className="px-6 py-4 bg-black/40 backdrop-blur-3xl rounded-none border border-white/10 shadow-2xl group hover:border-primary/20 transition-all duration-700">
            <span className="text-[9px] uppercase font-black text-muted-foreground/20 tracking-[0.2em] italic mb-1 block">LIQUID_CAPITAL</span>
            <p className={cn(
              "text-lg font-display font-black italic tracking-tight leading-none",
              gameState.finance?.cash && gameState.finance.cash < 0 ? "text-red-500" : "text-primary"
            )}>
              {formatMoney(gameState.finance?.cash || 0)}
            </p>
          </div>
          <div className="px-6 py-4 bg-black/40 backdrop-blur-3xl rounded-none border border-white/10 shadow-2xl group hover:border-secondary/20 transition-all duration-700">
            <span className="text-[9px] uppercase font-black text-muted-foreground/20 tracking-[0.2em] italic mb-1 block">STUDIO_PRESTIGE</span>
            <p className="text-lg font-display font-black text-secondary italic tracking-tight leading-none">
              {gameState.studio?.prestige || 0}
            </p>
          </div>
          <div className="px-6 py-4 bg-black/40 backdrop-blur-3xl rounded-none border border-white/10 shadow-2xl group hover:border-white/20 transition-all duration-700">
            <span className="text-[9px] uppercase font-black text-muted-foreground/20 tracking-[0.2em] italic mb-1 block">ACTIVE_SLATES</span>
            <p className="text-lg font-display font-black text-foreground italic tracking-tight leading-none">
              {projects.filter(p => p.state !== 'released' && p.state !== 'archived').length}
            </p>
          </div>
        </div>
      </div>
      
      {/* Sub Navigation */}
      <div className="mb-10">
        <SubNav 
          tabs={tabs}
          activeTab={activeSubTab}
          onChange={(id) => setActiveSubTab(id as HQSubTab)}
          variant="pills"
        />
      </div>
      
      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <React.Suspense fallback={<div className="flex items-center justify-center h-64 font-display font-black text-muted-foreground/10 uppercase tracking-[0.5em] italic animate-pulse">INITIALIZING_MODULE...</div>}>
          {activeSubTab === 'overview' && <ExecutiveDashboard />}
          {activeSubTab === 'operations' && <CrisisTriageDashboard />}
          {activeSubTab === 'strategy' && <StrategyPanel />}
          {activeSubTab === 'news' && <NewsPanel />}
          {activeSubTab === 'marketing' && <MarketingPanel />}
        </React.Suspense>
      </div>
    </m.div>
  );
};

export default StudioHQ;

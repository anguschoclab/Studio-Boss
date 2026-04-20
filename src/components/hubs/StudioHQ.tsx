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
  Megaphone
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
    sources: [] as { id: string; type: string; impact: number; duration: number }[],
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
    <div className="h-full overflow-y-auto custom-scrollbar space-y-6 pb-4">
      <BuzzMeter
        projects={projectBuzzData}
        studioBuzz={studioBuzz}
        industryRank={Math.max(1, Math.round(10 - (gameState?.studio?.prestige || 50) / 10))}
      />
      {activeProjects.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Select Project</span>
            <select
              className="text-xs bg-card/60 border border-border rounded px-2 py-1"
              value={selectedProjectId || activeProjects[0]?.id || ''}
              onChange={e => setSelectedProjectId(e.target.value)}
            >
              {activeProjects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
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
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-black uppercase tracking-wider">Industry News Feed</h3>
        <Badge variant="outline" className="text-[9px] bg-primary/10 border-primary/20 text-primary">
          Live Wire
        </Badge>
      </div>
      <div className="flex-1 bg-black/20 rounded-xl border border-white/5 overflow-hidden">
        <React.Suspense fallback={<div className="p-8 text-center">Loading news...</div>}>
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
      label: 'Overview', 
      icon: <LayoutDashboard className="h-3.5 w-3.5" />,
      badge: badgeCounts.overview,
      description: 'Studio pulse and key metrics'
    },
    { 
      id: 'operations', 
      label: 'Operations', 
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      badge: badgeCounts.operations,
      description: 'Alerts and actionable items'
    },
    { 
      id: 'strategy', 
      label: 'Strategy', 
      icon: <Target className="h-3.5 w-3.5" />,
      badge: badgeCounts.strategy,
      description: 'Long-term goals and milestones'
    },
    { 
      id: 'news', 
      label: 'News', 
      icon: <Newspaper className="h-3.5 w-3.5" />,
      badge: badgeCounts.news,
      description: 'Industry intelligence feed'
    },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: <Megaphone className="h-3.5 w-3.5" />,
      badge: badgeCounts.marketing,
      description: 'Campaign management and buzz tracking'
    },
  ];
  
  const getHeaderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return {
          icon: <LayoutDashboard className="h-6 w-6 text-primary" />,
          title: gameState.studio?.name || 'Studio HQ',
          subtitle: 'Executive dashboard and studio pulse'
        };
      case 'operations':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
          title: 'Operations Center',
          subtitle: 'Alerts, crises, and action items'
        };
      case 'strategy':
        return {
          icon: <Target className="h-6 w-6 text-secondary" />,
          title: 'Strategic Planning',
          subtitle: 'Goals, milestones, and recommendations'
        };
      case 'news':
        return {
          icon: <Newspaper className="h-6 w-6 text-primary" />,
          title: 'Industry News',
          subtitle: 'Global entertainment intelligence'
        };
      case 'marketing':
        return {
          icon: <Megaphone className="h-6 w-6 text-primary" />,
          title: 'Marketing War Room',
          subtitle: 'Campaign management, buzz, and audience targeting'
        };
      default:
        return { icon: null, title: '', subtitle: '' };
    }
  };
  
  const header = getHeaderContent();
  
  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
            {header.icon}
          </div>
          <div>
            <h2 className="text-3xl font-display font-black tracking-tighter uppercase">
              {header.title}
            </h2>
            <p className="text-[11px] font-black uppercase text-muted-foreground/60 tracking-[0.2em] mt-1">
              {header.subtitle}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2 bg-card/60 backdrop-blur-xl rounded-lg border border-white/10">
            <span className="text-[9px] uppercase font-black text-muted-foreground/80 tracking-wider">Cash</span>
            <p className={cn(
              "text-sm font-display font-black font-mono",
              gameState.finance?.cash && gameState.finance.cash < 0 ? "text-destructive" : "text-emerald-400"
            )}>
              {formatMoney(gameState.finance?.cash || 0)}
            </p>
          </div>
          <div className="px-4 py-2 bg-card/60 backdrop-blur-xl rounded-lg border border-white/10">
            <span className="text-[9px] uppercase font-black text-muted-foreground/80 tracking-wider">Prestige</span>
            <p className="text-sm font-display font-black text-secondary">
              {gameState.studio?.prestige || 0}
            </p>
          </div>
          <div className="px-4 py-2 bg-card/60 backdrop-blur-xl rounded-lg border border-white/10">
            <span className="text-[9px] uppercase font-black text-muted-foreground/80 tracking-wider">Projects</span>
            <p className="text-sm font-display font-black">
              {projects.filter(p => p.state !== 'released' && p.state !== 'archived').length}
            </p>
          </div>
        </div>
      </div>
      
      {/* Sub Navigation */}
      <div className="mb-6">
        <SubNav 
          tabs={tabs}
          activeTab={activeSubTab}
          onChange={(id) => setActiveSubTab(id as HQSubTab)}
          variant="pills"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
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

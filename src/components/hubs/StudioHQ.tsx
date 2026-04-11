import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore, HQSubTab } from '@/store/uiStore';
import { useShallow } from 'zustand/react/shallow';
import { SubNav } from '@/components/navigation/SubNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/shared/StatCard';
import { 
  LayoutDashboard, 
  AlertTriangle,
  Target,
  Newspaper,
  Zap,
  Star,
  Clapperboard,
  DollarSign,
  Users,
  ChevronRight,
  Plus,
  TrendingUp,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/engine/utils';
import { m } from 'framer-motion';

// Lazy load heavy components
const CommandCenter = React.lazy(() => import('@/components/dashboard/CommandCenter').then(m => ({ default: m.CommandCenter })));
const NewsFeed = React.lazy(() => import('@/components/news/NewsFeed').then(m => ({ default: m.NewsFeed })));

// Operations Panel - Alerts and Actionable Items
const OperationsPanel = () => {
  const gameState = useGameStore(s => s.gameState);
  const { openCreateProject, setActiveHub, setActiveSubTab } = useUIStore();
  
  const projects = Object.values(gameState?.entities?.projects || {});
  const needsAttention = projects.filter(p => {
    const isOverBudget = (p.accumulatedCost || 0) > (p.budget || 0) * 1.2;
    const isTroubled = p.state === 'turnaround' || p.state === 'needs_greenlight';
    const hasCrisis = p.activeCrisis && !p.activeCrisis.resolved;
    return (isOverBudget || isTroubled || hasCrisis) && 
           p.state !== 'released' && p.state !== 'archived';
  });
  
  const needsGreenlight = projects.filter(p => p.state === 'needs_greenlight');
  
  const alerts = [
    ...needsAttention.map(p => ({
      type: p.activeCrisis ? 'crisis' : p.state === 'needs_greenlight' ? 'greenlight' : 'warning',
      project: p,
      message: p.activeCrisis ? `Crisis: ${p.activeCrisis.description}` :
               p.state === 'needs_greenlight' ? 'Ready for greenlight decision' :
               'Over budget - review required',
      action: p.state === 'needs_greenlight' ? 'Review' : 'View',
      onClick: () => {
        if (p.state === 'needs_greenlight') {
          setActiveHub('production', 'slate');
        }
      }
    })),
  ];
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-4 pb-4">
      {alerts.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border/40 rounded-xl">
          <Zap className="w-12 h-12 mx-auto mb-4 opacity-20 text-primary" />
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            All Systems Operational
          </p>
          <p className="text-xs mt-2 text-muted-foreground/60">
            No urgent actions requiring your attention
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Action Required ({alerts.length})
            </h3>
            <Button 
              onClick={openCreateProject}
              size="sm"
              className="h-8 text-[10px] font-black uppercase tracking-wider"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              New Project
            </Button>
          </div>
          
          {alerts.map((alert, i) => (
            <Card 
              key={`${alert.project.id}-${i}`}
              className={cn(
                "border-l-4 cursor-pointer hover:shadow-lg transition-all",
                alert.type === 'crisis' ? 'border-l-destructive bg-destructive/5' :
                alert.type === 'greenlight' ? 'border-l-primary bg-primary/5' :
                'border-l-amber-500 bg-amber-500/5'
              )}
              onClick={alert.onClick}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{alert.project.title}</h4>
                    <p className={cn(
                      "text-xs mt-1",
                      alert.type === 'crisis' ? 'text-destructive' :
                      alert.type === 'greenlight' ? 'text-primary' :
                      'text-amber-500'
                    )}>
                      {alert.message}
                    </p>
                  </div>
                  <Badge 
                    variant={alert.type === 'crisis' ? 'destructive' : 'outline'}
                    className="text-[9px]"
                  >
                    {alert.action}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};

// Strategy Panel - Long-term Goals
const StrategyPanel = () => {
  const gameState = useGameStore(s => s.gameState);
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-6 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Current Goal</span>
            </div>
            <p className="font-bold text-sm">Build Prestige to 80+</p>
            <p className="text-xs text-muted-foreground mt-1">
              Current: {gameState?.studio?.prestige || 0}/100
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-secondary/10 to-transparent border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Next Milestone</span>
            </div>
            <p className="font-bold text-sm">Release 3 Projects This Year</p>
            <p className="text-xs text-muted-foreground mt-1">
              Progress: 1/3 complete
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Market Position</span>
            </div>
            <p className="font-bold text-sm">Tier 2 Studio</p>
            <p className="text-xs text-muted-foreground mt-1">
              Rising competitor
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="p-6 bg-card/40 border border-border/40 rounded-xl">
        <h4 className="text-sm font-black uppercase tracking-wider mb-4">Strategic Recommendations</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <div>
              <p className="text-sm font-bold">Focus on Prestige Projects</p>
              <p className="text-xs text-muted-foreground">Your prestige is at {gameState?.studio?.prestige || 0}. Greenlight 2-3 high-quality dramas to reach 80+.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-secondary/5 rounded-lg border border-secondary/10">
            <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-secondary">2</span>
            </div>
            <div>
              <p className="text-sm font-bold">Secure A-List Talent</p>
              <p className="text-xs text-muted-foreground">Talent with 80+ prestige will boost project quality. Check the Talent Marketplace.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// News Panel - Industry Intelligence
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
  const { activeSubTab, setActiveSubTab, openCreateProject } = useUIStore();
  const gameState = useGameStore(useShallow(s => s.gameState));
  
  if (!gameState) return null;
  
  const projects = Object.values(gameState.entities?.projects || {});
  const talentCount = Object.keys(gameState.entities?.talents || {}).length;
  
  // Calculate badge counts
  const badgeCounts = React.useMemo(() => {
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
    };
  }, [projects, gameState]);
  
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
          {activeSubTab === 'overview' && <CommandCenter />}
          {activeSubTab === 'operations' && <OperationsPanel />}
          {activeSubTab === 'strategy' && <StrategyPanel />}
          {activeSubTab === 'news' && <NewsPanel />}
        </React.Suspense>
      </div>
    </m.div>
  );
};

export default StudioHQ;

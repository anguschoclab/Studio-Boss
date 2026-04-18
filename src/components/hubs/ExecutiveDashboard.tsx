import React from 'react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { tokens } from '@/lib/tokens';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  selectMarketMetrics,
  selectOverBudgetProjects,
  selectLowMoraleTalent,
  selectProjects,
  selectTalentPool
} from '@/store/selectors';
import {
  LayoutDashboard,
  AlertTriangle,
  Activity,
  DollarSign,
  TrendingUp,
  Zap,
  ArrowRight,
  Plus,
  AlertOctagon
} from 'lucide-react';

// Lazy load heavy visualization components
const StudioHealthRadar = React.lazy(() => import('@/components/hubs/visualizations/StudioHealthRadar'));
const CashFlowChart = React.lazy(() => import('@/components/hubs/visualizations/CashFlowChart'));
const CrisisRiskMeter = React.lazy(() => import('@/components/hubs/visualizations/CrisisRiskMeter'));
const MarketSentimentGauge = React.lazy(() => import('@/components/hubs/visualizations/MarketSentimentGauge'));
const WeeklyRevenueSpark = React.lazy(() => import('@/components/hubs/visualizations/WeeklyRevenueSpark'));
const SkeletonPage = React.lazy(() => import('@/components/shared/SkeletonCard'));

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ExecutiveDashboard: React.FC = () => {
  const { setActiveHub, setActiveSubTab, openCreateProject } = useUIStore();
  const gameState = useGameStore(s => s.gameState);

  // Calculate alerts from game state
  const alerts: AlertItem[] = React.useMemo(() => {
    const items: AlertItem[] = [];
    
    // Check for projects needing greenlight
    const needsGreenlight = selectProjects(gameState)
      .filter(p => p.state === 'needs_greenlight').length;
    
    if (needsGreenlight > 0) {
      items.push({
        id: 'greenlight',
        type: 'warning',
        icon: <Zap className="h-4 w-4 text-amber-500" />,
        title: `${needsGreenlight} Project${needsGreenlight > 1 ? 's' : ''} Ready for Greenlight`,
        description: 'Review and approve projects to begin production',
        action: {
          label: 'Review Queue',
          onClick: () => {
            setActiveHub('production');
            setActiveSubTab('slate');
          },
        },
      });
    }

    // Check for budget overruns
    const overBudget = selectOverBudgetProjects(gameState).length;
    
    if (overBudget > 0) {
      items.push({
        id: 'budget',
        type: 'critical',
        icon: <AlertOctagon className="h-4 w-4 text-red-500" />,
        title: `${overBudget} Project${overBudget > 1 ? 's' : ''} Over Budget`,
        description: 'Budget overruns detected - immediate action required',
        action: {
          label: 'View Details',
          onClick: () => {
            setActiveHub('production');
            setActiveSubTab('development');
          },
        },
      });
    }

    // Check for low talent morale
    const lowMorale = selectLowMoraleTalent(gameState).length;
    
    if (lowMorale > 0) {
      items.push({
        id: 'morale',
        type: 'warning',
        icon: <Activity className="h-4 w-4 text-amber-500" />,
        title: `${lowMorale} Talent Member${lowMorale > 1 ? 's' : ''} At Risk`,
        description: 'Talent morale is critically low - check roster',
        action: {
          label: 'Check Roster',
          onClick: () => {
            setActiveHub('talent');
            setActiveSubTab('roster');
          },
        },
      });
    }

    return items;
  }, [gameState, setActiveHub, setActiveSubTab]);

  // Real data from selectors
  const marketMetrics = selectMarketMetrics(gameState);

  // Note: Visualization components now use selectors internally
  // and don't need data passed as props. They will fetch from gameState directly.

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-destructive/10 border-destructive/30 shadow-[0_0_15px_hsl(var(--destructive)/0.15)]';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
      default:
        return 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className={cn('p-5 flex flex-col justify-center relative overflow-hidden group', tokens.glass.card)}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-emerald-500/10" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-xl bg-emerald-500/10 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)] border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <div>
              <p className={cn(tokens.text.label, 'mb-0.5 group-hover:text-emerald-400/80 transition-colors')}>Cash</p>
              <p className="text-2xl font-black font-mono tracking-tight bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all">
                ${(gameState?.finance?.cash || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-5 flex flex-col justify-center relative overflow-hidden group', tokens.glass.card)}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-blue-500/10" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-xl bg-blue-500/10 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)] border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <LayoutDashboard className="h-5 w-5 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </div>
            <div>
              <p className={cn(tokens.text.label, 'mb-0.5 group-hover:text-blue-400/80 transition-colors')}>Projects</p>
              <p className="text-2xl font-black font-mono tracking-tight bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all">
                {selectProjects(gameState).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-5 flex flex-col justify-center relative overflow-hidden group', tokens.glass.card)}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-purple-500/10" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-xl bg-purple-500/10 shadow-[inset_0_0_10px_rgba(168,85,247,0.1)] border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
              <Activity className="h-5 w-5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            </div>
            <div>
              <p className={cn(tokens.text.label, 'mb-0.5 group-hover:text-purple-400/80 transition-colors')}>Talent</p>
              <p className="text-2xl font-black font-mono tracking-tight bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all">
                {selectTalentPool(gameState).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-5 flex flex-col justify-center relative overflow-hidden group', tokens.glass.card)}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-amber-500/10" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-xl bg-amber-500/10 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)] border border-amber-500/20 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            </div>
            <div>
              <p className={cn(tokens.text.label, 'mb-0.5 group-hover:text-amber-400/80 transition-colors')}>Week</p>
              <p className="text-2xl font-black font-mono tracking-tight bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] transition-all">
                {gameState?.week || 1}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <Section title="Requires Attention" icon={AlertTriangle}>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl border backdrop-blur-md transition-all duration-300 hover:shadow-lg',
                  getAlertStyles(alert.type)
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-background/50 backdrop-blur-sm border border-white/5">
                    {alert.icon}
                  </div>
                  <div>
                    <p className="font-bold text-[13px] tracking-tight text-foreground/90">{alert.title}</p>
                    <p className={cn('text-xs mt-0.5', tokens.text.caption)}>
                      {alert.description}
                    </p>
                  </div>
                </div>
                {alert.action && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 px-4 text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-all shadow-sm hover:shadow-md"
                    onClick={alert.action.onClick}
                  >
                    {alert.action.label}
                    <ArrowRight className="h-3 w-3 ml-2 opacity-70" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column - Health & Sentiment */}
        <div className="col-span-4 space-y-4">
          <React.Suspense fallback={<SkeletonPage rows={4} />}>
            <StudioHealthRadar className="h-full" />
          </React.Suspense>

          <React.Suspense fallback={<SkeletonPage rows={3} />}>
            <MarketSentimentGauge
              sentiment={marketMetrics.sentiment}
              trend={marketMetrics.cycle === 'BOOM' || marketMetrics.cycle === 'RECOVERY' ? 'bullish' : 
                    marketMetrics.cycle === 'BEAR' || marketMetrics.cycle === 'RECESSION' ? 'bearish' : 'neutral'}
              volatility={Math.abs(marketMetrics.sentiment - 50) * 2}
            />
          </React.Suspense>

          <React.Suspense fallback={<SkeletonPage rows={3} />}>
            <CrisisRiskMeter />
          </React.Suspense>
        </div>

        {/* Right Column - Financials */}
        <div className="col-span-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <React.Suspense fallback={<SkeletonPage rows={5} />}>
              <CashFlowChart weeks={6} />
            </React.Suspense>

            <React.Suspense fallback={<SkeletonPage rows={3} />}>
              <WeeklyRevenueSpark label="Weekly Revenue" />
            </React.Suspense>
          </div>

          {/* Quick Actions */}
          <Card className={cn('p-5 relative overflow-hidden', tokens.glass.card)}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <h4 className={cn(tokens.text.heading, "mb-4 text-foreground/90 flex items-center gap-2")}>
              <Zap className="h-4 w-4 text-primary" /> Quick Actions
            </h4>
            <div className="grid grid-cols-4 gap-3 relative z-10">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 bg-card/40 hover:bg-primary/10 border-white/10 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-all duration-300 group rounded-xl hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                onClick={openCreateProject}
              >
                <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <Plus className="h-4 w-4 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">New Project</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 bg-card/40 hover:bg-emerald-500/10 border-white/10 hover:border-emerald-500/40 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition-all duration-300 group rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                onClick={() => {
                  setActiveHub('production');
                  setActiveSubTab('slate');
                }}
              >
                <div className="p-2 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors duration-300">
                  <Zap className="h-4 w-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-emerald-400 transition-colors">Greenlight</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 bg-card/40 hover:bg-secondary/10 border-white/10 hover:border-secondary/40 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none transition-all duration-300 group rounded-xl hover:shadow-[0_0_20px_hsl(var(--secondary)/0.15)]"
                onClick={() => {
                  setActiveHub('talent');
                  setActiveSubTab('marketplace');
                }}
              >
                <div className="p-2 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors duration-300">
                  <TrendingUp className="h-4 w-4 text-secondary drop-shadow-[0_0_8px_hsl(var(--secondary)/0.5)]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-secondary transition-colors">Market</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 bg-card/40 hover:bg-blue-500/10 border-white/10 hover:border-blue-500/40 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none transition-all duration-300 group rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                onClick={() => {
                  setActiveHub('intelligence');
                  setActiveSubTab('financials');
                }}
              >
                <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-300">
                  <DollarSign className="h-4 w-4 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-blue-400 transition-colors">Finance</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;

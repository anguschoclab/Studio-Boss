import React from 'react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { tokens } from '@/lib/tokens';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  selectMarketMetrics
} from '@/store/selectors';
import {
  LayoutDashboard,
  AlertTriangle,
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
    const needsGreenlight = Object.values(gameState?.entities?.projects || {})
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
    const overBudget = Object.values(gameState?.entities?.projects || {})
      .filter(p => (p.accumulatedCost || 0) > (p.budget || 0) * 1.1).length;
    
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

    // Check for low talent morale (using relationshipScore as proxy)
    const lowMorale = Object.values(gameState?.entities?.talents || {})
      .filter(t => (t as any).morale || (t as any).relationshipScore || 100 < 40).length;
    
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
        return 'bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30';
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Cash</p>
              <p className="text-xl font-bold">
                ${(gameState?.finance?.cash || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <LayoutDashboard className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Projects</p>
              <p className="text-xl font-bold">
                {Object.keys(gameState?.entities?.projects || {}).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Activity className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Talent</p>
              <p className="text-xl font-bold">
                {Object.keys(gameState?.entities?.talents || {}).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Week</p>
              <p className="text-xl font-bold">{gameState?.week || 1}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <Section title="Requires Attention" icon={AlertTriangle}>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border',
                  getAlertStyles(alert.type)
                )}
              >
                <div className="flex items-center gap-3">
                  {alert.icon}
                  <div>
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className={cn('text-xs', tokens.text.caption)}>
                      {alert.description}
                    </p>
                  </div>
                </div>
                {alert.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus:outline-none"
                    onClick={alert.action.onClick}
                  >
                    {alert.action.label}
                    <ArrowRight className="h-3 w-3 ml-1" />
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
          <Card className={cn('p-4', tokens.border.default)}>
            <h4 className="font-bold text-sm mb-3">Quick Actions</h4>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1"
                onClick={openCreateProject}
              >
                <Plus className="h-4 w-4" />
                <span className="text-[10px]">New Project</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => {
                  setActiveHub('production');
                  setActiveSubTab('slate');
                }}
              >
                <Zap className="h-4 w-4" />
                <span className="text-[10px]">Greenlight</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => {
                  setActiveHub('talent');
                  setActiveSubTab('marketplace');
                }}
              >
                <TrendingUp className="h-4 w-4" />
                <span className="text-[10px]">Market</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => {
                  setActiveHub('intelligence');
                  setActiveSubTab('financials');
                }}
              >
                <DollarSign className="h-4 w-4" />
                <span className="text-[10px]">Finance</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;

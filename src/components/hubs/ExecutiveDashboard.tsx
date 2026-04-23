import React from 'react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KPIStatCard } from '@/components/shared/KPIStatCard';
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
  AlertOctagon,
  Monitor
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
        title: `${needsGreenlight} PROJECT${needsGreenlight > 1 ? 'S' : ''} READY FOR GREENLIGHT`,
        description: 'Review and approve projects to begin production',
        action: {
          label: 'REVIEW QUEUE',
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
        title: `${overBudget} PROJECT${overBudget > 1 ? 'S' : ''} OVER BUDGET`,
        description: 'Budget overruns detected - immediate action required',
        action: {
          label: 'VIEW DETAILS',
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
        title: `${lowMorale} TALENT MEMBER${lowMorale > 1 ? 'S' : ''} AT RISK`,
        description: 'Talent morale is critically low - check roster',
        action: {
          label: 'CHECK ROSTER',
          onClick: () => {
            setActiveHub('talent');
            setActiveSubTab('roster');
          },
        },
      });
    }

    return items;
  }, [gameState, setActiveHub, setActiveSubTab]);

  const marketMetrics = selectMarketMetrics(gameState);

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-destructive/10 border-destructive/30 shadow-[0_0_15px_hsl(var(--destructive)/0.1)]';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      default:
        return 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-6">
        <KPIStatCard 
          label="Liquid Capital" 
          value={`$${((gameState?.finance?.cash || 0) / 1000000).toFixed(1)}M`}
          subValue="Fiscal Reserves"
          icon={DollarSign}
          variant="secondary"
        />
        <KPIStatCard 
          label="Active Slate" 
          value={selectProjects(gameState).length.toString()}
          subValue="Live Productions"
          icon={Monitor}
        />
        <KPIStatCard 
          label="Human Capital" 
          value={selectTalentPool(gameState).length.toString()}
          subValue="Contracted Assets"
          icon={Activity}
        />
        <KPIStatCard 
          label="Fiscal Week" 
          value={gameState?.week || 1}
          subValue="Current Period"
          icon={TrendingUp}
        />
      </div>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <Section title="EXECUTIVE ALERTS" icon={AlertTriangle}>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-center justify-between p-6 glass-card border-white/5 backdrop-blur-md transition-all duration-500 hover:bg-white/[0.03]',
                  getAlertStyles(alert.type)
                )}
              >
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 flex items-center justify-center bg-black/40 border border-white/5">
                    {alert.icon}
                  </div>
                  <div>
                    <p className="font-display font-black text-sm tracking-tight text-foreground/90 italic uppercase">{alert.title}</p>
                    <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest mt-1">
                      {alert.description}
                    </p>
                  </div>
                </div>
                {alert.action && (
                  <Button
                    size="sm"
                    className="h-9 px-6 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 border border-white/10 text-foreground transition-all rounded-none"
                    onClick={alert.action.onClick}
                  >
                    {alert.action.label}
                    <ArrowRight className="h-3 w-3 ml-2 opacity-50" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - Health & Sentiment */}
        <div className="col-span-4 space-y-8">
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
        <div className="col-span-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <React.Suspense fallback={<SkeletonPage rows={5} />}>
              <CashFlowChart weeks={6} />
            </React.Suspense>

            <React.Suspense fallback={<SkeletonPage rows={3} />}>
              <WeeklyRevenueSpark label="WEEKLY PERFORMANCE" />
            </React.Suspense>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-8 bg-white/[0.01] border-white/5 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="h-4 w-4 text-primary" /> 
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">STRATEGIC VECTORS</h4>
            </div>
            
            <div className="grid grid-cols-4 gap-6 relative z-10">
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-3 bg-black/40 hover:bg-primary/10 border-white/5 hover:border-primary/40 transition-all duration-500 group rounded-none"
                onClick={openCreateProject}
              >
                <Plus className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-primary transition-colors">NEW PROJECT</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-3 bg-black/40 hover:bg-emerald-500/10 border-white/5 hover:border-emerald-500/40 transition-all duration-500 group rounded-none"
                onClick={() => {
                  setActiveHub('production');
                  setActiveSubTab('slate');
                }}
              >
                <Zap className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-emerald-400 transition-colors">GREENLIGHT</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-3 bg-black/40 hover:bg-secondary/10 border-white/5 hover:border-secondary/40 transition-all duration-500 group rounded-none"
                onClick={() => {
                  setActiveHub('talent');
                  setActiveSubTab('marketplace');
                }}
              >
                <TrendingUp className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-secondary transition-colors">MARKETPLACE</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-3 bg-black/40 hover:bg-blue-500/10 border-white/5 hover:border-blue-500/40 transition-all duration-500 group rounded-none"
                onClick={() => {
                  setActiveHub('intelligence');
                  setActiveSubTab('financials');
                }}
              >
                <DollarSign className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-blue-400 transition-colors">FINANCIALS</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;

export default ExecutiveDashboard;

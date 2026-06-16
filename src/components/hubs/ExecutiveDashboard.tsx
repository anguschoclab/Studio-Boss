import React from 'react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Section } from '@/components/layout/Section';
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
  AlertTriangle,
  Activity,
  DollarSign,
  TrendingUp,
  Zap,
  ArrowRight,
  Plus,
  AlertOctagon,
  Monitor,
  Target,
  BarChart3,
  ShieldAlert
} from 'lucide-react';

// Lazy load heavy visualization components
const StudioHealthRadar = React.lazy(() => import('@/components/hubs/visualizations/StudioHealthRadar'));
const CashFlowChart = React.lazy(() => import('@/components/hubs/visualizations/CashFlowChart'));
const CrisisRiskMeter = React.lazy(() => import('@/components/hubs/visualizations/CrisisRiskMeter'));
const MarketSentimentGauge = React.lazy(() => import('@/components/hubs/visualizations/MarketSentimentGauge'));
const WeeklyRevenueSpark = React.lazy(() => import('@/components/hubs/visualizations/WeeklyRevenueSpark'));

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
        title: `${needsGreenlight} PROJECT${needsGreenlight > 1 ? 'S' : ''}_READY_FOR_GREENLIGHT`,
        description: 'REVIEW AND APPROVE PROJECTS TO BEGIN PRODUCTION',
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
        title: `${overBudget} PROJECT${overBudget > 1 ? 'S' : ''}_OVER_BUDGET`,
        description: 'BUDGET OVERRUNS DETECTED - IMMEDIATE ACTION REQUIRED',
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
        title: `${lowMorale} TALENT MEMBER${lowMorale > 1 ? 'S' : ''}_AT_RISK`,
        description: 'TALENT MORALE IS CRITICALLY LOW - CHECK ROSTER',
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
        return 'bg-red-500/[0.02] border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)] border-l-[4px] border-l-red-500';
      case 'warning':
        return 'bg-amber-500/[0.02] border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)] border-l-[4px] border-l-amber-500';
      default:
        return 'bg-blue-500/[0.02] border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)] border-l-[4px] border-l-blue-500';
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      {/* KPI Command Bar */}
      <div className="grid grid-cols-4 gap-8">
        <KPIStatCard 
          label="LIQUID CAPITAL" 
          value={`$${((gameState?.finance?.cash || 0) / 1000000).toFixed(1)}M`}
          subValue="FISCAL RESERVES"
          icon={DollarSign}
          variant="secondary"
        />
        <KPIStatCard 
          label="ACTIVE SLATE" 
          value={selectProjects(gameState).length.toString()}
          subValue="LIVE PRODUCTIONS"
          icon={Monitor}
        />
        <KPIStatCard 
          label="HUMAN CAPITAL" 
          value={selectTalentPool(gameState).length.toString()}
          subValue="CONTRACTED ASSETS"
          icon={Activity}
        />
        <KPIStatCard 
          label="FISCAL WEEK" 
          value={gameState?.week || 1}
          subValue="CURRENT PERIOD"
          icon={TrendingUp}
        />
      </div>

      {/* Critical Alert Stack */}
      {alerts.length > 0 && (
        <Section title="EXECUTIVE ALERTS" icon={AlertTriangle}>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-center justify-between p-8 rounded-none backdrop-blur-3xl transition-all duration-700 hover:brightness-125 group border border-white/5',
                  getAlertStyles(alert.type)
                )}
              >
                <div className="flex items-center gap-10">
                  <div className="w-12 h-12 flex items-center justify-center bg-black/60 border border-white/10 rounded-none shadow-2xl group-hover:border-primary/20 transition-colors">
                    {alert.icon}
                  </div>
                  <div>
                    <p className="text-lg font-display font-black tracking-tight text-foreground italic uppercase leading-none mb-3">{alert.title}</p>
                    <p className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.4em] italic leading-none">
                      {alert.description}
                    </p>
                  </div>
                </div>
                {alert.action && (
                  <Button
                    size="sm"
                    className="h-12 px-8 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/40 text-foreground transition-all duration-700 rounded-none italic"
                    onClick={alert.action.onClick}
                  >
                    {alert.action.label}
                    <ArrowRight className="h-4 w-4 ml-4 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Strategic Intelligence Grid */}
      <div className="grid grid-cols-12 gap-10">
        {/* Market Surveillance Column */}
        <div className="col-span-4 space-y-10">
          <div className="bg-white/[0.01] border border-white/5 p-8 rounded-none backdrop-blur-3xl shadow-2xl">
            <React.Suspense fallback={<div className="h-64 flex items-center justify-center font-display font-black text-muted-foreground/10 uppercase tracking-widest italic animate-pulse">SURVEILLANCE RADAR INITIALIZING...</div>}>
              <StudioHealthRadar className="h-full" />
            </React.Suspense>
          </div>

          <div className="bg-white/[0.01] border border-white/5 p-8 rounded-none backdrop-blur-3xl shadow-2xl">
            <React.Suspense fallback={<div className="h-40 flex items-center justify-center font-display font-black text-muted-foreground/10 uppercase tracking-widest italic animate-pulse">SENTIMENT ANALYSIS RUNNING...</div>}>
              <MarketSentimentGauge
                sentiment={marketMetrics.sentiment}
                trend={marketMetrics.cycle === 'BOOM' || marketMetrics.cycle === 'RECOVERY' ? 'bullish' : 
                      marketMetrics.cycle === 'BEAR' || marketMetrics.cycle === 'RECESSION' ? 'bearish' : 'neutral'}
                volatility={Math.abs(marketMetrics.sentiment - 50) * 2}
              />
            </React.Suspense>
          </div>

          <div className="bg-white/[0.01] border border-white/5 p-8 rounded-none backdrop-blur-3xl shadow-2xl">
            <React.Suspense fallback={<div className="h-40 flex items-center justify-center font-display font-black text-muted-foreground/10 uppercase tracking-widest italic animate-pulse">CRISIS MODELS LOADING...</div>}>
              <CrisisRiskMeter />
            </React.Suspense>
          </div>
        </div>

        {/* Fiscal Command Column */}
        <div className="col-span-8 space-y-10">
          <div className="grid grid-cols-2 gap-10">
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-none backdrop-blur-3xl shadow-2xl">
              <React.Suspense fallback={<div className="h-64 flex items-center justify-center font-display font-black text-muted-foreground/10 uppercase tracking-widest italic animate-pulse">CASH FLOW PROJECTION...</div>}>
                <CashFlowChart weeks={6} />
              </React.Suspense>
            </div>

            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-none backdrop-blur-3xl shadow-2xl">
              <React.Suspense fallback={<div className="h-64 flex items-center justify-center font-display font-black text-muted-foreground/10 uppercase tracking-widest italic animate-pulse">REVENUE ANALYTICS...</div>}>
                <WeeklyRevenueSpark label="WEEKLY PERFORMANCE" />
              </React.Suspense>
            </div>
          </div>

          {/* Strategic Vector Control */}
          <div className="p-10 bg-white/[0.02] border border-white/5 rounded-none backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldAlert className="h-32 w-32 text-primary" strokeWidth={1} />
            </div>
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <Target className="h-6 w-6 text-primary" strokeWidth={3} /> 
              <h4 className="text-sm font-black uppercase tracking-[0.4em] italic text-primary/60">STRATEGIC VECTOR OVERRIDE</h4>
            </div>
            
            <div className="grid grid-cols-4 gap-8 relative z-10">
              <Button
                variant="outline"
                className="h-auto py-10 flex flex-col items-center gap-6 bg-black/40 hover:bg-primary/10 border-white/10 hover:border-primary/40 transition-all duration-700 group rounded-none"
                onClick={openCreateProject}
              >
                <Plus className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-700" strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-primary transition-colors italic">NEW PROJECT</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-10 flex flex-col items-center gap-6 bg-black/40 hover:bg-emerald-500/10 border-white/10 hover:border-emerald-500/40 transition-all duration-700 group rounded-none"
                onClick={() => {
                  setActiveHub('production');
                  setActiveSubTab('slate');
                }}
              >
                <Zap className="h-8 w-8 text-emerald-400 group-hover:scale-110 transition-transform duration-700" strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-emerald-400 transition-colors italic">GREENLIGHT CMD</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-10 flex flex-col items-center gap-6 bg-black/40 hover:bg-secondary/10 border-white/10 hover:border-secondary/40 transition-all duration-700 group rounded-none"
                onClick={() => {
                  setActiveHub('talent');
                  setActiveSubTab('marketplace');
                }}
              >
                <TrendingUp className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-700" strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-secondary transition-colors italic">MARKET PULSE</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-10 flex flex-col items-center gap-6 bg-black/40 hover:bg-blue-500/10 border-white/10 hover:border-blue-500/40 transition-all duration-700 group rounded-none"
                onClick={() => {
                  setActiveHub('intelligence');
                  setActiveSubTab('financials');
                }}
              >
                <BarChart3 className="h-8 w-8 text-blue-400 group-hover:scale-110 transition-transform duration-700" strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-blue-400 transition-colors italic">FISCAL AUDIT</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;

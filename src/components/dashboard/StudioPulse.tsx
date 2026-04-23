import React, { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore, TabId } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Activity, AlertTriangle,
  Users, Film, DollarSign, Zap, CheckCircle2,
  Clock, AlertCircle
} from 'lucide-react';
import { ProgressIndicator } from '@/components/shared/ProgressIndicator';
import { SparklineChart } from '@/components/shared/SparklineChart';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';

interface PulseAlert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  description: string;
  action?: string;
  tab?: string;
}

export const StudioPulse: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);
  const setActiveTab = useUIStore(s => s.setActiveTab);

  const { finance, entities } = gameState || {};
  const projects = useMemo(() => entities ? Object.values(entities.projects) : [], [entities]);
  const talents = useMemo(() => entities ? Object.values(entities.talents) : [], [entities]);

  // Calculate health metrics
  const healthMetrics = useMemo(() => {
    if (!gameState || !finance) {
      return {
        runway: 999,
        runwayWeeks: 999,
        activeProjects: 0,
        atRiskProjects: 0,
        cashTrend: 0,
        cashHistory: [],
        talentCount: 0,
        marketSentiment: 50,
      };
    }

    const cash = finance.cash;
    const weeklyBurn = projects
      .filter(p => p.state === 'production' || p.state === 'development')
      .reduce((sum, p) => sum + (p.weeklyCost || 0), 0);
    const runway = weeklyBurn > 0 ? cash / weeklyBurn : 999;

    const activeProjects = projects.filter(p =>
      p.state !== 'released' && p.state !== 'archived'
    ).length;

    const atRiskProjects = projects.filter(p => {
      // Projects in turnaround or with high accumulated cost vs budget are at risk
      const isOverBudget = (p.accumulatedCost || 0) > (p.budget || 0) * 1.2;
      const isTroubled = p.state === 'turnaround' || p.state === 'needs_greenlight';
      return (isOverBudget || isTroubled) && p.state !== 'released' && p.state !== 'archived';
    }).length;

    const cashHistory = finance.weeklyHistory?.slice(-8).map(h => h.cash) || [];
    const cashTrend = cashHistory.length > 1
      ? (cashHistory[cashHistory.length - 1] - cashHistory[0]) / Math.abs(cashHistory[0] || 1)
      : 0;

    return {
      runway,
      runwayWeeks: Math.floor(runway),
      activeProjects,
      atRiskProjects,
      cashTrend,
      cashHistory,
      talentCount: talents.length,
      marketSentiment: finance.marketState?.sentiment || 50,
    };
  }, [gameState, finance, projects, talents]);

  // Generate alerts based on game state
  const alerts: PulseAlert[] = useMemo(() => {
    const list: PulseAlert[] = [];

    if (healthMetrics.runway < 4 && healthMetrics.runway > 0) {
      list.push({
        id: 'cash-critical',
        type: 'danger',
        title: 'CRITICAL CASH SHORTAGE',
        description: `ONLY ${healthMetrics.runwayWeeks} WEEKS OF RUNWAY REMAINING.`,
        action: 'VIEW FINANCE',
        tab: 'finance',
      });
    } else if (healthMetrics.runway < 8) {
      list.push({
        id: 'cash-warning',
        type: 'warning',
        title: 'LOW CASH RESERVES',
        description: `${healthMetrics.runwayWeeks} WEEKS OF RUNWAY - DEPLOY COST REDUCTIONS.`,
        action: 'VIEW FINANCE',
        tab: 'finance',
      });
    }

    if (healthMetrics.atRiskProjects > 0) {
      list.push({
        id: 'projects-at-risk',
        type: 'warning',
        title: 'PROJECTS AT RISK',
        description: `${healthMetrics.atRiskProjects} PROJECT${healthMetrics.atRiskProjects > 1 ? 'S' : ''} REQUIRE IMMEDIATE OVERSIGHT.`,
        action: 'VIEW PIPELINE',
        tab: 'pipeline',
      });
    }

    if (healthMetrics.marketSentiment < 30) {
      list.push({
        id: 'market-poor',
        type: 'info',
        title: 'BEAR MARKET CONDITIONS',
        description: 'MARKET SENTIMENT IS CRITICAL. DELAY MAJOR RELEASES.',
        action: 'VIEW INDUSTRY',
        tab: 'industry',
      });
    }

    return list;
  }, [healthMetrics]);

  const healthScore = useMemo(() => {
    let score = 100;
    if (healthMetrics.runway < 4) score -= 30;
    else if (healthMetrics.runway < 8) score -= 15;
    if (healthMetrics.atRiskProjects > 0) score -= healthMetrics.atRiskProjects * 5;
    if (healthMetrics.marketSentiment < 30) score -= 10;
    return Math.max(0, Math.min(100, score));
  }, [healthMetrics]);

  if (!gameState) return null;

  const handleAlertAction = (tab?: string) => {
    if (tab) {
      setActiveTab(tab as TabId);
    }
  };

  const healthColor = healthScore >= 80 ? 'success' : healthScore >= 50 ? 'warning' : 'destructive';

  return (
    <Card className="rounded-2xl border-white/5 bg-white/[0.01] backdrop-blur-xl transition-all duration-700 overflow-hidden">
      <CardHeader className="pb-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-none transition-colors",
              healthColor === 'success' && "bg-emerald-500/10 text-emerald-500",
              healthColor === 'warning' && "bg-amber-500/10 text-amber-500",
              healthColor === 'destructive' && "bg-red-500/10 text-red-500",
            )}>
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic leading-none">Studio Pulse</CardTitle>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 mt-2">
                Operational Health Analytics
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <TooltipWrapper tooltip="OVERALL STUDIO VIABILITY INDEX">
              <div className="flex items-center gap-3">
                <ProgressIndicator
                  value={healthScore}
                  max={100}
                  size="sm"
                  color={healthColor}
                  showValue={false}
                  className="w-32 h-1 rounded-none"
                />
                <span className={cn(
                  "text-2xl font-display font-black italic tracking-tighter leading-none",
                  healthColor === 'success' && "text-emerald-400",
                  healthColor === 'warning' && "text-amber-400",
                  healthColor === 'destructive' && "text-red-400",
                )}>
                  {healthScore}%
                </span>
              </div>
            </TooltipWrapper>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 space-y-12">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-6">
          <TooltipWrapper tooltip="LIQUIDITY RUNWAY">
            <div className="p-6 bg-white/[0.02] border border-white/5 space-y-3 group hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground/40" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Runway</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn(
                  "text-3xl font-display font-black italic tracking-tighter leading-none",
                  healthMetrics.runwayWeeks < 4 ? "text-red-400" : 
                  healthMetrics.runwayWeeks < 8 ? "text-amber-400" : "text-emerald-400"
                )}>
                  {healthMetrics.runwayWeeks}
                </span>
                <span className="text-[10px] font-black text-muted-foreground/20 uppercase">WKS</span>
              </div>
            </div>
          </TooltipWrapper>

          <TooltipWrapper tooltip="ACTIVE PRODUCTION SLATE">
            <div className="p-6 bg-white/[0.02] border border-white/5 space-y-3 group hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-2">
                <Film className="w-3 h-3 text-muted-foreground/40" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Slate</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display font-black italic tracking-tighter text-primary leading-none">{healthMetrics.activeProjects}</span>
                <span className="text-[10px] font-black text-muted-foreground/20 uppercase">PROJ</span>
              </div>
            </div>
          </TooltipWrapper>

          <TooltipWrapper tooltip="CONTRACTED TALENT ASSETS">
            <div className="p-6 bg-white/[0.02] border border-white/5 space-y-3 group hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-muted-foreground/40" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Talent</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display font-black italic tracking-tighter text-secondary leading-none">{healthMetrics.talentCount}</span>
                <span className="text-[10px] font-black text-muted-foreground/20 uppercase">SIGN</span>
              </div>
            </div>
          </TooltipWrapper>

          <TooltipWrapper tooltip="8-WEEK FISCAL TREND">
            <div className="p-6 bg-white/[0.02] border border-white/5 space-y-2 group hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-muted-foreground/40" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Trend</span>
              </div>
              <div className="flex items-center justify-between">
                {healthMetrics.cashHistory.length > 1 ? (
                  <SparklineChart
                    data={healthMetrics.cashHistory}
                    width={80}
                    height={32}
                    trend={healthMetrics.cashTrend > 0.05 ? 'up' : healthMetrics.cashTrend < -0.05 ? 'down' : 'neutral'}
                  />
                ) : (
                  <span className="text-[9px] font-black text-muted-foreground/20 uppercase italic">NO DATA</span>
                )}
                {healthMetrics.cashTrend !== 0 && (
                  <span className={cn(
                    "text-[10px] font-display font-black italic",
                    healthMetrics.cashTrend > 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {healthMetrics.cashTrend > 0 ? '+' : ''}{Math.round(healthMetrics.cashTrend * 100)}%
                  </span>
                )}
              </div>
            </div>
          </TooltipWrapper>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-white/5">
              <AlertCircle className="w-4 h-4 text-amber-500/60" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">
                Active Operational Alerts ({alerts.length})
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-center justify-between p-6 rounded-none border transition-all duration-300",
                    alert.type === 'danger' && "bg-red-500/5 border-red-500/10 hover:bg-red-500/10",
                    alert.type === 'warning' && "bg-amber-500/5 border-amber-500/10 hover:bg-amber-500/10",
                    alert.type === 'info' && "bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10",
                    alert.type === 'success' && "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10",
                  )}
                >
                  <div className="flex items-center gap-6">
                    {alert.type === 'danger' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                    {alert.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
                    {alert.type === 'info' && <Zap className="w-5 h-5 text-blue-500" />}
                    {alert.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    <div>
                      <p className="text-[11px] font-display font-black uppercase tracking-widest text-foreground leading-none mb-2 italic">{alert.title}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{alert.description}</p>
                    </div>
                  </div>
                  {alert.action && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 text-[9px] font-black uppercase tracking-[0.2em] border border-white/5 rounded-none px-6 hover:bg-white/10"
                      onClick={() => handleAlertAction(alert.tab)}
                    >
                      {alert.action}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-6 p-8 bg-emerald-500/5 border border-emerald-500/10">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <div>
              <p className="text-[11px] font-display font-black uppercase tracking-widest text-emerald-400 italic">ALL SYSTEMS OPERATIONAL</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/20 mt-1">NOMINAL STATUS CONFIRMED</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-12 text-[10px] font-black uppercase tracking-[0.25em] border border-white/5 rounded-none hover:bg-white/5"
            onClick={() => setActiveTab('pipeline' as TabId)}
          >
            <Film className="w-4 h-4 mr-3 opacity-20" />
            PIPELINE
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-12 text-[10px] font-black uppercase tracking-[0.25em] border border-white/5 rounded-none hover:bg-white/5"
            onClick={() => setActiveTab('finance' as TabId)}
          >
            <DollarSign className="w-4 h-4 mr-3 opacity-20" />
            FINANCES
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-12 text-[10px] font-black uppercase tracking-[0.25em] border border-white/5 rounded-none hover:bg-white/5"
            onClick={() => setActiveTab('talent' as TabId)}
          >
            <Users className="w-4 h-4 mr-3 opacity-20" />
            TALENT
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

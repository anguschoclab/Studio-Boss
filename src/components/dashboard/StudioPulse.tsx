import React, { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore, TabId } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Activity, AlertTriangle,
  Users, Film, DollarSign, Zap, CheckCircle2,
  Clock, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const projects = useMemo(() => entities ? Object.values(entities.projects) : [], [entities?.projects]);
  const talents = useMemo(() => entities ? Object.values(entities.talents) : [], [entities?.talents]);

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
        title: 'Critical Cash Shortage',
        description: `Only ${healthMetrics.runwayWeeks} weeks of runway remaining.`,
        action: 'View Finance',
        tab: 'finance',
      });
    } else if (healthMetrics.runway < 8) {
      list.push({
        id: 'cash-warning',
        type: 'warning',
        title: 'Low Cash Reserves',
        description: `${healthMetrics.runwayWeeks} weeks of runway - consider cost reductions.`,
        action: 'View Finance',
        tab: 'finance',
      });
    }

    if (healthMetrics.atRiskProjects > 0) {
      list.push({
        id: 'projects-at-risk',
        type: 'warning',
        title: 'Projects At Risk',
        description: `${healthMetrics.atRiskProjects} project${healthMetrics.atRiskProjects > 1 ? 's' : ''} require attention.`,
        action: 'View Pipeline',
        tab: 'pipeline',
      });
    }

    if (healthMetrics.marketSentiment < 30) {
      // Only show market alert if we have significant active projects
      list.push({
        id: 'market-poor',
        type: 'info',
        title: 'Bear Market Conditions',
        description: 'Market sentiment is low. Consider delaying major releases.',
        action: 'View Industry',
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
    <Card className="border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-transparent backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              healthColor === 'success' && "bg-emerald-500/10 text-emerald-500",
              healthColor === 'warning' && "bg-amber-500/10 text-amber-500",
              healthColor === 'destructive' && "bg-red-500/10 text-red-500",
            )}>
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-wider">Studio Pulse</CardTitle>
              <p className="text-[10px] text-muted-foreground font-medium">
                Operational Health & Active Alerts
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <TooltipWrapper tooltip="Overall studio health score based on cash, projects, and market conditions">
              <div className="flex items-center gap-2">
                <ProgressIndicator
                  value={healthScore}
                  max={100}
                  size="sm"
                  color={healthColor}
                  showValue={false}
                  className="w-24"
                />
                <span className={cn(
                  "text-lg font-black font-display",
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
      
      <CardContent className="p-4 space-y-4">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          <TooltipWrapper tooltip="Weeks of operation remaining at current burn rate">
            <div className="p-3 rounded-lg bg-background/50 border border-border/30 space-y-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Runway</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={cn(
                  "text-xl font-black font-display",
                  healthMetrics.runwayWeeks < 4 ? "text-red-400" : 
                  healthMetrics.runwayWeeks < 8 ? "text-amber-400" : "text-emerald-400"
                )}>
                  {healthMetrics.runwayWeeks}
                </span>
                <span className="text-[10px] text-muted-foreground">wks</span>
              </div>
            </div>
          </TooltipWrapper>

          <TooltipWrapper tooltip="Active projects in development or production">
            <div className="p-3 rounded-lg bg-background/50 border border-border/30 space-y-2">
              <div className="flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Active</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black font-display text-primary">{healthMetrics.activeProjects}</span>
                <span className="text-[10px] text-muted-foreground">projects</span>
              </div>
            </div>
          </TooltipWrapper>

          <TooltipWrapper tooltip="Contracted talent on your roster">
            <div className="p-3 rounded-lg bg-background/50 border border-border/30 space-y-2">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Talent</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black font-display text-secondary">{healthMetrics.talentCount}</span>
                <span className="text-[10px] text-muted-foreground">signed</span>
              </div>
            </div>
          </TooltipWrapper>

          <TooltipWrapper tooltip="8-week cash trend">
            <div className="p-3 rounded-lg bg-background/50 border border-border/30 space-y-1">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Trend</span>
              </div>
              <div className="flex items-center justify-between">
                {healthMetrics.cashHistory.length > 1 ? (
                  <SparklineChart
                    data={healthMetrics.cashHistory}
                    width={60}
                    height={24}
                    trend={healthMetrics.cashTrend > 0.05 ? 'up' : healthMetrics.cashTrend < -0.05 ? 'down' : 'neutral'}
                  />
                ) : (
                  <span className="text-[10px] text-muted-foreground">No data</span>
                )}
                {healthMetrics.cashTrend !== 0 && (
                  <span className={cn(
                    "text-[10px] font-bold",
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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Active Alerts ({alerts.length})
              </span>
            </div>
            <div className="space-y-2">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                    alert.type === 'danger' && "bg-red-500/5 border-red-500/20",
                    alert.type === 'warning' && "bg-amber-500/5 border-amber-500/20",
                    alert.type === 'info' && "bg-blue-500/5 border-blue-500/20",
                    alert.type === 'success' && "bg-emerald-500/5 border-emerald-500/20",
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {alert.type === 'danger' && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                    {alert.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                    {alert.type === 'info' && <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                    {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-xs font-bold text-foreground">{alert.title}</p>
                      <p className="text-[10px] text-muted-foreground">{alert.description}</p>
                    </div>
                  </div>
                  {alert.action && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] font-bold uppercase tracking-wider shrink-0"
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
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs font-bold text-emerald-400">All Systems Operational</p>
              <p className="text-[10px] text-muted-foreground">No immediate action required</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t border-border/30">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-[10px] font-bold uppercase tracking-wider"
            onClick={() => setActiveTab('pipeline' as TabId)}
          >
            <Film className="w-3.5 h-3.5 mr-1.5" />
            Pipeline
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-[10px] font-bold uppercase tracking-wider"
            onClick={() => setActiveTab('finance' as TabId)}
          >
            <DollarSign className="w-3.5 h-3.5 mr-1.5" />
            Finances
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-[10px] font-bold uppercase tracking-wider"
            onClick={() => setActiveTab('talent' as TabId)}
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Talent
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

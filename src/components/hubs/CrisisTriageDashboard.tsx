import React from 'react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import {
  selectProjects,
  selectOverBudgetProjects,
  selectLowMoraleTalent
} from '@/store/selectors';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  AlertOctagon, 
  Flame,
  Shield,
  Clock,
  ArrowRight,
  DollarSign,
  Users,
  Film,
  XCircle,
  Zap,
  ShieldAlert
} from 'lucide-react';

// Lazy load crisis components
const CrisisAlertPanel = React.lazy(() => import('@/components/crisis/CrisisAlertPanel'));
const BudgetOverrunAlert = React.lazy(() => import('@/components/production/BudgetOverrunAlert'));

interface CrisisItem {
  id: string;
  type: 'financial' | 'production' | 'talent' | 'legal' | 'market';
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  affectedCount: number;
  estimatedImpact: string;
  timeToResolve: string;
  icon: React.ReactNode;
}

export const CrisisTriageDashboard: React.FC = () => {
  const { setActiveHub, setActiveSubTab } = useUIStore();
  const gameState = useGameStore(s => s.gameState);

  // Aggregate all crises from game state
  const crises: CrisisItem[] = React.useMemo(() => {
    const items: CrisisItem[] = [];
    
    // Budget overruns
    const overBudget = selectOverBudgetProjects(gameState);
    
    if (overBudget.length > 0) {
      const totalOverrun = overBudget.reduce((sum, p) => 
        sum + ((p.accumulatedCost || 0) - (p.budget || 0)), 0
      );
      items.push({
        id: 'budget-crisis',
        type: 'financial',
        severity: 'critical',
        title: 'BUDGET_OVERRUNS',
        description: `${overBudget.length} PROJECTS EXCEEDING ALLOCATED BUDGETS`,
        affectedCount: overBudget.length,
        estimatedImpact: `$${(totalOverrun / 1000000).toFixed(1)}M OVER BUDGET`,
        timeToResolve: 'IMMEDIATE',
        icon: <DollarSign className="h-5 w-5 text-red-500" />,
      });
    }

    // Projects needing greenlight (opportunity cost)
    const needsGreenlight = selectProjects(gameState)
      .filter(p => p.state === 'needs_greenlight');
    
    if (needsGreenlight.length > 0) {
      items.push({
        id: 'greenlight-crisis',
        type: 'production',
        severity: 'high',
        title: 'GREENLIGHT_QUEUE_BACKUP',
        description: 'PROJECTS WAITING APPROVAL ARE INCURRING HOLDING COSTS',
        affectedCount: needsGreenlight.length,
        estimatedImpact: 'DELAYED REVENUE, TEAM IDLE TIME',
        timeToResolve: 'THIS WEEK',
        icon: <Clock className="h-5 w-5 text-amber-500" />,
      });
    }

    // Low talent morale
    const lowMorale = selectLowMoraleTalent(gameState);
    
    if (lowMorale.length > 0) {
      items.push({
        id: 'morale-crisis',
        type: 'talent',
        severity: 'high',
        title: 'TALENT_RELATIONS_AT_RISK',
        description: 'MULTIPLE TALENT MEMBERS SHOWING DISSATISFACTION',
        affectedCount: lowMorale.length,
        estimatedImpact: 'WALKOUTS, CONTRACT DISPUTES, PR ISSUES',
        timeToResolve: '1-2 WEEKS',
        icon: <Users className="h-5 w-5 text-amber-500" />,
      });
    }

    // Active production crises
    const productionCrises = selectProjects(gameState)
      .filter(p => p.activeCrisis && !p.activeCrisis.resolved);
    
    if (productionCrises.length > 0) {
      items.push({
        id: 'production-crisis',
        type: 'production',
        severity: 'critical',
        title: 'ACTIVE_PRODUCTION_CRISES',
        description: 'PROJECTS HALTED OR DELAYED DUE TO ON-SET ISSUES',
        affectedCount: productionCrises.length,
        estimatedImpact: 'SCHEDULE DELAYS, COST OVERRUNS',
        timeToResolve: 'IMMEDIATE',
        icon: <Film className="h-5 w-5 text-red-500" />,
      });
    }

    return items;
  }, [gameState]);

  const criticalCount = crises.filter(c => c.severity === 'critical').length;
  const highCount = crises.filter(c => c.severity === 'high').length;

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-red-500/50',
          bg: 'bg-red-500/5',
          badge: 'bg-red-500 text-black',
        };
      case 'high':
        return {
          border: 'border-amber-500/50',
          bg: 'bg-amber-500/5',
          badge: 'bg-amber-500 text-black',
        };
      default:
        return {
          border: 'border-blue-500/50',
          bg: 'bg-blue-500/5',
          badge: 'bg-blue-500 text-black',
        };
    }
  };

  const navigateToCrisis = (type: string) => {
    switch (type) {
      case 'financial':
        setActiveHub('production');
        setActiveSubTab('development');
        break;
      case 'production':
        setActiveHub('production');
        setActiveSubTab('slate');
        break;
      case 'talent':
        setActiveHub('talent');
        setActiveSubTab('roster');
        break;
      default:
        setActiveHub('hq');
        setActiveSubTab('operations');
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      {/* Crisis Summary Banner */}
      {crises.length > 0 && (
        <div className={cn(
          'p-10 rounded-none border-l-[6px] backdrop-blur-3xl shadow-2xl relative overflow-hidden',
          criticalCount > 0 ? 'bg-red-500/[0.02] border-red-500' : 'bg-amber-500/[0.02] border-amber-500'
        )}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[120px] -mr-32 -mt-32" />
          <div className="flex items-start gap-10 relative z-10">
            <div className={cn(
              'w-20 h-20 flex items-center justify-center rounded-none shadow-2xl',
              criticalCount > 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'
            )}>
              {criticalCount > 0 ? (
                <AlertOctagon className="h-10 w-10 text-red-500" strokeWidth={1} />
              ) : (
                <AlertTriangle className="h-10 w-10 text-amber-500" strokeWidth={1} />
              )}
            </div>
            <div className="flex-1">
              <h3 className={cn(
                'text-4xl font-display font-black tracking-tighter uppercase italic leading-none mb-3',
                criticalCount > 0 ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]'
              )}>
                {criticalCount > 0 
                  ? `${criticalCount} CRITICAL_ISSUES_REQUIRE_IMMEDIATE_ACTION`
                  : `${crises.length} ISSUES_NEED_YOUR_ATTENTION`
                }
              </h3>
              <p className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.4em] italic">
                REVIEW AND RESOLVE THE ITEMS BELOW TO MAINTAIN STUDIO HEALTH
              </p>
            </div>
            <div className="flex gap-4">
              {criticalCount > 0 && (
                <Badge className="bg-red-500 text-black px-6 py-2 rounded-none font-black uppercase italic tracking-widest text-[10px] shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse">
                  <Flame className="h-3.5 w-3.5 mr-2" />
                  {criticalCount} CRITICAL
                </Badge>
              )}
              {highCount > 0 && (
                <Badge className="bg-amber-500 text-black px-6 py-2 rounded-none font-black uppercase italic tracking-widest text-[10px] shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  {highCount} HIGH_PRIORITY
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Crisis List */}
      {crises.length === 0 ? (
        <div className={cn(
          'flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-none bg-emerald-500/[0.01]',
          'border-emerald-500/10'
        )}>
          <div className="w-20 h-20 flex items-center justify-center rounded-none bg-emerald-500/5 border border-emerald-500/10 mb-8 shadow-2xl relative">
            <div className="absolute inset-0 bg-emerald-500/2 blur-2xl" />
            <Shield className="h-10 w-10 text-emerald-500 relative z-10" strokeWidth={1} />
          </div>
          <h3 className="text-2xl font-display font-black text-emerald-500 uppercase tracking-tight italic leading-none mb-3">ALL_SYSTEMS_OPERATIONAL</h3>
          <p className="text-[10px] font-black uppercase text-muted-foreground/20 tracking-[0.4em] italic">
            NO CRISES REQUIRING YOUR ATTENTION AT THIS TIMESTAMP
          </p>
        </div>
      ) : (
        <Section
          title="ACTIVE_TRIAGE_QUEUE"
          subtitle="PRIORITIZED BY SEVERITY AND IMPACT"
          icon={AlertTriangle}
        >
          <div className="space-y-6">
            {crises.map((crisis) => {
              const styles = getSeverityStyles(crisis.severity);
              return (
                <div
                  key={crisis.id}
                  className={cn(
                    'p-8 rounded-none border-l-4 backdrop-blur-3xl shadow-xl transition-all duration-700 hover:brightness-125 group',
                    styles.border,
                    styles.bg,
                    'border-white/5 bg-white/[0.01]'
                  )}
                >
                  <div className="flex items-start justify-between gap-10">
                    <div className="flex items-start gap-8">
                      <div className="w-12 h-12 flex items-center justify-center rounded-none bg-black/40 border border-white/5 shadow-2xl group-hover:border-primary/20 transition-colors">
                        {crisis.icon}
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <h4 className="text-lg font-black uppercase tracking-tight italic text-foreground leading-none">{crisis.title}</h4>
                          <Badge className={cn('text-[9px] rounded-none px-3 font-black tracking-widest italic', styles.badge)}>
                            {crisis.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground/40 italic leading-relaxed max-w-2xl">
                          {crisis.description}
                        </p>
                        <div className="flex flex-wrap gap-10 text-[9px] font-black uppercase tracking-[0.2em] italic">
                          <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground/20">ESTIMATED_IMPACT</span>
                            <span className="text-foreground">{crisis.estimatedImpact}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground/20">RESOLUTION_WINDOW</span>
                            <span className="text-foreground">{crisis.timeToResolve}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground/20">AFFECTED_UNITS</span>
                            <span className="text-foreground">{crisis.affectedCount} UNIT{crisis.affectedCount > 1 ? 'S' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-12 px-8 rounded-none font-black uppercase italic tracking-widest text-[10px] border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all duration-700"
                      onClick={() => navigateToCrisis(crisis.type)}
                    >
                      INITIALIZE_RESOLUTION
                      <ArrowRight className="h-4 w-4 ml-3" strokeWidth={3} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Crisis Management Components */}
      {crises.length > 0 && (
        <div className="grid grid-cols-2 gap-8">
          <React.Suspense fallback={<div className="h-64 flex items-center justify-center font-display font-black text-muted-foreground/10 uppercase tracking-widest italic animate-pulse">INITIALIZING_CRISIS_DATA...</div>}>
            <CrisisAlertPanel
              activeCrises={[]}
              crisisHistory={[]}
            />
          </React.Suspense>

          <React.Suspense fallback={<div className="h-64 flex items-center justify-center font-display font-black text-muted-foreground/10 uppercase tracking-widest italic animate-pulse">INITIALIZING_FISCAL_DATA...</div>}>
            <BudgetOverrunAlert
              alerts={[]}
            />
          </React.Suspense>
        </div>
      )}

      {/* Emergency Actions */}
      {criticalCount > 0 && (
        <div className="p-10 border border-red-500/20 bg-red-500/[0.02] rounded-none backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertOctagon className="h-24 w-24 text-red-500" strokeWidth={1} />
          </div>
          <h4 className="text-sm font-black uppercase italic tracking-[0.3em] text-red-500 mb-8 flex items-center gap-4 leading-none">
            <ShieldAlert className="h-5 w-5" strokeWidth={3} />
            EMERGENCY_OVERRIDE_ACTIONS
          </h4>
          <div className="grid grid-cols-4 gap-4 relative z-10">
            <Button variant="outline" className="h-16 rounded-none font-black uppercase italic tracking-widest text-[10px] border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-700">
              <DollarSign className="h-4 w-4 mr-3 text-red-500" strokeWidth={3} />
              EMERGENCY_FUNDS
            </Button>
            <Button variant="outline" className="h-16 rounded-none font-black uppercase italic tracking-widest text-[10px] border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-700">
              <Users className="h-4 w-4 mr-3 text-red-500" strokeWidth={3} />
              CRISIS_PR_PROTOCOL
            </Button>
            <Button variant="outline" className="h-16 rounded-none font-black uppercase italic tracking-widest text-[10px] border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-700">
              <Zap className="h-4 w-4 mr-3 text-red-500" strokeWidth={3} />
              FAST_TRACK_CLEARANCE
            </Button>
            <Button variant="destructive" className="h-16 rounded-none font-black uppercase italic tracking-widest text-[10px] shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <XCircle className="h-4 w-4 mr-3" strokeWidth={3} />
              CANCEL_PROJECT
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrisisTriageDashboard;

import React from 'react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { tokens } from '@/lib/tokens';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
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
  CheckCircle2,
  XCircle
} from 'lucide-react';

// Lazy load crisis components
const CrisisAlertPanel = React.lazy(() => import('@/components/crisis/CrisisAlertPanel'));
const BudgetOverrunAlert = React.lazy(() => import('@/components/production/BudgetOverrunAlert'));
const SkeletonPage = React.lazy(() => import('@/components/shared/SkeletonCard'));

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
    const overBudget = Object.values(gameState?.entities?.projects || {})
      .filter(p => (p.accumulatedCost || 0) > (p.budget || 0) * 1.1);
    
    if (overBudget.length > 0) {
      const totalOverrun = overBudget.reduce((sum, p) => 
        sum + ((p.accumulatedCost || 0) - (p.budget || 0)), 0
      );
      items.push({
        id: 'budget-crisis',
        type: 'financial',
        severity: 'critical',
        title: 'Budget Overruns',
        description: `${overBudget.length} projects exceeding allocated budgets`,
        affectedCount: overBudget.length,
        estimatedImpact: `$${(totalOverrun / 1000000).toFixed(1)}M over budget`,
        timeToResolve: 'Immediate',
        icon: <DollarSign className="h-5 w-5 text-red-500" />,
      });
    }

    // Projects needing greenlight (opportunity cost)
    const needsGreenlight = Object.values(gameState?.entities?.projects || {})
      .filter(p => p.state === 'needs_greenlight');
    
    if (needsGreenlight.length > 0) {
      items.push({
        id: 'greenlight-crisis',
        type: 'production',
        severity: 'high',
        title: 'Greenlight Queue Backup',
        description: 'Projects waiting approval are incurring holding costs',
        affectedCount: needsGreenlight.length,
        estimatedImpact: 'Delayed revenue, team idle time',
        timeToResolve: 'This week',
        icon: <Clock className="h-5 w-5 text-amber-500" />,
      });
    }

    // Low talent morale
    const lowMorale = Object.values(gameState?.entities?.talents || {})
      .filter(t => (t as any).morale || (t as any).relationshipScore || 100 < 40);
    
    if (lowMorale.length > 0) {
      items.push({
        id: 'morale-crisis',
        type: 'talent',
        severity: 'high',
        title: 'Talent Relations At Risk',
        description: 'Multiple talent members showing dissatisfaction',
        affectedCount: lowMorale.length,
        estimatedImpact: 'Walkouts, contract disputes, PR issues',
        timeToResolve: '1-2 weeks',
        icon: <Users className="h-5 w-5 text-amber-500" />,
      });
    }

    // Active production crises
    const productionCrises = Object.values(gameState?.entities?.projects || {})
      .filter(p => p.activeCrisis && !p.activeCrisis.resolved);
    
    if (productionCrises.length > 0) {
      items.push({
        id: 'production-crisis',
        type: 'production',
        severity: 'critical',
        title: 'Active Production Crises',
        description: 'Projects halted or delayed due to on-set issues',
        affectedCount: productionCrises.length,
        estimatedImpact: 'Schedule delays, cost overruns',
        timeToResolve: 'Immediate',
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
          bg: 'bg-red-500/10',
          badge: 'bg-red-500 text-white',
        };
      case 'high':
        return {
          border: 'border-amber-500/50',
          bg: 'bg-amber-500/10',
          badge: 'bg-amber-500 text-white',
        };
      default:
        return {
          border: 'border-blue-500/50',
          bg: 'bg-blue-500/10',
          badge: 'bg-blue-500 text-white',
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
    <div className="space-y-6">
      {/* Crisis Summary Banner */}
      {crises.length > 0 && (
        <Card className={cn(
          'p-4 border',
          criticalCount > 0 ? 'bg-red-500/10 border-red-500/50' : 'bg-amber-500/10 border-amber-500/50'
        )}>
          <div className="flex items-start gap-4">
            <div className={cn(
              'p-3 rounded-lg',
              criticalCount > 0 ? 'bg-red-500/20' : 'bg-amber-500/20'
            )}>
              {criticalCount > 0 ? (
                <AlertOctagon className="h-6 w-6 text-red-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={cn(
                'font-bold text-lg',
                criticalCount > 0 ? 'text-red-500' : 'text-amber-500'
              )}>
                {criticalCount > 0 
                  ? `${criticalCount} Critical Issue${criticalCount > 1 ? 's' : ''} Require Immediate Action`
                  : `${crises.length} Issues Need Your Attention`
                }
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Review and resolve the items below to maintain studio health
              </p>
            </div>
            <div className="flex gap-2">
              {criticalCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  <Flame className="h-3 w-3 mr-1" />
                  {criticalCount} Critical
                </Badge>
              )}
              {highCount > 0 && (
                <Badge className="bg-amber-500 text-white">
                  {highCount} High
                </Badge>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Crisis List */}
      {crises.length === 0 ? (
        <div className={cn(
          'flex flex-col items-center justify-center py-12',
          tokens.border.default,
          'border-dashed rounded-xl'
        )}>
          <div className="p-4 rounded-full bg-emerald-500/10 mb-4">
            <Shield className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="font-bold text-lg text-emerald-500">All Systems Operational</h3>
          <p className="text-sm text-muted-foreground mt-2">
            No crises requiring your attention
          </p>
        </div>
      ) : (
        <Section
          title="Active Issues"
          subtitle="Prioritized by severity and impact"
          icon={AlertTriangle}
        >
          <div className="space-y-3">
            {crises.map((crisis) => {
              const styles = getSeverityStyles(crisis.severity);
              return (
                <Card
                  key={crisis.id}
                  className={cn(
                    'p-4 border-l-4',
                    styles.border,
                    styles.bg,
                    tokens.border.default
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-background/50">
                        {crisis.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm">{crisis.title}</h4>
                          <Badge className={cn('text-[9px]', styles.badge)}>
                            {crisis.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className={cn('text-sm', tokens.text.caption)}>
                          {crisis.description}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-2 text-[10px]">
                          <span className="text-muted-foreground">
                            <strong>Impact:</strong> {crisis.estimatedImpact}
                          </span>
                          <span className="text-muted-foreground">
                            <strong>Timeline:</strong> {crisis.timeToResolve}
                          </span>
                          <span className="text-muted-foreground">
                            <strong>Affected:</strong> {crisis.affectedCount} item{crisis.affectedCount > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => navigateToCrisis(crisis.type)}
                    >
                      Resolve
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      )}

      {/* Crisis Management Components */}
      {crises.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <React.Suspense fallback={<SkeletonPage rows={4} />}>
            <CrisisAlertPanel
              activeCrises={[]}
              crisisHistory={[]}
            />
          </React.Suspense>

          <React.Suspense fallback={<SkeletonPage rows={4} />}>
            <BudgetOverrunAlert
              alerts={[]}
            />
          </React.Suspense>
        </div>
      )}

      {/* Emergency Actions */}
      {criticalCount > 0 && (
        <Card className={cn('p-4', tokens.border.default)}>
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-red-500" />
            Emergency Actions
          </h4>
          <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" size="sm" className="h-auto py-2 text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              Emergency Funds
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-2 text-xs">
              <Users className="h-3 w-3 mr-1" />
              Crisis PR
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-2 text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Fast Track
            </Button>
            <Button variant="destructive" size="sm" className="h-auto py-2 text-xs">
              <XCircle className="h-3 w-3 mr-1" />
              Cancel Project
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CrisisTriageDashboard;

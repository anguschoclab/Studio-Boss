import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, DollarSign, TrendingUp, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { tokens } from '@/lib/tokens';

interface OverrunCause {
  category: string;
  amount: number;
  reason: string;
}

interface BudgetAlert {
  projectId: string;
  projectTitle: string;
  originalBudget: number;
  currentSpend: number;
  projectedFinal: number;
  overrunAmount: number;
  overrunPercentage: number;
  severity: 'warning' | 'critical' | 'catastrophic';
  weeksRemaining: number;
  causes: OverrunCause[];
  recommendations: string[];
}

interface BudgetOverrunAlertProps {
  alerts: BudgetAlert[];
  onAdjustBudget?: (projectId: string) => void;
  onCutCosts?: (projectId: string) => void;
  onApproveOverrun?: (projectId: string) => void;
}

export const BudgetOverrunAlert: React.FC<BudgetOverrunAlertProps> = ({
  alerts,
  onAdjustBudget,
  onCutCosts,
  onApproveOverrun,
}) => {
  const critical = alerts.filter(a => a.severity === 'critical' || a.severity === 'catastrophic');
  const warnings = alerts.filter(a => a.severity === 'warning');
  const totalOverrun = alerts.reduce((sum, a) => sum + a.overrunAmount, 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'catastrophic': return 'bg-red-600';
      case 'critical': return 'bg-red-500';
      default: return 'bg-amber-500';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      catastrophic: 'bg-red-600 text-white',
      critical: 'bg-red-500 text-white',
      warning: 'bg-amber-500 text-white',
    };
    return (
      <Badge className={cn('text-[9px]', colors[severity])}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  if (alerts.length === 0) {
    return (
      <div className={cn('text-center py-12', tokens.border.default, 'border-dashed rounded-xl')}>
        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-emerald-500 opacity-50" />
        <p className={tokens.text.label}>All Projects On Budget</p>
        <p className={cn('text-sm mt-2', tokens.text.caption)}>
          No budget overruns detected
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Alert */}
      <div className={cn(
        'border rounded-lg p-4',
        critical.length > 0 ? 'bg-red-500/10 border-red-500/50' : 'bg-amber-500/10 border-amber-500/50'
      )}>
        <div className="flex items-start gap-3">
          <AlertOctagon className={cn(
            'h-6 w-6 flex-shrink-0',
            critical.length > 0 ? 'text-red-500' : 'text-amber-500'
          )} />
          <div className="flex-1">
            <h3 className={cn(
              'font-bold',
              critical.length > 0 ? 'text-red-500' : 'text-amber-500'
            )}>
              Budget Overrun{critical.length > 1 ? 's' : ''} Detected
            </h3>
            <p className="text-sm opacity-70 mt-1">
              {alerts.length} project{alerts.length > 1 ? 's' : ''} exceeding budget • 
              Total overrun: {formatCurrency(totalOverrun)}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Critical</p>
              <p className="text-2xl font-bold">{critical.length}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <DollarSign className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Total Overrun</p>
              <p className="text-xl font-bold">{formatCurrency(totalOverrun)}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Alerts</p>
              <p className="text-2xl font-bold">{alerts.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Critical Overruns */}
      {critical.length > 0 && (
        <Section
          title="Critical Budget Overruns"
          subtitle="Immediate action required"
          icon={AlertTriangle}
        >
          <div className="space-y-4">
            {critical.map((alert) => (
              <Card
                key={alert.projectId}
                className={cn(
                  'p-4 border-l-4',
                  tokens.border.default,
                  getSeverityColor(alert.severity)
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm">{alert.projectTitle}</h4>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <p className={cn('text-[10px]', tokens.text.caption)}>
                      {alert.weeksRemaining} weeks remaining in production
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-red-500">
                      +{alert.overrunPercentage.toFixed(0)}%
                    </p>
                    <p className={cn('text-[10px]', tokens.text.caption)}>
                      {formatCurrency(alert.overrunAmount)} over
                    </p>
                  </div>
                </div>

                {/* Budget Progress */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={tokens.text.caption}>
                      Budget: {formatCurrency(alert.originalBudget)}
                    </span>
                    <span className={tokens.text.caption}>
                      Projected: {formatCurrency(alert.projectedFinal)}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min((alert.currentSpend / alert.originalBudget) * 100, 100)}%` }}
                    />
                    <div
                      className="h-full bg-red-500 rounded-full -mt-3"
                      style={{ 
                        width: `${Math.min(((alert.projectedFinal - alert.originalBudget) / alert.originalBudget) * 100, 100)}%`,
                        marginLeft: `${Math.min((alert.currentSpend / alert.originalBudget) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>

                {/* Causes */}
                <div className="space-y-2 mb-4">
                  <p className={cn('text-[10px] font-medium', tokens.text.caption)}>Overrun Causes:</p>
                  {alert.causes.map((cause, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px] p-2 bg-muted/30 rounded">
                      <span>{cause.category}: {cause.reason}</span>
                      <span className="text-red-500">+{formatCurrency(cause.amount)}</span>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {alert.recommendations.map((rec, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px]">
                      💡 {rec}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px]"
                    onClick={() => onAdjustBudget?.(alert.projectId)}
                  >
                    Adjust Budget
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px]"
                    onClick={() => onCutCosts?.(alert.projectId)}
                  >
                    Cut Costs
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-[10px]"
                    onClick={() => onApproveOverrun?.(alert.projectId)}
                  >
                    Approve Overrun
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Warning Level */}
      {warnings.length > 0 && (
        <Section
          title="Budget Warnings"
          subtitle="Projects approaching limit"
          icon={TrendingUp}
        >
          <div className="space-y-3">
            {warnings.map((alert) => (
              <Card
                key={alert.projectId}
                className={cn('p-4 border-l-4 border-l-amber-500', tokens.border.default)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{alert.projectTitle}</h4>
                    <p className={cn('text-[10px]', tokens.text.caption)}>
                      {formatCurrency(alert.currentSpend)} / {formatCurrency(alert.originalBudget)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-500">
                      +{alert.overrunPercentage.toFixed(0)}%
                    </p>
                    {getSeverityBadge(alert.severity)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};

export default BudgetOverrunAlert;

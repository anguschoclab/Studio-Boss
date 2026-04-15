import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Shield, Clock, XCircle, CheckCircle2 } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { tokens } from '@/lib/tokens';

interface CrisisOption {
  text: string;
  effectDescription: string;
}

interface ActiveCrisis {
  id: string;
  type: 'scandal' | 'production_halt' | 'talent_walkout' | 'pr_disaster' | 'legal_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  triggeredWeek: number;
  weeksRemaining: number;
  affectedProjects: string[];
  options: CrisisOption[];
  financialImpact: number;
  reputationImpact: number;
}

interface CrisisAlertPanelProps {
  activeCrises: ActiveCrisis[];
  onResolve?: (crisisId: string, optionIndex: number) => void;
  crisisHistory: {
    week: number;
    title: string;
    severity: string;
    resolution: string;
    cost: number;
  }[];
}

export const CrisisAlertPanel: React.FC<CrisisAlertPanelProps> = ({
  activeCrises,
  onResolve,
  crisisHistory,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      default: return 'bg-yellow-400';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, string> = {
      critical: 'bg-red-600 text-white',
      high: 'bg-red-500 text-white',
      medium: 'bg-amber-500 text-white',
      low: 'bg-yellow-400 text-black',
    };
    return (
      <Badge className={cn('text-[9px]', variants[severity] || variants.low)}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scandal': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'production_halt': return <Clock className="h-5 w-5 text-amber-500" />;
      case 'talent_walkout': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pr_disaster': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default: return <Shield className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Crisis Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={cn('p-4', tokens.border.default, activeCrises.length > 0 && 'border-red-500/50')}>
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              activeCrises.length > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'
            )}>
              <AlertTriangle className={cn(
                'h-5 w-5',
                activeCrises.length > 0 ? 'text-red-500' : 'text-emerald-500'
              )} />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Active Crises</p>
              <p className={cn(
                'text-2xl font-bold',
                activeCrises.length > 0 ? 'text-red-500' : 'text-emerald-500'
              )}>
                {activeCrises.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Resolved</p>
              <p className="text-2xl font-bold">{crisisHistory.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Crises */}
      {activeCrises.length > 0 && (
        <Section
          title="Active Crisis Management"
          subtitle={`${activeCrises.length} situation${activeCrises.length > 1 ? 's' : ''} requiring immediate attention`}
          icon={AlertTriangle}
        >
          <div className="space-y-4">
            {activeCrises.map((crisis) => (
              <Card
                key={crisis.id}
                className={cn(
                  'p-4 border-l-4',
                  tokens.border.default,
                  getSeverityColor(crisis.severity)
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(crisis.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">{crisis.title}</h4>
                        {getSeverityBadge(crisis.severity)}
                      </div>
                      <p className={cn('text-[10px]', tokens.text.caption)}>
                        Week {crisis.triggeredWeek} • {crisis.weeksRemaining} weeks to resolve
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm mb-3">{crisis.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {crisis.affectedProjects.map((project, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px]">
                      Affected: {project}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 mb-4 text-[10px]">
                  <span className="text-red-500">
                    Financial Impact: -${(crisis.financialImpact / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-amber-500">
                    Reputation: {crisis.reputationImpact > 0 ? '+' : ''}{crisis.reputationImpact}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className={cn('text-[10px] font-medium', tokens.text.caption)}>
                    Response Options:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {crisis.options.map((option, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto py-2 text-left text-[10px]"
                        onClick={() => onResolve?.(crisis.id, idx)}
                      >
                        <div>
                          <p className="font-medium">{option.text}</p>
                          <p className={cn('text-[9px]', tokens.text.caption)}>
                            {option.effectDescription}
                          </p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Crisis History */}
      {crisisHistory.length > 0 && (
        <Section
          title="Crisis History"
          subtitle="Previously resolved situations"
          icon={Shield}
        >
          <div className="space-y-2">
            {crisisHistory.slice(0, 5).map((crisis, idx) => (
              <Card
                key={idx}
                className={cn('p-3', tokens.border.default)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="font-medium text-sm">{crisis.title}</p>
                      <p className={cn('text-[10px]', tokens.text.caption)}>
                        Week {crisis.week} • {crisis.resolution}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-red-500">
                    -${(crisis.cost / 1000000).toFixed(1)}M
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {activeCrises.length === 0 && crisisHistory.length === 0 && (
        <div className={cn('text-center py-12', tokens.border.default, 'border-dashed rounded-xl')}>
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className={tokens.text.label}>No Active Crises</p>
          <p className={cn('text-sm mt-2', tokens.text.caption)}>
            Your studio is operating smoothly
          </p>
        </div>
      )}
    </div>
  );
};

export default CrisisAlertPanel;

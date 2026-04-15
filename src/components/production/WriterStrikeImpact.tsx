import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, PenTool, Clock, DollarSign, Users, AlertOctagon } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tokens } from '@/lib/tokens';

interface AffectedProject {
  projectId: string;
  projectTitle: string;
  status: 'halted' | 'delayed' | 'rewriting' | 'at_risk';
  weeksDelayed: number;
  costImpact: number;
  affectedWriters: string[];
  alternativePlan?: string;
}

interface StrikeMetrics {
  isActive: boolean;
  weekStarted: number;
  estimatedDuration: number;
  weeksElapsed: number;
  industrySolidarity: number; // 0-100
}

interface WriterStrikeImpactProps {
  strike: StrikeMetrics;
  affectedProjects: AffectedProject[];
  totalCostImpact: number;
  onAdjustSchedule?: (projectId: string) => void;
  onHireScabs?: (projectId: string) => void;
}

export const WriterStrikeImpact: React.FC<WriterStrikeImpactProps> = ({
  strike,
  affectedProjects,
  totalCostImpact,
  onAdjustSchedule,
  onHireScabs,
}) => {
  const halted = affectedProjects.filter(p => p.status === 'halted');
  const delayed = affectedProjects.filter(p => p.status === 'delayed');

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'halted': return 'bg-red-500';
      case 'delayed': return 'bg-amber-500';
      case 'rewriting': return 'bg-blue-500';
      case 'at_risk': return 'bg-purple-500';
      default: return 'bg-slate-400';
    }
  };

  if (!strike.isActive) {
    return (
      <div className={cn('text-center py-12', tokens.border.default, 'border-dashed rounded-xl')}>
        <PenTool className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p className={tokens.text.label}>No Active Labor Disputes</p>
        <p className={cn('text-sm mt-2', tokens.text.caption)}>
          WGA and industry unions operating normally
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Strike Alert Banner */}
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertOctagon className="h-6 w-6 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-red-500">WRITER STRIKE IN EFFECT</h3>
            <p className="text-sm text-red-500/70 mt-1">
              Week {strike.weeksElapsed} of estimated {strike.estimatedDuration} week strike
            </p>
          </div>
          <Badge className="bg-red-500 text-white">ACTIVE</Badge>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Halted</p>
              <p className="text-2xl font-bold">{halted.length}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Delayed</p>
              <p className="text-2xl font-bold">{delayed.length}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Cost Impact</p>
              <p className="text-xl font-bold">{formatCurrency(totalCostImpact)}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Solidarity</p>
              <p className="text-2xl font-bold">{strike.industrySolidarity}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Affected Projects */}
      <Section
        title="Affected Productions"
        subtitle={`${affectedProjects.length} projects impacted by strike`}
        icon={AlertTriangle}
      >
        <div className="space-y-3">
          {affectedProjects.map((project) => (
            <Card
              key={project.projectId}
              className={cn(
                'p-4 border-l-4',
                tokens.border.default,
                getStatusColor(project.status)
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-sm">{project.projectTitle}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={cn('text-[9px]', getStatusColor(project.status))}>
                      {project.status.toUpperCase()}
                    </Badge>
                    <span className={cn('text-[10px]', tokens.text.caption)}>
                      {project.weeksDelayed} weeks delayed
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-500">
                    {formatCurrency(project.costImpact)}
                  </p>
                  <p className={cn('text-[10px]', tokens.text.caption)}>cost overrun</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {project.affectedWriters.map((writer, idx) => (
                  <Badge key={idx} variant="outline" className="text-[9px]">
                    <PenTool className="h-3 w-3 mr-1" />
                    {writer}
                  </Badge>
                ))}
              </div>

              {project.alternativePlan && (
                <p className={cn('text-[10px] mb-3', tokens.text.caption)}>
                  Alternative: {project.alternativePlan}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  className="text-[10px] text-primary hover:underline"
                  onClick={() => onAdjustSchedule?.(project.projectId)}
                >
                  Adjust Schedule
                </button>
                <button
                  className="text-[10px] text-red-500 hover:underline"
                  onClick={() => onHireScabs?.(project.projectId)}
                >
                  Hire Non-Union (Risky)
                </button>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default WriterStrikeImpact;

import React from 'react';
import { cn } from '@/lib/utils';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { tokens } from '@/lib/tokens';

interface ProjectRecoupment {
  projectId: string;
  projectTitle: string;
  format: 'film' | 'tv' | 'streaming';
  budget: number;
  revenue: number;
  recouped: number; // percentage
  status: 'in_progress' | 'recouped' | 'profitable' | 'at_risk';
  weeksToBreakEven?: number;
  profitMargin?: number;
}

interface RecoupmentTrackerProps {
  projects: ProjectRecoupment[];
}

export const RecoupmentTracker: React.FC<RecoupmentTrackerProps> = ({ projects }) => {
  const recouped = projects.filter(p => p.status === 'recouped');
  const profitable = projects.filter(p => p.status === 'profitable');
  const atRisk = projects.filter(p => p.status === 'at_risk');
  const inProgress = projects.filter(p => p.status === 'in_progress');

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalRevenue = projects.reduce((sum, p) => sum + p.revenue, 0);
  const overallRecoupment = totalBudget > 0 ? (totalRevenue / totalBudget) * 100 : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'profitable': return 'bg-emerald-500';
      case 'recouped': return 'bg-blue-500';
      case 'at_risk': return 'bg-red-500';
      default: return 'bg-amber-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'profitable': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'recouped': return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case 'at_risk': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <Card className={cn('p-6', tokens.border.default)}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">Studio Recoupment Overview</h3>
            <p className={cn('text-sm', tokens.text.caption)}>
              {projects.length} projects tracked
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{overallRecoupment.toFixed(1)}%</p>
            <p className={cn('text-xs', tokens.text.caption)}>Overall Recoupment</p>
          </div>
        </div>

        <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              overallRecoupment >= 100 ? 'bg-emerald-500' :
              overallRecoupment >= 75 ? 'bg-blue-500' :
              overallRecoupment >= 50 ? 'bg-amber-500' : 'bg-red-500'
            )}
            style={{ width: `${Math.min(overallRecoupment, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-500">{profitable.length}</p>
            <p className={cn('text-[10px]', tokens.text.caption)}>Profitable</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-500">{recouped.length}</p>
            <p className={cn('text-[10px]', tokens.text.caption)}>Recouped</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-500">{inProgress.length}</p>
            <p className={cn('text-[10px]', tokens.text.caption)}>In Progress</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500">{atRisk.length}</p>
            <p className={cn('text-[10px]', tokens.text.caption)}>At Risk</p>
          </div>
        </div>
      </Card>

      {/* At Risk Projects */}
      {atRisk.length > 0 && (
        <Section
          title="At Risk Projects"
          subtitle="Projects failing to recoup investment"
          icon={AlertCircle}
        >
          <div className="space-y-3">
            {atRisk.map((project) => (
              <Card
                key={project.projectId}
                className={cn('p-4 border-l-4 border-l-red-500', tokens.border.default)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(project.status)}
                    <div>
                      <h4 className="font-bold text-sm">{project.projectTitle}</h4>
                      <p className={cn('text-[10px]', tokens.text.caption)}>
                        {project.format.toUpperCase()} • Budget: {formatCurrency(project.budget)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-500">{project.recouped.toFixed(1)}%</p>
                    <p className={cn('text-[10px]', tokens.text.caption)}>
                      {formatCurrency(project.revenue)} / {formatCurrency(project.budget)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Project Breakdown */}
      <Section
        title="Project Recoupment Status"
        subtitle="Individual project performance"
        icon={TrendingUp}
      >
        <div className="space-y-3">
          {[...profitable, ...recouped, ...inProgress].map((project) => (
            <Card
              key={project.projectId}
              className={cn('p-4', tokens.border.default)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(project.status)}
                  <div>
                    <h4 className="font-bold text-sm">{project.projectTitle}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[9px]">
                        {project.format.toUpperCase()}
                      </Badge>
                      {project.status === 'profitable' && (
                        <Badge className="text-[9px] bg-emerald-500/20 text-emerald-500">
                          +{project.profitMargin?.toFixed(0)}% profit
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'text-xl font-bold',
                    project.recouped >= 100 ? 'text-emerald-500' : 'text-amber-500'
                  )}>
                    {project.recouped.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className={tokens.text.caption}>Recoupment Progress</span>
                  <span>{formatCurrency(project.revenue)} / {formatCurrency(project.budget)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', getStatusColor(project.status))}
                    style={{ width: `${Math.min(project.recouped, 100)}%` }}
                  />
                </div>
                {project.weeksToBreakEven !== undefined && project.weeksToBreakEven > 0 && (
                  <p className={cn('text-[10px]', tokens.text.caption)}>
                    Est. {project.weeksToBreakEven} weeks to break even
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default RecoupmentTracker;

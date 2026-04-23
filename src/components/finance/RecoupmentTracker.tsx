import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      case 'profitable': return 'bg-emerald-400';
      case 'recouped': return 'bg-primary';
      case 'at_risk': return 'bg-red-400';
      default: return 'bg-amber-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'profitable': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'recouped': return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case 'at_risk': return <AlertCircle className="h-4 w-4 text-red-400" />;
      default: return <Clock className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Overall Summary */}
      <Card className="glass-card p-12 overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />
        <div className="relative z-10 flex items-center justify-between mb-12">
          <div className="space-y-3">
            <h3 className="font-display font-black text-2xl uppercase tracking-tighter italic">Studio Recoupment Analytics</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">
              {projects.length} PROPERTIES UNDER ACTIVE FISCAL TRACKING
            </p>
          </div>
          <div className="text-right">
            <p className="text-6xl font-display font-black tracking-tighter italic text-foreground leading-none">{overallRecoupment.toFixed(1)}%</p>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 italic mt-3">AGGREGATE RECOVERY INDEX</p>
          </div>
        </div>

        <div className="h-2 bg-white/5 rounded-none overflow-hidden mb-12 relative z-10">
          <div
            className={cn(
              'h-full rounded-none transition-all duration-1000 shadow-[0_0_20px_rgba(var(--primary),0.4)]',
              overallRecoupment >= 100 ? 'bg-emerald-400' :
              overallRecoupment >= 75 ? 'bg-primary' :
              overallRecoupment >= 50 ? 'bg-amber-400' : 'bg-red-400'
            )}
            style={{ width: `${Math.min(overallRecoupment, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-8 text-center relative z-10">
          <div className="space-y-3">
            <p className="text-4xl font-display font-black text-emerald-400 italic leading-none">{profitable.length}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">PROFITABLE</p>
          </div>
          <div className="space-y-3">
            <p className="text-4xl font-display font-black text-primary italic leading-none">{recouped.length}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">RECOUPED</p>
          </div>
          <div className="space-y-3">
            <p className="text-4xl font-display font-black text-amber-400 italic leading-none">{inProgress.length}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">IN PROGRESS</p>
          </div>
          <div className="space-y-3">
            <p className="text-4xl font-display font-black text-red-400 italic leading-none">{atRisk.length}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">AT RISK</p>
          </div>
        </div>
      </Card>

      {/* At Risk Projects */}
      {atRisk.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]" />
            <h3 className="text-xs font-display font-black uppercase tracking-[0.3em] italic text-red-400">At Risk Assets // Yield Deficit</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {atRisk.map((project) => (
              <Card
                key={project.projectId}
                className="glass-card p-8 border-l-4 border-l-red-400 group hover:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {getStatusIcon(project.status)}
                    <div>
                      <h4 className="font-display font-black text-lg uppercase tracking-tighter italic leading-none mb-2">{project.projectTitle}</h4>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic">
                        {project.format} // BUDGET: {formatCurrency(project.budget)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-display font-black text-red-400 italic leading-none">{project.recouped.toFixed(1)}%</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic mt-2">
                      {formatCurrency(project.revenue)} RECOVERED
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Project Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-1.5 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
          <h3 className="text-xs font-display font-black uppercase tracking-[0.3em] italic text-foreground">Operational Performance // Yield Audit</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...profitable, ...recouped, ...inProgress].map((project) => (
            <Card
              key={project.projectId}
              className="glass-card p-10 hover:bg-white/[0.03] transition-all duration-700"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  {getStatusIcon(project.status)}
                  <div>
                    <h4 className="font-display font-black text-xl uppercase tracking-tighter italic leading-none mb-3">{project.projectTitle}</h4>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-[8px] font-black tracking-[0.2em] uppercase rounded-none border-white/5 h-5 px-2 text-muted-foreground/40">
                        {project.format}
                      </Badge>
                      {project.status === 'profitable' && (
                        <Badge className="text-[8px] font-black tracking-[0.2em] uppercase rounded-none bg-emerald-400/10 text-emerald-400 h-5 px-2 border-none">
                          +{project.profitMargin?.toFixed(0)}% MARGIN
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'text-3xl font-display font-black italic leading-none',
                    project.recouped >= 100 ? 'text-emerald-400' : 'text-primary'
                  )}>
                    {project.recouped.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] italic">
                  <span className="text-muted-foreground/20">RECOVERY PROGRESS</span>
                  <span className="text-foreground">{formatCurrency(project.revenue)} / {formatCurrency(project.budget)}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-none overflow-hidden">
                  <div
                    className={cn('h-full rounded-none transition-all duration-1000', getStatusColor(project.status))}
                    style={{ width: `${Math.min(project.recouped, 100)}%` }}
                  />
                </div>
                {project.weeksToBreakEven !== undefined && project.weeksToBreakEven > 0 && (
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic">
                    EST. {project.weeksToBreakEven} WEEKS TO BREAK EVEN
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecoupmentTracker;

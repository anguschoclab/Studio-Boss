import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Play, DollarSign, Users, Clock, ShieldAlert, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tokens } from '@/lib/tokens';
import type { Project } from '@/engine/types';
import type { Contract } from '@/engine/types/talent.types';
import type { Talent } from '@/engine/types/talent.types';
import { roleCompletenessScore, scheduleCertainty } from '@/engine/systems/greenlight';

interface GreenlightQueueProps {
  projects: Project[];
  onApprove?: (projectId: string) => void;
  onReject?: (projectId: string) => void;
  onReview?: (projectId: string) => void;
  /** All studio contracts — used for role completeness scoring */
  contracts?: Record<string, Contract>;
  /** All studio talent — used to resolve contract roles */
  talents?: Record<string, Talent>;
}

// ── Label helpers (UI-only; scoring lives in the engine) ───────────────────

function roleCompletenessLabel(score: number): { label: string; color: string } {
  if (score >= 100) return { label: 'Fully Cast',    color: 'text-success' };
  if (score >= 67)  return { label: 'Missing Role',  color: 'text-warning' };
  return               { label: 'Incomplete',        color: 'text-destructive' };
}

function scheduleCertaintyLabel(score: number): { label: string; color: string } {
  if (score > 70) return { label: 'On Track',      color: 'text-success' };
  if (score >= 40) return { label: 'Moderate Risk', color: 'text-warning' };
  return               { label: 'High Risk',        color: 'text-destructive' };
}

// ── Component ──────────────────────────────────────────────────────────────

export const GreenlightQueue: React.FC<GreenlightQueueProps> = ({
  projects,
  onApprove,
  onReject,
  onReview,
  contracts = {},
  talents  = {},
}) => {
  if (projects.length === 0) {
    return (
      <div className={cn('text-center py-12', tokens.border.default, 'border-dashed rounded-none')}>
        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p className={tokens.text.label}>No Projects Awaiting Greenlight</p>
        <p className={cn(tokens.text.caption, 'mt-2')}>
          Projects ready for approval will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {projects.map((project) => {
        const roleScore   = roleCompletenessScore(project.id, contracts, talents);
        const roleInfo    = roleCompletenessLabel(roleScore);
        const schedScore  = scheduleCertainty(project);
        const schedInfo   = scheduleCertaintyLabel(schedScore);
        const schedPct    = Math.round(schedScore);

        return (
          <Card
            key={project.id}
            className={cn(
              'p-4 border-l-4 border-l-primary',
              tokens.border.default,
              'hover:shadow-md transition-all'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base truncate">{project.title}</h4>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {project.genre}
                  </Badge>
                </div>

                {/* Core stats row */}
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className={cn('text-xs', tokens.text.caption)}>
                      Budget: ${(project.budget / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className={cn('text-xs', tokens.text.caption)}>
                      {project.developmentWeeks || 0} weeks in dev
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className={cn('text-xs', tokens.text.caption)}>
                      {project.awards?.length || 0} awards
                    </span>
                  </div>
                </div>

                {/* Evaluation row: Role Completeness + Schedule Certainty */}
                <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                  {/* Role completeness */}
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className={cn('text-[11px] font-bold', roleInfo.color)}>
                      {roleInfo.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">({roleScore}%)</span>
                  </div>

                  {/* Schedule certainty */}
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Schedule</span>
                    {/* Mini progress bar */}
                    <div className="w-16 h-1.5 bg-slate-800 rounded-none overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-none transition-all',
                          schedScore > 70  ? 'bg-success'      :
                          schedScore >= 40 ? 'bg-warning'      :
                          'bg-destructive'
                        )}
                        style={{ width: `${schedPct}%` }}
                      />
                    </div>
                    <span className={cn('text-[11px] font-bold', schedInfo.color)}>
                      {schedInfo.label}
                    </span>
                  </div>
                </div>

                {project.flavor && (
                  <p className={cn('text-xs mt-2 line-clamp-2', tokens.text.caption)}>
                    {project.flavor}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 ml-4">
                {onReview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReview(project.id)}
                    className="text-xs"
                  >
                    <Play className="h-3.5 w-3.5 mr-1" />
                    Review
                  </Button>
                )}
                <div className="flex gap-2">
                  {onReject && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReject(project.id)}
                      className="text-xs border-destructive/30 hover:bg-destructive/10"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {onApprove && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onApprove(project.id)}
                      className="text-xs"
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Greenlight
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default GreenlightQueue;

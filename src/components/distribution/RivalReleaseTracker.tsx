import React from 'react';
import { cn } from '@/lib/utils';
import { Building2, Calendar, Target, AlertTriangle } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tokens } from '@/lib/tokens';

interface RivalRelease {
  studioId: string;
  studioName: string;
  projectTitle: string;
  releaseDate: number; // week number
  genre: string;
  budgetTier: 'blockbuster' | 'mid' | 'low';
  targetOverlap: number; // percentage of audience overlap with your projects
  threatLevel: 'high' | 'medium' | 'low';
  projectedOpening: number;
}

interface RivalReleaseTrackerProps {
  releases: RivalRelease[];
  yourReleases: {
    week: number;
    title: string;
  }[];
}

export const RivalReleaseTracker: React.FC<RivalReleaseTrackerProps> = ({
  releases,
  yourReleases,
}) => {
  const highThreat = releases.filter(r => r.threatLevel === 'high');
  const sameWeekConflicts = releases.filter(r => 
    yourReleases.some(y => y.week === r.releaseDate)
  );

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const getThreatBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge className="text-[9px] bg-red-500/20 text-red-500">High Threat</Badge>;
      case 'medium':
        return <Badge className="text-[9px] bg-amber-500/20 text-amber-500">Medium</Badge>;
      default:
        return <Badge variant="outline" className="text-[9px]">Low</Badge>;
    }
  };

  const getBudgetBadge = (tier: string) => {
    const colors: Record<string, string> = {
      blockbuster: 'bg-purple-500/20 text-purple-500',
      mid: 'bg-blue-500/20 text-blue-500',
      low: 'bg-slate-500/20 text-slate-500',
    };
    return (
      <Badge className={cn('text-[9px]', colors[tier] || colors.low)}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  // Group by week
  const byWeek = releases.reduce((acc, release) => {
    const week = release.releaseDate;
    if (!acc[week]) acc[week] = [];
    acc[week].push(release);
    return acc;
  }, {} as Record<number, RivalRelease[]>);

  const sortedWeeks = Object.keys(byWeek).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Conflict Warning */}
      {sameWeekConflicts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div>
            <p className="font-medium text-amber-500">Release Date Conflicts Detected</p>
            <p className="text-sm text-amber-500/70">
              {sameWeekConflicts.length} rival release{sameWeekConflicts.length > 1 ? 's' : ''} competing with your slate
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Target className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>High Threat</p>
              <p className="text-2xl font-bold">{highThreat.length}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Conflicts</p>
              <p className="text-2xl font-bold">{sameWeekConflicts.length}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Rival Studios</p>
              <p className="text-2xl font-bold">
                {new Set(releases.map(r => r.studioId)).size}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Release Calendar */}
      <Section
        title="Rival Release Calendar"
        subtitle="Competitive landscape by week"
        icon={Calendar}
      >
        {sortedWeeks.length === 0 ? (
          <div className={cn('text-center py-8', tokens.border.default, 'border-dashed rounded-xl')}>
            <Building2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className={cn('text-sm', tokens.text.caption)}>
              No upcoming rival releases detected
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedWeeks.map((week) => {
              const hasConflict = yourReleases.some(y => y.week === week);
              return (
                <Card
                  key={week}
                  className={cn(
                    'p-4',
                    tokens.border.default,
                    hasConflict && 'border-amber-500/50 bg-amber-500/5'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <h4 className="font-bold text-sm">Week {week}</h4>
                      {hasConflict && (
                        <Badge className="text-[9px] bg-amber-500/20 text-amber-500">
                          CONFLICT
                        </Badge>
                      )}
                    </div>
                    <span className={cn('text-[10px]', tokens.text.caption)}>
                      {byWeek[week].length} release{byWeek[week].length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {byWeek[week].map((release) => (
                      <div
                        key={`${release.studioId}-${release.projectTitle}`}
                        className="flex items-center justify-between p-2 bg-muted/30 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{release.studioName}</span>
                          <span className="text-sm">{release.projectTitle}</span>
                          {getBudgetBadge(release.budgetTier)}
                          <Badge variant="outline" className="text-[9px]">
                            {release.genre}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          {getThreatBadge(release.threatLevel)}
                          <span className={cn('text-[10px]', tokens.text.caption)}>
                            Est. {formatCurrency(release.projectedOpening)} opening
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
};

export default RivalReleaseTracker;

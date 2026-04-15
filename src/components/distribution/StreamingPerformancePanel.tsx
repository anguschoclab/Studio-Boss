import React from 'react';
import { cn } from '@/lib/utils';
import { Tv, Eye, Clock, TrendingUp, Globe, Users } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tokens } from '@/lib/tokens';

interface PlatformMetrics {
  platformName: string;
  subscribers: number;
  hoursWatched: number;
  completionRate: number; // percentage
  trending: 'up' | 'stable' | 'down';
  topTerritory: string;
}

interface StreamingPerformancePanelProps {
  projects: {
    projectId: string;
    projectTitle: string;
    platforms: PlatformMetrics[];
    totalHoursWatched: number;
    avgCompletionRate: number;
  }[];
  totalSubscribers: number;
  growthRate: number; // percentage
}

export const StreamingPerformancePanel: React.FC<StreamingPerformancePanelProps> = ({
  projects,
  totalSubscribers,
  growthRate,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Streaming Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Subscribers</p>
              <p className="text-xl font-bold">{formatNumber(totalSubscribers)}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Growth</p>
              <p className={cn('text-xl font-bold', growthRate > 0 ? 'text-emerald-500' : 'text-red-500')}>
                {growthRate > 0 ? '+' : ''}{growthRate}%
              </p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Eye className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Total Views</p>
              <p className="text-xl font-bold">{projects.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Project Performance */}
      <Section
        title="Streaming Performance"
        subtitle="Viewership metrics by platform"
        icon={Tv}
      >
        {projects.length === 0 ? (
          <div className={cn('text-center py-8', tokens.border.default, 'border-dashed rounded-xl')}>
            <Tv className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className={cn('text-sm', tokens.text.caption)}>
              No streaming projects currently
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <Card
                key={project.projectId}
                className={cn('p-4', tokens.border.default)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm">{project.projectTitle}</h4>
                  <Badge variant="outline" className="text-[9px]">
                    <Eye className="h-3 w-3 mr-1" />
                    {formatNumber(project.totalHoursWatched)} hrs watched
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project.platforms.map((platform) => (
                    <div
                      key={platform.platformName}
                      className="p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Tv className="h-4 w-4" />
                          <span className="font-medium text-sm">{platform.platformName}</span>
                        </div>
                        {getTrendIcon(platform.trending)}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div>
                          <p className={tokens.text.caption}>Subscribers</p>
                          <p className="font-medium">{formatNumber(platform.subscribers)}</p>
                        </div>
                        <div>
                          <p className={tokens.text.caption}>Hours</p>
                          <p className="font-medium">{formatNumber(platform.hoursWatched)}</p>
                        </div>
                        <div>
                          <p className={tokens.text.caption}>Completion</p>
                          <p className="font-medium">{platform.completionRate}%</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-2 text-[10px]">
                        <Globe className="h-3 w-3" />
                        <span className={tokens.text.caption}>
                          Top: {platform.topTerritory}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default StreamingPerformancePanel;

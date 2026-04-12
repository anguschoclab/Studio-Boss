import React from 'react';
import { cn } from '@/lib/utils';
import { Zap, TrendingUp, Users, Newspaper, Award } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tokens } from '@/lib/tokens';

interface BuzzSource {
  type: 'social' | 'press' | 'awards' | 'talent' | 'controversy' | 'viral';
  value: number;
  description: string;
}

interface ProjectBuzz {
  projectId: string;
  projectTitle: string;
  totalBuzz: number; // 0-100
  trend: 'rising' | 'stable' | 'falling';
  sources: BuzzSource[];
  audienceSentiment: 'positive' | 'mixed' | 'negative';
  pressCoverage: number; // number of articles
}

interface BuzzMeterProps {
  projects: ProjectBuzz[];
  studioBuzz: number;
  industryRank: number;
}

export const BuzzMeter: React.FC<BuzzMeterProps> = ({
  projects,
  studioBuzz,
  industryRank,
}) => {
  const hotProjects = projects.filter(p => p.totalBuzz >= 70);
  const trendingUp = projects.filter(p => p.trend === 'rising');
  const trendingDown = projects.filter(p => p.trend === 'falling');

  const getBuzzColor = (buzz: number) => {
    if (buzz >= 80) return 'bg-red-500';
    if (buzz >= 60) return 'bg-amber-500';
    if (buzz >= 40) return 'bg-yellow-500';
    return 'bg-slate-400';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'falling': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'social': return <Users className="h-3 w-3" />;
      case 'press': return <Newspaper className="h-3 w-3" />;
      case 'awards': return <Award className="h-3 w-3" />;
      case 'talent': return <Zap className="h-3 w-3" />;
      default: return <Zap className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Buzz Summary */}
      <Card className={cn('p-6', tokens.border.default)}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">Studio Buzz Index</h3>
            <p className={cn('text-sm', tokens.text.caption)}>
              Industry rank: #{industryRank}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-amber-500" />
              <span className="text-4xl font-bold">{studioBuzz}</span>
            </div>
            <p className={cn('text-xs', tokens.text.caption)}>/100</p>
          </div>
        </div>

        <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className={cn('h-full rounded-full', getBuzzColor(studioBuzz))}
            style={{ width: `${studioBuzz}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-red-500">{hotProjects.length}</p>
            <p className={cn('text-[10px]', tokens.text.caption)}>Hot Projects</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-500">{trendingUp.length}</p>
            <p className={cn('text-[10px]', tokens.text.caption)}>Trending Up</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500">{trendingDown.length}</p>
            <p className={cn('text-[10px]', tokens.text.caption)}>Trending Down</p>
          </div>
        </div>
      </Card>

      {/* Project Buzz Rankings */}
      <Section
        title="Project Buzz Rankings"
        subtitle="Public awareness and anticipation levels"
        icon={Zap}
      >
        {projects.length === 0 ? (
          <div className={cn('text-center py-8', tokens.border.default, 'border-dashed rounded-xl')}>
            <Zap className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className={cn('text-sm', tokens.text.caption)}>
              No active projects generating buzz
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects
              .sort((a, b) => b.totalBuzz - a.totalBuzz)
              .map((project, index) => (
              <Card
                key={project.projectId}
                className={cn('p-4', tokens.border.default)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm">{project.projectTitle}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {getTrendIcon(project.trend)}
                        <Badge 
                          variant={project.audienceSentiment === 'positive' ? 'default' : 'secondary'}
                          className="text-[9px]"
                        >
                          {project.audienceSentiment} sentiment
                        </Badge>
                        <span className={cn('text-[10px]', tokens.text.caption)}>
                          {project.pressCoverage} press mentions
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'text-2xl font-bold',
                      project.totalBuzz >= 70 ? 'text-red-500' :
                      project.totalBuzz >= 50 ? 'text-amber-500' : 'text-muted-foreground'
                    )}>
                      {project.totalBuzz}
                    </p>
                    <p className={cn('text-[10px]', tokens.text.caption)}>Buzz Score</p>
                  </div>
                </div>

                <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                  <div
                    className={cn('h-full rounded-full', getBuzzColor(project.totalBuzz))}
                    style={{ width: `${project.totalBuzz}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.sources.map((source, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px]">
                      {getSourceIcon(source.type)}
                      <span className="ml-1">{source.type}: +{source.value}</span>
                    </Badge>
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

export default BuzzMeter;

import React from 'react';
import { cn } from '@/lib/utils';
import { Zap, TrendingUp, Users, Newspaper, Award } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Badge } from '@/components/ui/badge';

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Studio Buzz Summary */}
      {/* Studio Buzz Index */}
      <div className={cn('p-10 rounded-none border border-white/5 bg-white/[0.01] backdrop-blur-3xl shadow-2xl relative overflow-hidden group')}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:opacity-100 opacity-50 transition-opacity" />
        
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div>
            <h3 className="text-xl font-display font-black uppercase italic tracking-tight text-foreground leading-none mb-3">STUDIO_BUZZ_INDEX</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic">
              INDUSTRY_RANK: #{industryRank}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-4">
              <Zap className="h-8 w-8 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.4)]" strokeWidth={3} />
              <span className="text-6xl font-display font-black italic tracking-tighter text-primary drop-shadow-[0_0_30px_rgba(var(--primary),0.2)]">{studioBuzz}</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/10 italic">OUT_OF_100</p>
          </div>
        </div>

        <div className="h-2 bg-black/40 rounded-none overflow-hidden mb-10 border border-white/5 relative">
          <div
            className={cn('h-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all duration-1000')}
            style={{ width: `${studioBuzz}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-10 text-center relative z-10">
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-none">
            <p className="text-3xl font-display font-black text-red-500 italic tracking-tighter mb-1">{hotProjects.length}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic">HOT_PROJECTS</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-none">
            <p className="text-3xl font-display font-black text-emerald-500 italic tracking-tighter mb-1">{trendingUp.length}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic">TRENDING_UP</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-none">
            <p className="text-3xl font-display font-black text-red-500 italic tracking-tighter mb-1">{trendingDown.length}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic">TRENDING_DOWN</p>
          </div>
        </div>
      </div>

      {/* Project Buzz Rankings */}
      <Section
        title="PROJECT_BUZZ_RANKINGS"
        subtitle="PUBLIC AWARENESS AND ANTICIPATION LEVELS"
        icon={Zap}
      >
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-none">
            <Zap className="h-12 w-12 mx-auto mb-6 opacity-5" strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 italic">
              NO_ACTIVE_PROJECTS_GENERATING_BUZZ
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects
              .sort((a, b) => b.totalBuzz - a.totalBuzz)
              .map((project, index) => (
              <div
                key={project.projectId}
                className="p-8 bg-white/[0.01] border border-white/5 rounded-none hover:border-primary/40 transition-all duration-700 shadow-xl relative overflow-hidden group/item"
              >
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <span className="text-4xl font-display font-black text-muted-foreground/5 italic group-hover/item:text-primary/10 transition-colors">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4 className="text-lg font-black uppercase italic tracking-tight text-foreground leading-none mb-3 group-hover/item:text-primary transition-colors">{project.projectTitle}</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(project.trend)}
                        </div>
                        <Badge 
                          variant="outline"
                          className="text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary rounded-none italic bg-primary/5"
                        >
                          {project.audienceSentiment} SENTIMENT
                        </Badge>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic">
                          {project.pressCoverage} PRESS_MENTIONS
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'text-4xl font-display font-black italic tracking-tighter drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]',
                      project.totalBuzz >= 70 ? 'text-red-500' :
                      project.totalBuzz >= 50 ? 'text-primary' : 'text-muted-foreground/40'
                    )}>
                      {project.totalBuzz}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/10 italic">BUZZ_SCORE</p>
                  </div>
                </div>

                <div className="h-1 bg-black/40 rounded-none overflow-hidden mb-6 border border-white/5">
                  <div
                    className={cn('h-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-1000', getBuzzColor(project.totalBuzz))}
                    style={{ width: `${project.totalBuzz}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-3 relative z-10">
                  {project.sources.map((source, idx) => (
                    <Badge key={idx} variant="outline" className="text-[8px] font-black uppercase tracking-widest border-white/5 bg-white/[0.02] text-muted-foreground/40 rounded-none italic py-1 px-3">
                      {getSourceIcon(source.type)}
                      <span className="ml-2">{source.type.toUpperCase()}: +{source.value}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default BuzzMeter;

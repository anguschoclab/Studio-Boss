import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Star, Calendar, Film, Tv, Medal } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tokens } from '@/lib/tokens';

interface AwardNomination {
  awardBody: string;
  category: string;
  nominationDate: number; // week number
  ceremonyDate: number; // week number
  odds: number; // 0-100 winning probability
  status: 'submitted' | 'shortlisted' | 'nominated' | 'won' | 'lost';
  buzzBonus: number;
}

interface ProjectAwards {
  projectId: string;
  projectTitle: string;
  format: 'film' | 'tv';
  nominations: AwardNomination[];
  wins: number;
  totalNominations: number;
}

interface AwardsTrackerProps {
  projects: ProjectAwards[];
  studioRank: number;
  totalWins: number;
  totalNominations: number;
}

export const AwardsTracker: React.FC<AwardsTrackerProps> = ({
  projects,
  studioRank,
  totalWins,
  totalNominations,
}) => {
  const upcomingCeremonies = projects.flatMap(p =>
    p.nominations
      .filter(n => n.status === 'nominated' || n.status === 'shortlisted')
      .map(n => ({ ...n, projectTitle: p.projectTitle }))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'bg-emerald-500';
      case 'nominated': return 'bg-amber-500';
      case 'shortlisted': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'won':
        return <Badge className="text-[9px] bg-emerald-500/20 text-emerald-500">Won</Badge>;
      case 'nominated':
        return <Badge className="text-[9px] bg-amber-500/20 text-amber-500">Nominated</Badge>;
      case 'shortlisted':
        return <Badge variant="outline" className="text-[9px]">Shortlisted</Badge>;
      default:
        return <Badge variant="secondary" className="text-[9px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Studio Awards Summary */}
      <Card className={cn('p-6', tokens.border.default)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-amber-500/10">
              <Trophy className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Awards Season Tracker</h3>
              <p className={cn('text-sm', tokens.text.caption)}>
                Industry rank: #{studioRank}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-3xl font-bold">
              <Medal className="h-6 w-6 text-emerald-500" />
              {totalWins}
            </div>
            <p className={cn('text-xs', tokens.text.caption)}>
              {totalNominations} total nominations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-500">{totalWins}</p>
            <p className={cn('text-[10px]', tokens.text.caption)}>Wins</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-500">{upcomingCeremonies.length}</p>
            <p className={cn('text-[10px]', tokens.text.caption)}>Pending</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{projects.length}</p>
            <p className={cn('text-[10px]', tokens.text.caption)}>Projects Submitted</p>
          </div>
        </div>
      </Card>

      {/* Upcoming Ceremonies */}
      {upcomingCeremonies.length > 0 && (
        <Section
          title="Upcoming Ceremonies"
          subtitle={`${upcomingCeremonies.length} nominations awaiting results`}
          icon={Calendar}
        >
          <div className="space-y-3">
            {upcomingCeremonies.map((nom, idx) => (
              <Card
                key={`${nom.awardBody}-${idx}`}
                className={cn('p-4', tokens.border.default)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <h4 className="font-bold text-sm">{nom.awardBody}</h4>
                    {getStatusBadge(nom.status)}
                  </div>
                  <span className={cn('text-[10px]', tokens.text.caption)}>
                    Week {nom.ceremonyDate}
                  </span>
                </div>

                <p className="text-sm mb-2">{nom.category}</p>
                <p className={cn('text-[10px]', tokens.text.caption)}>
                  Project: {nom.projectTitle}
                </p>

                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={tokens.text.caption}>Win Probability</span>
                    <span className="font-medium">{nom.odds}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', getStatusColor(nom.status))}
                      style={{ width: `${nom.odds}%` }}
                    />
                  </div>
                </div>

                {nom.buzzBonus > 0 && (
                  <p className="text-[10px] mt-2 text-emerald-500">
                    +{nom.buzzBonus} buzz bonus if won
                  </p>
                )}
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Project Awards Breakdown */}
      <Section
        title="Project Awards Status"
        subtitle="Awards by project"
        icon={Film}
      >
        {projects.length === 0 ? (
          <div className={cn('text-center py-8', tokens.border.default, 'border-dashed rounded-xl')}>
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className={cn('text-sm', tokens.text.caption)}>
              No awards submissions yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <Card
                key={project.projectId}
                className={cn('p-4', tokens.border.default)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {project.format === 'tv' ? (
                      <Tv className="h-4 w-4" />
                    ) : (
                      <Film className="h-4 w-4" />
                    )}
                    <h4 className="font-bold text-sm">{project.projectTitle}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-[9px] bg-emerald-500/20 text-emerald-500">
                      {project.wins} wins
                    </Badge>
                    <Badge variant="outline" className="text-[9px]">
                      {project.totalNominations} nominations
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.nominations.map((nom, idx) => (
                    <Badge 
                      key={idx}
                      variant={nom.status === 'won' ? 'default' : 'outline'}
                      className="text-[9px]"
                    >
                      {nom.awardBody}: {nom.category}
                      {nom.status === 'won' && ' 🏆'}
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

export default AwardsTracker;

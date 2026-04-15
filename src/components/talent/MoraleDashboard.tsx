import React from 'react';
import { cn } from '@/lib/utils';
import { Smile, AlertTriangle, Users } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tokens } from '@/lib/tokens';
import { TalentNameLink } from '@/components/shared/TalentNameLink';

interface TalentMorale {
  talentId: string;
  talentName: string;
  morale: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  factors: string[];
  atRisk: boolean;
}

interface MoraleDashboardProps {
  moraleData: {
    byTalent: TalentMorale[];
    averageMorale: number;
    atRiskCount: number;
  };
}

export const MoraleDashboard: React.FC<MoraleDashboardProps> = ({ moraleData }) => {
  const { byTalent, averageMorale, atRiskCount } = moraleData;

  const getMoraleColor = (morale: number) => {
    if (morale >= 70) return 'bg-emerald-500';
    if (morale >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const atRiskTalent = byTalent.filter(t => t.atRisk);
  const healthyTalent = byTalent.filter(t => !t.atRisk);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Smile className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Average Morale</p>
              <p className="text-2xl font-bold">{averageMorale}%</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>At Risk</p>
              <p className="text-2xl font-bold">{atRiskCount}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Users className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Tracked Talent</p>
              <p className="text-2xl font-bold">{byTalent.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* At Risk Section */}
      {atRiskTalent.length > 0 && (
        <Section
          title="At-Risk Talent"
          subtitle={`${atRiskTalent.length} talent members need attention`}
          icon={AlertTriangle}
        >
          <div className="space-y-3">
            {atRiskTalent.map((talent) => (
              <Card
                key={talent.talentId}
                className={cn(
                  'p-4 border-l-4 border-l-red-500',
                  tokens.border.default
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <TalentNameLink talentId={talent.talentId} name={talent.talentName} className="font-bold text-sm" />
                    <div className="flex flex-wrap gap-1 mt-1">
                      {talent.factors.map((factor, idx) => (
                        <Badge key={idx} variant="outline" className="text-[9px]">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-500">{talent.morale}%</p>
                    <p className={cn('text-[10px]', tokens.text.caption)}>
                      {talent.trend === 'up' ? '↗ Improving' : 
                       talent.trend === 'down' ? '↘ Declining' : '→ Stable'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* All Talent Morale */}
      <Section
        title="Talent Morale Overview"
        subtitle="Morale levels across your roster"
        icon={Smile}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {healthyTalent.map((talent) => (
            <Card
              key={talent.talentId}
              className={cn('p-3', tokens.border.default)}
            >
              <div className="flex items-center justify-between mb-2">
                <TalentNameLink talentId={talent.talentId} name={talent.talentName} />
                <span className={cn(
                  'text-xs font-bold',
                  talent.morale >= 70 ? 'text-emerald-500' :
                  talent.morale >= 40 ? 'text-amber-500' : 'text-red-500'
                )}>
                  {talent.morale}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', getMoraleColor(talent.morale))}
                  style={{ width: `${talent.morale}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default MoraleDashboard;

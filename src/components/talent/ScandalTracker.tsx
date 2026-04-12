import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Newspaper, Flame, Shield, TrendingDown } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { tokens } from '@/lib/tokens';

interface ScandalEffect {
  type: 'box_office' | 'reputation' | 'talent_relations' | 'awards';
  impact: number;
  duration: number; // weeks
}

interface ActiveScandal {
  talentId: string;
  talentName: string;
  scandalType: 'controversy' | 'legal_issue' | 'personal_drama' | 'professional_dispute';
  severity: 'minor' | 'moderate' | 'major' | 'career_ending';
  headline: string;
  weekStarted: number;
  weeksRemaining: number;
  publicSentiment: 'sympathetic' | 'outraged' | 'divided' | 'indifferent';
  pressCoverage: number; // number of articles
  effects: ScandalEffect[];
  hasInsurance: boolean;
}

interface ScandalTrackerProps {
  activeScandals: ActiveScandal[];
  scandalHistory: {
    talentName: string;
    type: string;
    resolvedWeek: number;
    outcome: 'recovered' | 'career_damage' | 'blacklisted';
  }[];
  onMitigate?: (talentId: string, strategy: 'pr_campaign' | 'lay_low' | 'public_apology' | 'legal_action') => void;
}

export const ScandalTracker: React.FC<ScandalTrackerProps> = ({
  activeScandals,
  scandalHistory,
  onMitigate,
}) => {
  const majorScandals = activeScandals.filter(s => s.severity === 'major' || s.severity === 'career_ending');
  const totalPressCoverage = activeScandals.reduce((sum, s) => sum + s.pressCoverage, 0);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'career_ending': return 'bg-red-600';
      case 'major': return 'bg-red-500';
      case 'moderate': return 'bg-amber-500';
      default: return 'bg-yellow-400';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    const colors: Record<string, string> = {
      sympathetic: 'bg-emerald-500/20 text-emerald-500',
      outraged: 'bg-red-500/20 text-red-500',
      divided: 'bg-amber-500/20 text-amber-500',
      indifferent: 'bg-slate-500/20 text-slate-500',
    };
    return (
      <Badge className={cn('text-[9px]', colors[sentiment])}>
        {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Crisis Alert */}
      {majorScandals.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-500">Major Scandal{majorScandals.length > 1 ? 's' : ''} Active</h3>
              <p className="text-sm text-red-500/70 mt-1">
                {majorScandals.length} talent member{majorScandals.length > 1 ? 's' : ''} in serious reputational crisis
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              activeScandals.length > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'
            )}>
              <AlertTriangle className={cn(
                'h-5 w-5',
                activeScandals.length > 0 ? 'text-red-500' : 'text-emerald-500'
              )} />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Active Scandals</p>
              <p className={cn(
                'text-2xl font-bold',
                activeScandals.length > 0 ? 'text-red-500' : 'text-emerald-500'
              )}>
                {activeScandals.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Newspaper className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Press Coverage</p>
              <p className="text-2xl font-bold">{totalPressCoverage}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Protected</p>
              <p className="text-2xl font-bold">
                {activeScandals.filter(s => s.hasInsurance).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Scandals */}
      {activeScandals.length > 0 && (
        <Section
          title="Active Scandals"
          subtitle="Reputational crises requiring management"
          icon={Flame}
        >
          <div className="space-y-4">
            {activeScandals.map((scandal) => (
              <Card
                key={scandal.talentId}
                className={cn(
                  'p-4 border-l-4',
                  tokens.border.default,
                  getSeverityColor(scandal.severity)
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm">{scandal.talentName}</h4>
                      <Badge className={cn('text-[9px]', getSeverityColor(scandal.severity))}>
                        {scandal.severity.toUpperCase()}
                      </Badge>
                      {scandal.hasInsurance && (
                        <Badge variant="outline" className="text-[9px]">
                          <Shield className="h-3 w-3 mr-1" />
                          Insured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">{scandal.headline}</p>
                  </div>
                  <div className="text-right">
                    {getSentimentBadge(scandal.publicSentiment)}
                    <p className={cn('text-[10px] mt-1', tokens.text.caption)}>
                      Week {scandal.weekStarted} • {scandal.weeksRemaining} weeks left
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3 text-[10px]">
                  <span className={tokens.text.caption}>
                    <Newspaper className="h-3 w-3 inline mr-1" />
                    {scandal.pressCoverage} articles
                  </span>
                  <span className={tokens.text.caption}>
                    Type: {scandal.scandalType.replace('_', ' ')}
                  </span>
                </div>

                {/* Effects */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {scandal.effects.map((effect, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px]">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {effect.type}: -{effect.impact}% ({effect.duration}w)
                    </Badge>
                  ))}
                </div>

                {/* Mitigation Options */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px]"
                    onClick={() => onMitigate?.(scandal.talentId, 'pr_campaign')}
                  >
                    PR Campaign
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px]"
                    onClick={() => onMitigate?.(scandal.talentId, 'lay_low')}
                  >
                    Lay Low
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px]"
                    onClick={() => onMitigate?.(scandal.talentId, 'public_apology')}
                  >
                    Public Apology
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px]"
                    onClick={() => onMitigate?.(scandal.talentId, 'legal_action')}
                  >
                    Legal Action
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Scandal History */}
      {scandalHistory.length > 0 && (
        <Section
          title="Past Scandals"
          subtitle="Resolved reputational incidents"
          icon={Shield}
        >
          <div className="space-y-2">
            {scandalHistory.slice(0, 5).map((scandal, idx) => (
              <Card key={idx} className={cn('p-3', tokens.border.default)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{scandal.talentName}</p>
                    <p className={cn('text-[10px]', tokens.text.caption)}>
                      {scandal.type.replace('_', ' ')} • Week {scandal.resolvedWeek}
                    </p>
                  </div>
                  <Badge 
                    className={cn('text-[9px]', 
                      scandal.outcome === 'recovered' ? 'bg-emerald-500/20 text-emerald-500' :
                      scandal.outcome === 'career_damage' ? 'bg-amber-500/20 text-amber-500' :
                      'bg-red-500/20 text-red-500'
                    )}
                  >
                    {scandal.outcome.replace('_', ' ')}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {activeScandals.length === 0 && scandalHistory.length === 0 && (
        <div className={cn('text-center py-12', tokens.border.default, 'border-dashed rounded-xl')}>
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className={tokens.text.label}>No Scandals</p>
          <p className={cn('text-sm mt-2', tokens.text.caption)}>
            Your talent roster has clean reputations
          </p>
        </div>
      )}
    </div>
  );
};

export default ScandalTracker;

import React from 'react';
import { cn } from '@/lib/utils';
import { Handshake, Clock, DollarSign, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { tokens } from '@/lib/tokens';

interface TalentPact {
  id: string;
  talentName: string;
  pactType: 'overall_deal' | 'first_look' | 'exclusive' | 'consulting';
  weeklyCost: number;
  durationWeeks: number;
  weeksRemaining: number;
  benefits: string[];
  status: 'active' | 'expiring' | 'negotiating';
}

interface TalentPactPanelProps {
  pacts: TalentPact[];
  onRenew?: (pactId: string) => void;
  onTerminate?: (pactId: string) => void;
}

export const TalentPactPanel: React.FC<TalentPactPanelProps> = ({
  pacts,
  onRenew,
  onTerminate,
}) => {
  const activePacts = pacts.filter(p => p.status === 'active');
  const expiringPacts = pacts.filter(p => p.status === 'expiring');
  const totalWeeklyCost = pacts.reduce((sum, p) => sum + p.weeklyCost, 0);

  const getPactTypeLabel = (type: string) => {
    switch (type) {
      case 'overall_deal': return 'Overall Deal';
      case 'first_look': return 'First Look';
      case 'exclusive': return 'Exclusive';
      case 'consulting': return 'Consulting';
      default: return type;
    }
  };

  const renderPactCard = (pact: TalentPact) => (
    <Card
      key={pact.id}
      className={cn(
        'p-4',
        tokens.border.default,
        pact.status === 'expiring' && 'border-l-4 border-l-amber-500',
        pact.status === 'negotiating' && 'border-l-4 border-l-primary'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm">{pact.talentName}</h4>
            <Badge 
              variant={pact.status === 'active' ? 'default' : 'secondary'}
              className="text-[9px]"
            >
              {pact.status}
            </Badge>
          </div>
          <p className={cn('text-[10px]', tokens.text.caption)}>
            {getPactTypeLabel(pact.pactType)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">${(pact.weeklyCost / 1000).toFixed(0)}K</p>
          <p className={cn('text-[10px]', tokens.text.caption)}>/week</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 text-[10px]">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{pact.weeksRemaining} weeks left</span>
        </div>
        <div className="flex items-center gap-1">
          <Handshake className="h-3 w-3" />
          <span>{pact.durationWeeks} week term</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {pact.benefits.map((benefit, idx) => (
          <Badge key={idx} variant="outline" className="text-[9px]">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {benefit}
          </Badge>
        ))}
      </div>

      {pact.status === 'expiring' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
          <Button 
            size="sm" 
            variant="outline"
            className="h-7 text-[10px]"
            onClick={() => onTerminate?.(pact.id)}
          >
            Terminate
          </Button>
          <Button 
            size="sm"
            className="h-7 text-[10px]"
            onClick={() => onRenew?.(pact.id)}
          >
            Renew
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Handshake className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Active Pacts</p>
              <p className="text-2xl font-bold">{activePacts.length}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Expiring Soon</p>
              <p className="text-2xl font-bold">{expiringPacts.length}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <DollarSign className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Weekly Cost</p>
              <p className="text-2xl font-bold">${(totalWeeklyCost / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Expiring Pacts */}
      {expiringPacts.length > 0 && (
        <Section
          title="Expiring Soon"
          subtitle={`${expiringPacts.length} pacts need renewal decision`}
          icon={AlertTriangle}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {expiringPacts.map(renderPactCard)}
          </div>
        </Section>
      )}

      {/* Active Pacts */}
      <Section
        title="Active Talent Pacts"
        subtitle={`${activePacts.length} ongoing agreements`}
        icon={Handshake}
      >
        {activePacts.length === 0 ? (
          <div className={cn('text-center py-8', tokens.border.default, 'border-dashed rounded-xl')}>
            <Handshake className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className={cn('text-sm', tokens.text.caption)}>
              No active talent pacts
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activePacts.map(renderPactCard)}
          </div>
        )}
      </Section>
    </div>
  );
};

export default TalentPactPanel;

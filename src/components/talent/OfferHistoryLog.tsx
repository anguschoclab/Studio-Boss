import React from 'react';
import { cn } from '@/lib/utils';
import { History, DollarSign, CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tokens } from '@/lib/tokens';

interface OfferAction {
  type: 'made' | 'countered' | 'accepted' | 'rejected' | 'expired';
  date: number; // week number
  amount: number;
  by: 'player' | 'talent' | 'agent';
  note?: string;
}

interface OfferHistory {
  offerId: string;
  talentName: string;
  talentId: string;
  role: string;
  projectTitle?: string;
  initialOffer: number;
  finalAmount?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  actions: OfferAction[];
  weeksActive: number;
}

interface OfferHistoryLogProps {
  offers: OfferHistory[];
  onViewOffer?: (offerId: string) => void;
}

export const OfferHistoryLog: React.FC<OfferHistoryLogProps> = ({
  offers,
  onViewOffer,
}) => {
  const pending = offers.filter(o => o.status === 'pending');
  const resolved = offers.filter(o => o.status !== 'pending');

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="text-[9px] bg-emerald-500/20 text-emerald-500">Accepted</Badge>;
      case 'rejected':
        return <Badge className="text-[9px] bg-red-500/20 text-red-500">Rejected</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="text-[9px]">Expired</Badge>;
      default:
        return <Badge className="text-[9px] bg-amber-500/20 text-amber-500">Pending</Badge>;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'made': return <DollarSign className="h-3 w-3" />;
      case 'accepted': return <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
      case 'rejected': return <XCircle className="h-3 w-3 text-red-500" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const renderOfferCard = (offer: OfferHistory) => (
    <Card
      key={offer.offerId}
      className={cn('p-4', tokens.border.default)}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm">{offer.talentName}</h4>
            {getStatusBadge(offer.status)}
          </div>
          <p className={cn('text-[10px]', tokens.text.caption)}>
            {offer.role}
            {offer.projectTitle && ` • ${offer.projectTitle}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{formatCurrency(offer.initialOffer)}</p>
          {offer.finalAmount && offer.finalAmount !== offer.initialOffer && (
            <p className={cn('text-[10px]', tokens.text.caption)}>
              Final: {formatCurrency(offer.finalAmount)}
            </p>
          )}
        </div>
      </div>

      {/* Offer Timeline */}
      <div className="space-y-2 mb-3">
        {offer.actions.map((action, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[10px]">
            {getActionIcon(action.type)}
            <span className={cn(
              'capitalize',
              action.by === 'player' ? 'text-primary' : 'text-muted-foreground'
            )}>
              {action.by === 'player' ? 'You' : action.by}
            </span>
            <span>{action.type}</span>
            <span className="font-medium">{formatCurrency(action.amount)}</span>
            <span className={tokens.text.caption}>• Week {action.date}</span>
            {action.note && (
              <span className="italic text-muted-foreground">"{action.note}"</span>
            )}
          </div>
        ))}
      </div>

      {offer.status === 'pending' && (
        <button
          className="text-[10px] text-primary hover:underline"
          onClick={() => onViewOffer?.(offer.offerId)}
        >
          View Negotiation →
        </button>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Pending</p>
              <p className="text-2xl font-bold">{pending.length}</p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Accepted</p>
              <p className="text-2xl font-bold">
                {resolved.filter(o => o.status === 'accepted').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className={cn('p-4', tokens.border.default)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <History className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className={cn('text-[10px] uppercase', tokens.text.caption)}>Total Offers</p>
              <p className="text-2xl font-bold">{offers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Offers */}
      {pending.length > 0 && (
        <Section
          title="Pending Offers"
          subtitle={`${pending.length} negotiation${pending.length > 1 ? 's' : ''} in progress`}
          icon={Clock}
        >
          <div className="space-y-3">
            {pending.map(renderOfferCard)}
          </div>
        </Section>
      )}

      {/* Offer History */}
      <Section
        title="Offer History"
        subtitle="Past negotiations and outcomes"
        icon={History}
      >
        {resolved.length === 0 ? (
          <div className={cn('text-center py-8', tokens.border.default, 'border-dashed rounded-xl')}>
            <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className={cn('text-sm', tokens.text.caption)}>
              No offer history yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {resolved.map(renderOfferCard)}
          </div>
        )}
      </Section>
    </div>
  );
};

export default OfferHistoryLog;

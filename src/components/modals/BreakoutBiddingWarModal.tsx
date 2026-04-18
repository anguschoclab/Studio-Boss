import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Zap, DollarSign, Building2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BreakoutBiddingWarModal: React.FC = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const signBreakoutTalent = useGameStore(s => s.signBreakoutTalent);
  const gameState = useGameStore(s => s.gameState);

  if (!activeModal || activeModal.type !== 'BREAKOUT_BIDDING_WAR') return null;

  const {
    talentId = '',
    currentFee = 0,
    competingStudios = [] as string[]
  } = (activeModal.payload || {}) as {
    talentId: string;
    currentFee: number;
    competingStudios: string[];
  };

  const talent = gameState?.entities?.talents?.[talentId];
  const premiumFee = Math.round(currentFee * 1.5);
  const canAfford = (gameState?.finance?.cash ?? 0) >= premiumFee;

  const competitorNames = competingStudios.map(id =>
    gameState?.entities?.rivals?.[id]?.name ?? id
  );

  const handleSign = () => {
    if (talentId) signBreakoutTalent(talentId, premiumFee);
    resolveCurrentModal();
  };

  return (
    <Dialog open onOpenChange={() => resolveCurrentModal()}>
      <DialogContent className="max-w-md border border-primary/40 bg-background">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black uppercase tracking-tight">
                Breakout Bidding War
              </DialogTitle>
              <p className="text-xs text-muted-foreground">Multiple studios are competing</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-base font-black">{talent?.name ?? talentId}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                  {talent?.roles?.join(', ') ?? 'Talent'} • Breakout Star
                </p>
              </div>
            </div>
          </div>

          {competitorNames.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {competitorNames.map(name => (
                <Badge key={name} variant="outline" className="text-[9px] gap-1">
                  <Building2 className="h-2.5 w-2.5" />
                  {name}
                </Badge>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-card/40 border border-border/40 text-center">
              <DollarSign className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Market Rate</p>
              <p className="text-sm font-black">{formatMoney(currentFee)}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Sign at Premium</p>
              <p className="text-sm font-black text-primary">{formatMoney(premiumFee)}</p>
            </div>
          </div>

          {!canAfford && (
            <p className="text-xs text-destructive font-bold text-center">
              Insufficient funds — need {formatMoney(premiumFee - (gameState?.finance?.cash ?? 0))} more
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => resolveCurrentModal()}
            >
              Pass
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 font-bold"
              onClick={handleSign}
              disabled={!canAfford}
            >
              <Star className="h-4 w-4 mr-2" />
              Sign at {formatMoney(premiumFee)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BreakoutBiddingWarModal;

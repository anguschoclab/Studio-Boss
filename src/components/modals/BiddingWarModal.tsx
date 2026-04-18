import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swords, Building2, DollarSign, AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BiddingWarModal: React.FC = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const resolveMerger = useGameStore(s => s.resolveMerger);

  if (!activeModal || activeModal.type !== 'BIDDING_WAR') return null;

  const {
    attackerId = '',
    attackerName = 'Unknown Rival',
    targetId = '',
    targetName = 'Unknown Studio',
    offerAmount = 0,
    week = 0
  } = (activeModal.payload || {}) as {
    attackerId: string;
    attackerName: string;
    targetId: string;
    targetName: string;
    offerAmount: number;
    week: number;
  };

  const handleAccept = () => {
    resolveMerger(true, attackerId, targetId, offerAmount);
    resolveCurrentModal();
  };

  const handleFight = () => {
    resolveMerger(false, attackerId, targetId, offerAmount);
    resolveCurrentModal();
  };

  return (
    <Dialog open onOpenChange={() => resolveCurrentModal()}>
      <DialogContent className="max-w-md border border-destructive/40 bg-background">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Swords className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black uppercase tracking-tight text-destructive">
                Hostile Takeover
              </DialogTitle>
              <p className="text-xs text-muted-foreground">Week {week} — M&A Activity</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-sm font-bold text-destructive">Hostile Takeover in Progress</p>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{attackerName}</span> is attempting a hostile
              acquisition of <span className="font-bold text-foreground">{targetName}</span>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-card/40 border border-border/40 text-center">
              <Building2 className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Acquirer</p>
              <p className="text-sm font-black">{attackerName}</p>
            </div>
            <div className="p-3 rounded-lg bg-card/40 border border-border/40 text-center">
              <DollarSign className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Offer Value</p>
              <p className="text-sm font-black text-emerald-400">{formatMoney(offerAmount)}</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-400 font-bold">
              Accept: You receive {formatMoney(offerAmount)} and the rival absorbs {targetName}'s assets.
              Fight: The merger proceeds without your involvement — rivals grow stronger.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={handleFight}
            >
              <Shield className="h-4 w-4 mr-2" />
              Fight It
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={handleAccept}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Accept Merger
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BiddingWarModal;

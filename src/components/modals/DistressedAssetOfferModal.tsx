import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { selectDistressedOffer } from '@/store/selectors';
import { formatMoney } from '@/engine/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, DollarSign, Clock, Building2 } from 'lucide-react';

export const DistressedAssetOfferModal: React.FC = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const acquireDistressedAsset = useGameStore(s => s.acquireDistressedAsset);
  const declineDistressedAsset = useGameStore(s => s.declineDistressedAsset);
  const gameState = useGameStore(s => s.gameState);

  if (!activeModal || activeModal.type !== 'DISTRESSED_ASSET_OFFER') return null;

  const { offerId = '' } = (activeModal.payload || {}) as { offerId: string };
  const offer = gameState ? selectDistressedOffer(gameState, offerId) : null;

  if (!offer) {
    resolveCurrentModal();
    return null;
  }

  const weeksRemaining = offer.expiresWeek - (gameState?.week ?? 0);

  const handleAcquire = () => {
    acquireDistressedAsset(offerId);
    resolveCurrentModal();
  };

  const handleDecline = () => {
    declineDistressedAsset(offerId);
    resolveCurrentModal();
  };

  return (
    <Dialog open onOpenChange={() => resolveCurrentModal()}>
      <DialogContent className="max-w-md bg-card/90 backdrop-blur-2xl border border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-none bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black uppercase tracking-tight text-destructive">
                Distressed Asset Sale
              </DialogTitle>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                First Right of Refusal
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-background/50 p-4 rounded border border-white/5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{offer.assetLabel}</p>
                <p className="text-xs text-muted-foreground">From {offer.sellerName}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{formatMoney(offer.price)}</p>
                <p className="text-xs text-muted-foreground">Fire Sale Price</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Expires in {weeksRemaining} week{weeksRemaining !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>If you decline, {offer.aiBuyerName} will acquire it</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleDecline} variant="outline" className="flex-1">
              Decline
            </Button>
            <Button onClick={handleAcquire} className="flex-1">
              <DollarSign className="h-4 w-4 mr-2" />
              Acquire
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DistressedAssetOfferModal;

import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, Star, Users, Calendar, Building2, TrendingUp } from 'lucide-react';
import { TalentNameLink } from '@/components/shared/TalentNameLink';
import { formatMoney } from '@/engine/utils';
import type { Opportunity, Talent } from '@/engine/types';

interface PackageDetailModalProps {
  packageId?: string;
}

export const PackageDetailModal = ({ packageId: propPackageId }: PackageDetailModalProps) => {
  const { resolveCurrentModal, activeModal } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  
  const [bidAmount, setBidAmount] = useState<number>(0);

  const packageId = propPackageId || (activeModal?.payload as any)?.packageId;
  const packageData = gameState?.market?.opportunities?.find(o => o.id === packageId);
  const packageTalents = (packageData?.attachedTalentIds || [])
    .map(id => gameState?.entities.talents?.[id])
    .filter(Boolean) as Talent[];

  const handleBid = () => {
    if (!packageData || bidAmount <= 0) return;
    
    // Implement bidding logic - this would need a proper store action
    // For now, just close the modal
    resolveCurrentModal();
  };

  const handleClose = () => {
    resolveCurrentModal();
  };

  if (!packageData) return null;

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {packageData.title}
          </DialogTitle>
          <DialogDescription>
            Talent package details and bidding information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Package Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Cost to Acquire
              </div>
              <p className="text-2xl font-bold">{formatMoney(packageData.costToAcquire)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                Quality Bonus
              </div>
              <p className="text-2xl font-bold">+{packageData.qualityBonus || 0}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Weeks Until Expiry
              </div>
              <p className="text-2xl font-bold">{packageData.weeksUntilExpiry || 0}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Origin
              </div>
              <Badge variant="outline">{packageData.origin}</Badge>
            </div>
          </div>

          {/* Package Description */}
          <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground">{packageData.flavor}</p>
          </div>

          {/* Attached Talent */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Included Talent
            </h3>
            {packageTalents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No talent attached to this package</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {packageTalents.map(talent => (
                  <Badge key={talent.id} variant="outline" className="text-sm bg-primary/10">
                    <TalentNameLink talentId={talent.id} name={talent.name} />
                    <span className="ml-1 text-muted-foreground">• Tier {talent.tier}</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Bidding Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Place Bid
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Bid Amount</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="Enter bid amount"
                  min={0}
                  step={100000}
                />
                <Button 
                  variant="outline"
                  onClick={() => setBidAmount(packageData.costToAcquire * 1.1)}
                >
                  Min +10%
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Current asking price: {formatMoney(packageData.costToAcquire)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bid Terms</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Enter any special terms or conditions..."
              />
            </div>
          </div>

          {/* Bid History */}
          {packageData.bidHistory && packageData.bidHistory.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <h3 className="font-semibold">Bid History</h3>
              <div className="space-y-1">
                {packageData.bidHistory.map((bid, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {bid.rivalId === 'PLAYER' ? 'Your Studio' : bid.rivalId} (Week {bid.week})
                    </span>
                    <span className="font-medium">{formatMoney(bid.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button
            onClick={handleBid}
            disabled={bidAmount <= 0}
          >
            Place Bid ({formatMoney(bidAmount)})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PackageDetailModal;

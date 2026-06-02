import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, Users, Percent } from 'lucide-react';
import { TalentNameLink } from '@/components/shared/TalentNameLink';

interface PackageDealPayload {
  agencyId: string;
  agencyName: string;
  agencyArchetype: string;
  agencyDescription: string;
  leadTalentId: string;
  leadTalentName: string;
  bundledTalentId: string;
  bundledTalentName: string;
  packageDiscount: number;
  reason: string;
}

export const PackageDealOfferedModal = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const gameState = useGameStore(s => s.gameState);

  const data = activeModal?.payload as PackageDealPayload | null;

  const handleDecline = () => {
    resolveCurrentModal();
  };

  const handleAccept = () => {
    resolveCurrentModal();
  };

  if (!data) return null;

  const leadTalent = gameState?.entities.talents?.[data.leadTalentId];
  const bundledTalent = gameState?.entities.talents?.[data.bundledTalentId];
  const discountPercent = Math.round((data.packageDiscount ?? 0) * 100);

  return (
    <Dialog open={true} onOpenChange={handleDecline}>
      <DialogContent className="max-w-xl bg-card/90 backdrop-blur-2xl border border-white/10">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-xl tracking-tight uppercase flex items-center gap-2">
            <Package className="h-5 w-5 text-yellow-400" />
            Agency Package Demand
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1 text-yellow-400/80">
            <AlertTriangle className="h-3 w-3" />
            {data.agencyName} — {data.agencyArchetype}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Reason / Narrative */}
          <p className="text-sm text-muted-foreground italic border-l-2 border-yellow-400/40 pl-3">
            "{data.reason}"
          </p>

          {/* Talent Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Users className="h-3 w-3" />
              Talent Involved
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-primary/20 rounded-none bg-primary/5 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">You want</p>
                <p className="font-semibold">
                  {leadTalent ? (
                    <TalentNameLink talentId={leadTalent.id} name={leadTalent.name} />
                  ) : (
                    data.leadTalentName
                  )}
                </p>
                {leadTalent && (
                  <Badge variant="outline" className="text-xs">
                    Tier {leadTalent.tier} · {leadTalent.prestige} prestige
                  </Badge>
                )}
              </div>
              <div className="p-3 border border-yellow-400/20 rounded-none bg-yellow-400/5 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">They require</p>
                <p className="font-semibold">
                  {bundledTalent ? (
                    <TalentNameLink talentId={bundledTalent.id} name={bundledTalent.name} />
                  ) : (
                    data.bundledTalentName
                  )}
                </p>
                {bundledTalent && (
                  <Badge variant="outline" className="text-xs">
                    Tier {bundledTalent.tier} · {bundledTalent.prestige} prestige
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Discount Offered */}
          {discountPercent > 0 && (
            <div className="flex items-center gap-3 p-3 border border-green-400/20 bg-green-400/5 rounded-none">
              <Percent className="h-4 w-4 text-green-400" />
              <div>
                <p className="text-sm font-semibold text-green-400">{discountPercent}% fee discount offered</p>
                <p className="text-xs text-muted-foreground">Applied to {data.bundledTalentName}'s contract if you accept</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleDecline}>
            Decline
          </Button>
          <Button
            className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold"
            onClick={handleAccept}
          >
            Accept Package Deal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PackageDealOfferedModal;

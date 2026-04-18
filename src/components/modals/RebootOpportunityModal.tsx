import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Film, Zap, DollarSign, TrendingUp, X } from 'lucide-react';
import { RebootProposal } from '@/engine/systems/ip/ipRebootEngine';

const ANGLE_LABELS: Record<RebootProposal['angle'], string> = {
  reimagining: 'Creative Reimagining',
  legacy_sequel: 'Legacy Sequel',
  prequel: 'Origin Prequel',
  reboot: 'Full Reboot',
};

const TIER_COLORS: Record<string, string> = {
  BLOCKBUSTER: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  LEGACY: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  CULT_CLASSIC: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  ORIGINAL: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

export const RebootOpportunityModal: React.FC = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const createProject = useGameStore(s => s.createProject);

  if (!activeModal || activeModal.type !== 'REBOOT_OPPORTUNITY') return null;

  const reboot = activeModal.payload as unknown as RebootProposal | undefined;
  if (!reboot) {
    resolveCurrentModal();
    return null;
  }

  const { proposal, assetTitle, assetTier, estimatedBuzz, developmentCostMultiplier, angle, logline } = reboot;

  const handleGreenlight = () => {
    if (!proposal.title || !proposal.format || !proposal.genre || !proposal.budgetTier) return;
    createProject({
      title: proposal.title,
      format: (proposal.format ?? 'film') as 'film',
      genre: proposal.genre ?? 'Drama',
      budgetTier: proposal.budgetTier ?? 'high',
      targetAudience: 'General',
      flavor: proposal.flavor ?? logline,
      parentProjectId: proposal.parentProjectId,
      isSpinoff: true,
      initialBuzzBonus: estimatedBuzz,
    });
    resolveCurrentModal();
  };

  const handleDecline = () => {
    resolveCurrentModal();
  };

  return (
    <Dialog open onOpenChange={handleDecline}>
      <DialogContent className="max-w-lg bg-background border-border">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Film className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              IP Reboot Opportunity
            </span>
          </div>
          <DialogTitle className="text-xl font-bold">{proposal.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            {logline}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Source IP info */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Source IP</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{assetTitle}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${TIER_COLORS[assetTier] ?? 'bg-muted text-muted-foreground'}`}>
                  {assetTier.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Angle</span>
              <Badge variant="outline" className="text-xs">{ANGLE_LABELS[angle]}</Badge>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
              <Zap className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{estimatedBuzz}</div>
              <div className="text-xs text-muted-foreground">Est. Buzz</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
              <DollarSign className="h-4 w-4 text-green-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{developmentCostMultiplier.toFixed(1)}×</div>
              <div className="text-xs text-muted-foreground">Dev Cost</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
              <TrendingUp className="h-4 w-4 text-blue-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground capitalize">{proposal.budgetTier}</div>
              <div className="text-xs text-muted-foreground">Budget Tier</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            This is a limited-time opportunity. Declining passes on this reboot — another studio may pick it up.
          </p>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDecline}
          >
            <X className="h-4 w-4 mr-2" />
            Pass
          </Button>
          <Button
            className="flex-1"
            onClick={handleGreenlight}
          >
            <Film className="h-4 w-4 mr-2" />
            Greenlight Reboot
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

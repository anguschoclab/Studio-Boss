import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { Film, Zap, DollarSign, X } from "lucide-react";
import { formatMoney } from "@/engine/utils";
import type { RebootProposal } from "@/engine/systems/ip/ipRebootEngine";

export const RebootOpportunityModal: React.FC = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const developFromOwnedIP = useGameStore((s) => s.developFromOwnedIP);

  if (!activeModal || activeModal.type !== "REBOOT_OPPORTUNITY") return null;

  const proposal = activeModal.payload as RebootProposal | undefined;
  if (!proposal) {
    resolveCurrentModal();
    return null;
  }

  const { ipId, ipTitle, suggestedBudget, estimatedNostalgiaBonus, description } = proposal;

  const handleGreenlight = () => {
    developFromOwnedIP(ipId);
    resolveCurrentModal();
  };

  const handleDecline = () => {
    resolveCurrentModal();
  };

  return (
    <Dialog open onOpenChange={handleDecline}>
      <DialogContent className="max-w-lg bg-card/90 backdrop-blur-2xl border border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Film className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              IP Reboot Opportunity
            </span>
          </div>
          <DialogTitle className="font-display font-black text-xl tracking-tight uppercase">
            {ipTitle}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="rounded-none border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Source IP</span>
              <span className="text-sm font-medium">{ipTitle}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-none border border-border bg-muted/20 p-3 text-center">
              <Zap className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{estimatedNostalgiaBonus}</div>
              <div className="text-xs text-muted-foreground">Nostalgia Bonus</div>
            </div>
            <div className="rounded-none border border-border bg-muted/20 p-3 text-center">
              <DollarSign className="h-4 w-4 text-green-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">
                {formatMoney(suggestedBudget)}
              </div>
              <div className="text-xs text-muted-foreground">Suggested Budget</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            This is a limited-time opportunity. Declining passes on this reboot — another studio may
            pick it up.
          </p>
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={handleDecline}>
            <X className="h-4 w-4 mr-2" />
            Pass
          </Button>
          <Button className="flex-1" onClick={handleGreenlight}>
            <Film className="h-4 w-4 mr-2" />
            Greenlight Reboot
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

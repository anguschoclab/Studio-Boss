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
import { Building2, ShieldAlert, X } from "lucide-react";

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

const RISK_COPY = {
  none: {
    label: "Clear",
    tone: "text-emerald-400",
    note: "Combined share is below the regulator review threshold.",
  },
  review: {
    label: "Under Review",
    tone: "text-amber-400",
    note: "Regulators are likely to scrutinise this deal.",
  },
  high: {
    label: "High Risk",
    tone: "text-rose-400",
    note: "Severe concentration — regulators will probably block this.",
  },
} as const;

export const AcquisitionConfirmModal: React.FC = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const previewAcquisition = useGameStore((s) => s.previewAcquisition);
  const acquireRival = useGameStore((s) => s.acquireRival);

  if (!activeModal || activeModal.type !== "ACQUISITION_CONFIRM") return null;

  const targetId = (activeModal.payload as { targetId?: string })?.targetId;
  const preview = targetId ? previewAcquisition(targetId) : null;
  if (!preview) {
    resolveCurrentModal();
    return null;
  }

  const risk = RISK_COPY[preview.regulatorRisk];

  const handleConfirm = () => {
    acquireRival(preview.targetId);
    resolveCurrentModal();
  };

  return (
    <Dialog open onOpenChange={() => resolveCurrentModal()}>
      <DialogContent className="max-w-lg bg-card/90 backdrop-blur-2xl border border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground not-italic">
              Acquisition Review
            </span>
          </div>
          <DialogTitle className="font-display font-black text-xl tracking-tight uppercase not-italic">
            Acquire {preview.targetName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            You inherit their slate, contracts and cash reserves. Regulators
            review the combined entity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div className="border border-border bg-muted/30 p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Purchase Price</span>
            <span className="font-display text-lg font-bold tabular-nums">
              {fmt(preview.price)}
            </span>
          </div>
          <div className="border border-border bg-muted/20 p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your Cash</span>
            <span
              className={`font-display text-lg font-bold tabular-nums ${
                preview.affordable ? "text-foreground" : "text-rose-400"
              }`}
            >
              {fmt(preview.playerCash)}
            </span>
          </div>
          <div className="border border-border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldAlert className="h-4 w-4" /> Regulator Outlook
              </span>
              <span
                className={`font-display text-sm font-bold uppercase not-italic ${risk.tone}`}
              >
                {risk.label}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs tabular-nums text-muted-foreground">
              <span>Combined market share</span>
              <span>{preview.combinedShare.toFixed(1)}%</span>
            </div>
            {preview.blockChance > 0 && (
              <div className="flex items-center justify-between text-xs tabular-nums text-muted-foreground">
                <span>Estimated block chance</span>
                <span>{Math.round(preview.blockChance * 100)}%</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground/70">{risk.note}</p>
            {preview.blockChance > 0 && (
              <p className="text-xs text-amber-400/80">
                A blocked bid still costs a 2% filing fee and 3 prestige.
              </p>
            )}
          </div>
          {!preview.affordable && preview.reason && (
            <p className="text-xs text-rose-400">{preview.reason}</p>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => resolveCurrentModal()}
          >
            <X className="h-4 w-4 mr-2" />
            Walk Away
          </Button>
          <Button
            className="flex-1"
            disabled={!preview.canProceed}
            onClick={handleConfirm}
          >
            <Building2 className="h-4 w-4 mr-2" />
            Bid {fmt(preview.price)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

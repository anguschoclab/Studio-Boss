import { useEffect } from "react";
import { useUIStore } from "@/store/uiStore";
import { useGameStore } from "@/store/gameStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/engine/utils";
import { ShieldAlert, DollarSign, Clock, Star } from "lucide-react";

/**
 * CastingConstraintModal — a talent refuses a script requirement
 * (CASTING_CONSTRAINT_VIOLATION → MODAL_TRIGGERED → CASTING_CONSTRAINT).
 * The player picks one of the violation's resolution options; the chosen
 * option's costs are applied via resolveCastingConstraint.
 */
export const CastingConstraintModal = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const gameState = useGameStore((s) => s.gameState);
  const resolveCastingConstraint = useGameStore((s) => s.resolveCastingConstraint);

  const options =
    activeModal?.type === "CASTING_CONSTRAINT" ? activeModal.payload.options : undefined;

  // Resolve in an effect — never during render — so a malformed payload
  // can't jam the modal queue.
  useEffect(() => {
    if (activeModal?.type !== "CASTING_CONSTRAINT") return;
    if (!gameState || !options?.length) resolveCurrentModal();
  }, [activeModal, gameState, options, resolveCurrentModal]);

  if (!activeModal || activeModal.type !== "CASTING_CONSTRAINT" || !gameState) return null;
  if (!options?.length) return null;

  const { projectId, talentId } = activeModal.payload;
  const project = gameState.entities.projects[projectId];
  const talent = gameState.entities.talents[talentId];

  const handleChoose = (optionId: string) => {
    resolveCastingConstraint(activeModal.payload, optionId);
    resolveCurrentModal();
  };

  return (
    <Dialog open={true} onOpenChange={() => resolveCurrentModal()}>
      <DialogContent className="max-w-lg bg-black/95 backdrop-blur-3xl border border-white/10 p-0 rounded-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-destructive via-destructive/40 to-destructive" />
        <div className="p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-black tracking-tighter uppercase italic text-foreground flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" /> Casting Conflict
            </DialogTitle>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              {talent?.name ?? "Talent"} • {project?.title ?? projectId}
            </p>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            {talent?.name ?? "The talent"} is refusing a scripted requirement on{" "}
            <span className="text-foreground font-bold">{project?.title ?? "this project"}</span>.
            Choose how to resolve the standoff.
          </p>

          <div className="space-y-3">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleChoose(opt.id)}
                className="w-full text-left border border-white/10 bg-white/[0.02] hover:border-primary/50 hover:bg-white/[0.05] transition-colors p-4 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black uppercase tracking-wide text-foreground">
                    {opt.label}
                  </span>
                  <span className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                    {opt.cashCost ? (
                      <span className="flex items-center gap-1 text-destructive">
                        <DollarSign className="h-3 w-3" />
                        {formatMoney(opt.cashCost)}
                      </span>
                    ) : null}
                    {opt.prestigeCost ? (
                      <span className="flex items-center gap-1 text-warning">
                        <Star className="h-3 w-3" />-{opt.prestigeCost}
                      </span>
                    ) : null}
                    {opt.weeksDelay ? (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />+{opt.weeksDelay}w
                      </span>
                    ) : null}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-white/10 bg-white/[0.02]">
          <Button
            variant="ghost"
            onClick={() => resolveCurrentModal()}
            className="text-muted-foreground"
          >
            Ignore for now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

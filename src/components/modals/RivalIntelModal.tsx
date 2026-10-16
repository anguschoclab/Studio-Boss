import React, { useEffect } from "react";
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
import { Eye, Brain, Crosshair, Film } from "lucide-react";
import { formatMoney } from "@/engine/utils";
import { countRivalProjects } from "@/engine/utils";
import { cn } from "@/lib/utils";

const MOTIVATION_LABEL: Record<string, string> = {
  CASH_CRUNCH: "Cash Crunch",
  AWARD_CHASE: "Award Chase",
  FRANCHISE_BUILDING: "Franchise Building",
  MARKET_DISRUPTION: "Market Disruption",
  STABILITY: "Stability",
};

const STANCE_STYLE: Record<string, string> = {
  hostile: "text-destructive",
  rivalrous: "text-amber-500",
  neutral: "text-muted-foreground",
  deferential: "text-blue-400",
};

/**
 * Rival Intelligence Dossier — renders rival.intel verbatim.
 * Every value on screen maps to real engine state: the weekly plan the
 * RivalBrain produced, the motivations it used, and the reasons it recorded.
 * If intel hasn't been written yet, the dossier shows only live state fields.
 */
export const RivalIntelModal: React.FC = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const gameState = useGameStore((s) => s.gameState);

  const rivalId =
    activeModal?.type === "RIVAL_INTEL"
      ? (activeModal.payload as { rivalId?: string })?.rivalId
      : undefined;
  const rival = rivalId ? gameState?.entities?.rivals?.[rivalId] : undefined;

  // Never jam the queue on a missing rival (e.g., acquired since queueing).
  useEffect(() => {
    if (activeModal?.type === "RIVAL_INTEL" && !rival) {
      resolveCurrentModal();
    }
  }, [activeModal, rival, resolveCurrentModal]);

  if (!activeModal || activeModal.type !== "RIVAL_INTEL" || !rival || !gameState) return null;

  const intel = rival.intel;
  const activeProjects = countRivalProjects(gameState, rival);
  const inFlight = Object.values(gameState.entities.projects || {}).filter(
    (p) =>
      p.ownerId === rival.id &&
      !["released", "post_release", "completed", "archived"].includes(p.state)
  );

  return (
    <Dialog open onOpenChange={() => resolveCurrentModal()}>
      <DialogContent className="max-w-xl bg-card/90 backdrop-blur-2xl border border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Eye className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground not-italic">
              Intelligence Dossier
            </span>
          </div>
          <DialogTitle className="font-display font-black text-xl tracking-tight uppercase not-italic">
            {rival.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            Field assessment compiled week {intel?.updatedWeek ?? gameState.week}. All entries are
            drawn from this studio's declared weekly plan — nothing here is conjecture.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 border border-white/10 bg-white/[0.02]">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1 flex items-center gap-1.5">
                <Brain className="h-3 w-3" /> Current Motivation
              </div>
              <div className="font-bold">
                {MOTIVATION_LABEL[intel?.motivation ?? rival.currentMotivation ?? "STABILITY"] ??
                  "Stability"}
              </div>
            </div>
            <div className="p-3 border border-white/10 bg-white/[0.02]">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1 flex items-center gap-1.5">
                <Crosshair className="h-3 w-3" /> Posture Toward You
              </div>
              <div className={cn("font-bold capitalize", STANCE_STYLE[intel?.stance ?? "neutral"])}>
                {intel?.stance ?? "neutral"}
              </div>
            </div>
            <div className="p-3 border border-white/10 bg-white/[0.02]">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">
                Cash Reserves
              </div>
              <div className="font-bold">{formatMoney(rival.cash)}</div>
            </div>
            <div className="p-3 border border-white/10 bg-white/[0.02]">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">
                Active Slate
              </div>
              <div className="font-bold">
                {activeProjects} project{activeProjects === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          {inFlight.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 flex items-center gap-1.5">
                <Film className="h-3 w-3" /> In-Flight Projects
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {inFlight.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between text-xs border-b border-white/5 pb-1"
                  >
                    <span className="text-foreground/80">{p.title}</span>
                    <span className="text-muted-foreground/60 uppercase tracking-wider">
                      {p.state.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {intel?.planSummary && intel.planSummary.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">
                Declared Moves This Week
              </div>
              <ul className="space-y-1">
                {intel.planSummary.map((line, i) => (
                  <li key={i} className="text-sm text-foreground/85">
                    ▸ {line}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {intel?.reasons && intel.reasons.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">
                Analyst Notes — Why
              </div>
              <ul className="space-y-1.5">
                {intel.reasons.map((reason, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!intel && (
            <p className="text-xs text-muted-foreground/60 italic">
              No field intelligence on file yet — this studio's planning cycle hasn't been
              observed.
            </p>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => resolveCurrentModal()}>
            Close Dossier
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

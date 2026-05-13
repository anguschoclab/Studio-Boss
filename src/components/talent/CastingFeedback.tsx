import React from "react";
import { Talent, Project } from "@/engine/types";
import { calculateWillingness } from "@/engine/systems/talent/willingnessEngine";
import { useGameStore } from "@/store/gameStore";
import { 
  AlertCircle, 
  Brain, 
  Zap, 
  ChevronRight, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type TalentId, type ProjectId } from "@/engine/types/shared.types";

interface CastingFeedbackProps {
  talent: Talent;
  project: Project;
}

export const CastingFeedback: React.FC<CastingFeedbackProps> = ({ talent, project }) => {
  const gameState = useGameStore((s) => s.gameState);

  if (!gameState) return null;

  const feedback = calculateWillingness(talent, project, gameState);
  const score = feedback.score;

  return (
    <div className="bg-white/[0.02] p-8 rounded-none border border-white/5 backdrop-blur-3xl space-y-8 animate-in slide-in-from-bottom-4 duration-700 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Brain className="w-4 h-4 text-primary" strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic">
            PSYCHOLOGICAL_FIT_ANALYSIS
          </span>
        </div>
        <div
          className={cn(
            "px-4 py-1.5 rounded-none text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl italic border",
            score >= 70
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : score >= 40
                ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                : "bg-rose-500/10 text-rose-500 border-rose-500/30"
          )}
        >
          {score}%_CONTRACT_VELOCITY
        </div>
      </div>

      <div className="space-y-4">
        {feedback.reasons.map((reason, idx) => (
          <div key={idx} className="flex items-start gap-4 group">
            <div className="mt-1.5">
              <ChevronRight
                className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors"
                strokeWidth={3}
              />
            </div>
            <p className="text-[11px] font-black text-muted-foreground/60 leading-relaxed italic group-hover:text-foreground transition-colors uppercase tracking-tight">
              {reason.toUpperCase()}
            </p>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "p-6 rounded-none border text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 italic shadow-2xl transition-all duration-700",
          feedback.finalVerdict === "willing"
            ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500"
            : feedback.finalVerdict === "hesitant"
              ? "bg-amber-500/5 border-amber-500/10 text-amber-500"
              : "bg-rose-500/5 border-rose-500/10 text-rose-500"
        )}
      >
        {feedback.finalVerdict === "willing" ? (
          <Zap className="w-4 h-4 fill-current" />
        ) : (
          <AlertCircle className="w-4 h-4" />
        )}
        <span className="opacity-50">FINAL_VERDICT:</span>
        {feedback.finalVerdict === "willing"
          ? "ATTACHED_&_AGGRESSIVE"
          : feedback.finalVerdict === "hesitant"
            ? "NEGOTIATION_REQUIRED"
            : "CONTRACT_REJECTED"}
      </div>
    </div>
  );
};

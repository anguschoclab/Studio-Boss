import {Project} from "@/engine/types";
import {Button} from "@/components/ui/button";
import {AlertTriangle, Zap, Target} from "lucide-react";

interface ProjectCardActionsProps {
  project: Project;
  hasUnresolvedCrisis: boolean;
  onCrisis: () => void;
  onGreenlight: () => void;
  onPitch: () => void;
}

/**
 * Bottom action zone of a ProjectCard: crisis resolution, executive
 * greenlight, or pitch actions depending on project state.
 */
export const ProjectCardActions = ({
  project,
  hasUnresolvedCrisis,
  onCrisis,
  onGreenlight,
  onPitch,
}: ProjectCardActionsProps) => (
  <div className="pt-6 flex flex-col gap-4 relative z-10 border-t border-white/5 mt-2">
    {hasUnresolvedCrisis && (
      <Button
        variant="destructive"
        size="sm"
        className="w-full h-12 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse border border-red-400/30 bg-red-400/10 hover:bg-red-400 text-red-400 hover:text-white transition-all duration-700 rounded-none italic"
        onClick={(e) => {
          e.stopPropagation();
          onCrisis();
        }}
      >
        <AlertTriangle className="w-4 h-4 mr-3" strokeWidth={3} />
        NEUTRALIZE CRISIS
      </Button>
    )}

    {project.state === "needs_greenlight" && (
      <Button
        variant="default"
        size="sm"
        className="w-full h-12 text-[10px] font-black uppercase tracking-[0.3em] bg-primary text-black hover:bg-white transition-all duration-700 rounded-none italic shadow-[0_0_20px_rgba(var(--primary),0.2)]"
        onClick={(e) => {
          e.stopPropagation();
          onGreenlight();
        }}
      >
        <Zap className="w-4 h-4 mr-3" strokeWidth={3} />
        EXECUTIVE GREENLIGHT
      </Button>
    )}

    {project.state === "pitching" && (
      <Button
        size="sm"
        className="w-full h-12 text-[10px] font-black uppercase tracking-[0.3em] bg-amber-400 text-black hover:bg-white transition-all duration-700 rounded-none italic shadow-[0_0_20px_rgba(251,191,36,0.2)]"
        onClick={(e) => {
          e.stopPropagation();
          onPitch();
        }}
      >
        <Target className="w-4 h-4 mr-3" strokeWidth={3} />
        PITCH PIPELINE
      </Button>
    )}
  </div>
);

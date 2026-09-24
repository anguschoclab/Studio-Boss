import {Project} from "@/engine/types";
import {Button} from "@/components/ui/button";

interface ProjectDetailFooterProps {
  project: Project;
  onRenew: () => void;
  onExploitFranchise: () => void;
  onClose: () => void;
}

/**
 * Modal footer: conditional renewal / franchise action plus close control.
 */
export const ProjectDetailFooter = ({
  project,
  onRenew,
  onExploitFranchise,
  onClose,
}: ProjectDetailFooterProps) => (
  <div className="p-6 bg-black/80 border-t border-white/5 flex items-center justify-between gap-4">
    {(project.state === "archived" ||
      project.state === "released" ||
      project.state === "post_release") &&
    project.type === "SERIES" ? (
      <Button
        onClick={onRenew}
        className="flex-1 max-w-sm h-12 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20"
      >
        Order Next Season (Production)
      </Button>
    ) : project.state === "released" && project.revenue > project.budget * 1.5 ? (
      <Button
        onClick={onExploitFranchise}
        className="flex-1 max-w-sm h-12 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-violet-900/20"
      >
        Spin-Off / Franchise Expansion
      </Button>
    ) : (
      <div className="flex-1" />
    )}

    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        className="h-10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white"
        onClick={onClose}
      >
        Close Terminal
      </Button>
      <div className="h-8 w-[1px] bg-slate-800" />
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">
          Connection Stable
        </span>
      </div>
    </div>
  </div>
);

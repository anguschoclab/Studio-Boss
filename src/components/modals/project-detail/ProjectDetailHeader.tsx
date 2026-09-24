import {Project, SeriesProject} from "@/engine/types";
import {DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {Type} from "lucide-react";
import {formatMoney} from "@/engine/utils";

interface ProjectDetailHeaderProps {
  project: Project;
  seriesProject: SeriesProject | null;
}

/**
 * Modal header: title, state/genre badges, capital-at-risk, season badge.
 */
export const ProjectDetailHeader = ({ project, seriesProject }: ProjectDetailHeaderProps) => (
  <DialogHeader className="p-6 border-b border-white/5 bg-black/40">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Type className="w-6 h-6 text-primary" />
          <DialogTitle className="font-serif text-3xl font-black tracking-tight text-white uppercase italic">
            {project.title}
          </DialogTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-secondary border-secondary/30 uppercase font-black text-[10px] tracking-widest"
          >
            {project.state}
          </Badge>
          <div className="h-1 w-1 rounded-none bg-slate-700" />
          <span className="text-[10px] uppercase font-bold text-muted-foreground">
            {project.genre} • {project.format}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
            Capital At Risk
          </span>
          <div className="text-xl font-black text-foreground leading-none">
            {formatMoney(project.budget)}
          </div>
        </div>
        {seriesProject?.tvDetails && (
          <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/30 font-black h-10 px-4">
            S{seriesProject.tvDetails.currentSeason}
          </Badge>
        )}
      </div>
    </div>
  </DialogHeader>
);

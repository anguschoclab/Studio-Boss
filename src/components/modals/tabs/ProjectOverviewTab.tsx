import {TabsContent} from "@/components/ui/tabs";
import {Project, ScriptedProject} from "@/engine/types";
import {formatMoney} from "@/engine/utils";
import {TrendingUp, DollarSign, Brain, Calendar} from "lucide-react";
import {cn} from "@/lib/utils";

interface ProjectOverviewTabProps {
  project: Project;
  scriptedProject: ScriptedProject | null;
}

/**
 * Overview tab: package analysis (script heat + flavor), P&L forecast,
 * and the buzz/complexity/week stat cards.
 */
export const ProjectOverviewTab = ({ project, scriptedProject }: ProjectOverviewTabProps) => (
  <TabsContent value="overview" className="mt-0 space-y-6">
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-black/40 p-5 rounded-none border border-white/5/50 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
            Package Analysis
          </span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Town Heat</span>
            <span className="text-sm font-black text-primary">
              {scriptedProject?.scriptHeat || 50}%
            </span>
          </div>
          <div className="h-1.5 rounded-none bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${scriptedProject?.scriptHeat || 50}%` }}
            />
          </div>
          {project.flavor && (
            <div className="relative p-4 rounded-none bg-black/40 border-l-4 border-primary/40 italic text-sm text-slate-300">
              "{project.flavor}"
            </div>
          )}
        </div>
      </div>

      <div className="bg-black/40 p-5 rounded-none border border-white/5/50 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
            P&L Forecast
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">Accumulated Cost</span>
            <span className="text-sm font-black text-rose-400">
              -{formatMoney(project.accumulatedCost || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Weekly Burn</span>
            <span className="text-rose-400/60 font-bold">-{formatMoney(project.weeklyCost)}</span>
          </div>
          <div className="pt-3 border-t border-white/5/50 flex justify-between items-center">
            <span className="text-xs font-black uppercase text-slate-400">Current Yield</span>
            <span className="text-xl font-black text-emerald-500">
              {formatMoney(project.revenue)}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      {[
        {
          label: "Buzz",
          val: `${project.buzz.toFixed(0)}%`,
          icon: TrendingUp,
          color: "text-violet-400",
        },
        {
          label: "Complexity",
          val: project.budgetTier.toUpperCase(),
          icon: Brain,
          color: "text-emerald-400",
        },
        {
          label: "Week",
          val: project.weeksInPhase,
          icon: Calendar,
          color: "text-amber-400",
        },
      ].map((card) => (
        <div
          key={card.label}
          className="p-4 rounded-none bg-black/40 border border-white/5/50 flex items-center gap-4"
        >
          <div
            className={cn(
              "w-10 h-10 rounded-none bg-black/40 flex items-center justify-center border border-white/5",
              card.color
            )}
          >
            <card.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              {card.label}
            </div>
            <div className="text-lg font-black text-foreground leading-none">{card.val}</div>
          </div>
        </div>
      ))}
    </div>
  </TabsContent>
);

import {TabsContent} from "@/components/ui/tabs";
import {Button} from "@/components/ui/button";
import {Project} from "@/engine/types";
import {GreenlightReport} from "@/engine/systems/greenlight";
import {formatMoney} from "@/engine/utils";
import {Activity, Clapperboard, ShieldAlert, CheckCircle2, AlertCircle} from "lucide-react";
import {cn} from "@/lib/utils";
import {DevelopmentLog} from "../DevelopmentLog";

interface ProjectProductionTabProps {
  project: Project;
  greenlightReport: GreenlightReport | null;
  onExecuteGreenlight: () => void;
}

/**
 * Production tab: development log + drafting progress, active shoot panel,
 * or the executive greenlight review depending on project state.
 */
export const ProjectProductionTab = ({
  project,
  greenlightReport,
  onExecuteGreenlight,
}: ProjectProductionTabProps) => (
  <TabsContent value="production" className="mt-0 space-y-6">
    {project.state === "development" ? (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2">
          <DevelopmentLog project={project} />
        </div>
        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-none border border-white/5 bg-black/40 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Phase Status
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-slate-500">Drafting Progress</span>
                <span>
                  {project.weeksInPhase}/{project.developmentWeeks} wks
                </span>
              </div>
              <div className="h-4 bg-slate-800 rounded-none overflow-hidden border border-white/5 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-primary rounded-none transition-all duration-1000"
                  style={{
                    width: `${(project.weeksInPhase / (project.developmentWeeks || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed italic">
              Script is currently in active development. AI drafting system tracks role splitting
              and Town Heat in real-time.
            </p>
          </div>
        </div>
      </div>
    ) : project.state === "production" ? (
      <div className="space-y-6">
        <div className="glass-panel p-8 rounded-none border border-primary/20 bg-primary/5 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-none bg-primary/10 flex items-center justify-center border border-primary/20">
            <Clapperboard className="w-8 h-8 text-primary animate-bounce" />
          </div>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">
            Principal Photography Active
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Cameras are rolling on "{project.title}". The budget is being consumed at{" "}
            {formatMoney(project.weeklyCost)} per week. Review casting or wait for wrap.
          </p>
          <div className="w-full max-w-lg space-y-2 pt-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
              <span>Shoot Completion</span>
              <span>
                {project.weeksInPhase} / {project.productionWeeks} Weeks
              </span>
            </div>
            <div className="h-2 rounded-none bg-black/60 border border-white/5">
              <div
                className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all duration-1000"
                style={{
                  width: `${(project.weeksInPhase / (project.productionWeeks || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ) : project.state === "needs_greenlight" && greenlightReport ? (
      <div className="space-y-6">
        <div className="border border-primary/20 bg-primary/5 p-8 rounded-none space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-primary" />
              <div>
                <h4 className="text-2xl font-black italic uppercase tracking-tighter">
                  Executive Greenlight
                </h4>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  Final Authorization Review
                </p>
              </div>
            </div>
            <div
              className={cn(
                "px-6 py-2 rounded-none text-xs font-black uppercase tracking-[0.2em] shadow-xl",
                greenlightReport.score >= 60
                  ? "bg-emerald-500 text-black shadow-emerald-500/20"
                  : "bg-rose-500 text-white shadow-rose-500/20"
              )}
            >
              {greenlightReport.recommendation}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" /> Bull Case
              </span>
              <ul className="space-y-2">
                {greenlightReport.positives.map((p, i) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-2">
                    <div className="w-1 h-1 bg-emerald-500/40 rounded-none mt-1.5 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-3 h-3" /> Bear Case
              </span>
              <ul className="space-y-2">
                {greenlightReport.negatives.map((n, i) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-2">
                    <div className="w-1 h-1 bg-rose-500/40 rounded-none mt-1.5 shrink-0" /> {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <Button
              className="w-full h-14 bg-primary text-black hover:bg-primary/90 font-black text-sm uppercase tracking-[0.2em] rounded-none shadow-2xl"
              onClick={onExecuteGreenlight}
            >
              Execute Authorization & Release Budgets
            </Button>
          </div>
        </div>
      </div>
    ) : null}
  </TabsContent>
);

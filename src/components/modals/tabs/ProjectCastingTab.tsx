import {useState} from "react";
import {TabsContent} from "@/components/ui/tabs";
import {Badge} from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Project, Talent} from "@/engine/types";
import {formatMoney} from "@/engine/utils";
import {Users, Brain} from "lucide-react";
import {cn} from "@/lib/utils";
import {CastingFeedback} from "../../talent/CastingFeedback";

interface ProjectCastingTabProps {
  project: Project;
  /** role name → attached/available talent for that role. */
  roleGroups: Map<string, { attached: Talent[]; available: Talent[] }>;
  talentMap: Map<string, Talent>;
  /** Studio cash on hand — gates the sign action. */
  cash: number;
  /** Called with a talent id when the player picks them for a role. */
  onCast: (talentId: string) => void;
}

/**
 * Casting tab: role roster with attached/available talent, cast selects,
 * and the hovered-talent psychological fit panel.
 */
export const ProjectCastingTab = ({
  project,
  roleGroups,
  talentMap,
  cash,
  onCast,
}: ProjectCastingTabProps) => {
  const [hoveredTalentId, setHoveredTalentId] = useState<string | null>(null);

  return (
    <TabsContent value="casting" className="mt-0 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" /> Talent Roster
            </h3>
          </div>

          <div className="space-y-3">
            {Array.from(roleGroups.keys()).map((role) => {
              const group = roleGroups.get(role)!;
              const isFilled = group.attached.length > 0;
              return (
                <div
                  key={role}
                  className={cn(
                    "p-5 rounded-none border transition-all relative overflow-hidden group",
                    isFilled
                      ? "bg-black/40 border-white/5"
                      : "bg-white/2 border-white/5 border-dashed"
                  )}
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-none flex items-center justify-center border",
                          isFilled
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-white/5 border-white/5 text-muted-foreground/30"
                        )}
                      >
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {role.replace("_", " ")}
                        </span>
                        {isFilled ? (
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="font-black text-base text-white truncate">
                              {group.attached[0].name}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold bg-amber-500/10 text-amber-500 border-none shrink-0 h-5 px-1.5"
                            >
                              ★ {group.attached[0].prestige}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic text-sm mt-0.5 font-medium">
                            Unsigned Representative
                          </span>
                        )}
                      </div>
                    </div>

                    {(project.state === "development" ||
                      project.state === "needs_greenlight") && (
                      <Select
                        onValueChange={(val) => {
                          if (!val) return;
                          if (cash < (talentMap.get(val)?.fee || 0)) return;
                          onCast(val);
                        }}
                      >
                        <SelectTrigger
                          aria-label="Cast Role"
                          className="w-[180px] bg-black/60 border-slate-700 h-10 text-xs font-bold uppercase tracking-widest"
                        >
                          <SelectValue placeholder="Cast Role..." />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/5 text-slate-200">
                          {group.available.map((t) => (
                            <SelectItem
                              key={t.id}
                              value={t.id}
                              className="focus:bg-primary/10"
                              onMouseEnter={() => setHoveredTalentId(t.id)}
                            >
                              <div className="flex items-center justify-between w-full min-w-[200px] gap-4">
                                <span className="font-black truncate">{t.name}</span>
                                <span className="text-emerald-400 font-bold ml-auto">
                                  {formatMoney(t.fee)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-12 xl:col-span-5 h-full">
          <div className="sticky top-0 space-y-6">
            <div className="glass-panel p-6 rounded-none border border-white/5 bg-black/40 h-full min-h-[300px] flex flex-col">
              {hoveredTalentId && talentMap.has(hoveredTalentId) ? (
                <CastingFeedback talent={talentMap.get(hoveredTalentId)!} project={project} />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-20">
                  <Brain className="w-12 h-12 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                    Hover over available talent
                    <br />
                    to analyze psychological fit
                    <br />
                    and industry willingness
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
};

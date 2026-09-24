import {useMemo, useState} from "react";
import {useGameStore} from "@/store/gameStore";
import {useUIStore} from "@/store/uiStore";
import {AwardBody, MarketingAngle} from "@/engine/types";
import {type ProjectId} from "@/engine/types/shared.types";
import {Dialog, DialogContent} from "@/components/ui/dialog";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {BarChart3, Users, Clapperboard, Trophy, Megaphone} from "lucide-react";
import {useProjectDetailData} from "@/hooks/useProjectDetailData";
import {ProjectDetailHeader} from "./ProjectDetailHeader";
import {ProjectDetailFooter} from "./ProjectDetailFooter";
import {ProjectOverviewTab} from "./tabs/ProjectOverviewTab";
import {ProjectProductionTab} from "./tabs/ProjectProductionTab";
import {ProjectCastingTab} from "./tabs/ProjectCastingTab";
import {ProjectMarketingTab} from "./tabs/ProjectMarketingTab";
import {ProjectCampaignsTab} from "./tabs/ProjectCampaignsTab";

/**
 * Project dossier modal: header, vertical tab rail (overview, production,
 * casting, marketing, campaigns) and footer actions. All game-state reads
 * and derivations live in useProjectDetailData; each tab is a self-contained
 * component under ./tabs.
 */
export const ProjectDetailModal = () => {
  const [selectedTier, setSelectedTier] = useState<"none" | "basic" | "blockbuster">("none");
  const [primaryAngle, setPrimaryAngle] = useState<MarketingAngle | null>(null);
  const [secondaryAngle, setSecondaryAngle] = useState<MarketingAngle | null>(null);

  const { selectedProjectId, selectProject } = useUIStore();
  const signContract = useGameStore((s) => s.signContract);
  const renewProject = useGameStore((s) => s.renewProject);
  const greenlightProject = useGameStore((s) => s.greenlightProject);
  const exploitFranchise = useGameStore((s) => s.exploitFranchise);
  const lockMarketingCampaign = useGameStore((s) => s.lockMarketingCampaign);
  const submitToFestival = useGameStore((s) => s.submitToFestival);
  const launchAwardsCampaign = useGameStore((s) => s.launchAwardsCampaign);

  const {
    project,
    tier,
    scriptedProject,
    seriesProject,
    activeCampaign,
    projectProbabilityData,
    roleGroups,
    talentMap,
    greenlightReport,
    cash,
  } = useProjectDetailData();

  const projectionData = useMemo(() => {
    if (!project) return [];

    let buzz = project.buzz;
    if (selectedTier === "basic") buzz += 15;
    if (selectedTier === "blockbuster") buzz += 40;
    buzz = Math.min(100, buzz);

    const baseRevenue = project.budget * (buzz / 50) * 1.5;
    const data: { week: string; revenue: number }[] = [];
    let currentWeekly = baseRevenue * 0.35;

    for (let i = 1; i <= 8; i++) {
      data.push({
        week: `Wk ${i}`,
        revenue: Math.round(currentWeekly / 1000) * 1000,
      });
      currentWeekly *= 0.65; // Simulated decay
    }
    return data;
  }, [project, selectedTier]);

  if (!project || !tier) return null;

  return (
    <Dialog open={!!selectedProjectId} onOpenChange={() => selectProject(null)}>
      <DialogContent className="max-w-4xl h-[85vh] bg-card/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col p-0">
        <ProjectDetailHeader project={project} seriesProject={seriesProject} />

        <div className="flex-1 flex overflow-hidden">
          <Tabs
            defaultValue={
              project.state === "marketing"
                ? "marketing"
                : project.state === "needs_greenlight" ||
                    project.state === "development" ||
                    project.state === "production"
                  ? "production"
                  : "overview"
            }
            className="flex-1 flex overflow-hidden"
          >
            <div className="w-16 border-r border-white/5 bg-black/60 flex flex-col items-center py-6 space-y-8">
              <TabsList className="flex flex-col h-auto bg-transparent gap-6 p-0 border-none">
                {[
                  { val: "overview", icon: BarChart3, label: "Intel" },
                  { val: "production", icon: Clapperboard, label: "Build" },
                  { val: "casting", icon: Users, label: "Talent" },
                  { val: "marketing", icon: Megaphone, label: "Sell" },
                  { val: "campaigns", icon: Trophy, label: "Buzz" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.val}
                    value={tab.val}
                    className="flex flex-col items-center gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-slate-500 hover:text-slate-300 transition-all p-2 rounded-none border-none"
                    disabled={
                      tab.val === "marketing" &&
                      (project.state === "development" ||
                        project.state === "production" ||
                        project.state === "needs_greenlight" ||
                        project.state === "pitching")
                    }
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">
                      {tab.label}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="min-h-full">
                <ProjectOverviewTab project={project} scriptedProject={scriptedProject} />

                <ProjectProductionTab
                  project={project}
                  greenlightReport={greenlightReport}
                  onExecuteGreenlight={() => {
                    greenlightProject(project.id);
                    selectProject(null);
                  }}
                />

                <ProjectCastingTab
                  project={project}
                  roleGroups={roleGroups}
                  talentMap={talentMap}
                  cash={cash}
                  onCast={(talentId) => signContract(talentId, project.id)}
                />

                <ProjectMarketingTab
                  project={project}
                  selectedTier={selectedTier}
                  onSelectTier={setSelectedTier}
                  projectionData={projectionData}
                  cash={cash}
                  onLockCampaign={() => {
                    if (selectedTier !== "none") {
                      lockMarketingCampaign(
                        project.id as ProjectId,
                        selectedTier,
                        primaryAngle ?? "SELL_THE_STORY",
                        secondaryAngle ?? undefined
                      );
                    }
                    selectProject(null);
                  }}
                  selectedPrimaryAngle={primaryAngle}
                  onSelectPrimaryAngle={setPrimaryAngle}
                  selectedSecondaryAngle={secondaryAngle}
                  onSelectSecondaryAngle={setSecondaryAngle}
                />

                <ProjectCampaignsTab
                  project={project}
                  activeCampaign={activeCampaign}
                  probabilityData={projectProbabilityData}
                  cash={cash}
                  onSubmitFestival={(body: AwardBody) => {
                    submitToFestival(project.id, body);
                    selectProject(null);
                  }}
                  onLaunchAwards={(tierKey, categories) => {
                    launchAwardsCampaign(project.id, tierKey, categories);
                    selectProject(null);
                  }}
                />
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        <ProjectDetailFooter
          project={project}
          onRenew={() => {
            renewProject(project.id);
            selectProject(null);
          }}
          onExploitFranchise={() => {
            exploitFranchise(project.id);
            selectProject(null);
          }}
          onClose={() => selectProject(null)}
        />
      </DialogContent>
    </Dialog>
  );
};

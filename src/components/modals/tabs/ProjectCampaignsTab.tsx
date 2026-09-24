import {useState} from "react";
import {TabsContent} from "@/components/ui/tabs";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Project, AwardBody} from "@/engine/types";
import {CampaignData} from "@/engine/types/state.types";
import {formatMoney} from "@/engine/utils";
import {Trophy, Package} from "lucide-react";
import {FESTIVALS} from "@/engine/systems/festivals";
import {CAMPAIGN_TIERS} from "@/store/slices/marketingSlice";
import {getCategoriesForFormat} from "@/engine/data/awards.data";
import {SimpleBarChart} from "@/components/charts/SimpleBarChart";

interface ProbabilityDatum {
  category: string;
  probability: number;
}

interface ProjectCampaignsTabProps {
  project: Project;
  activeCampaign?: CampaignData;
  probabilityData: ProbabilityDatum[];
  /** Studio cash on hand — gates FYC tier buttons. */
  cash: number;
  onSubmitFestival: (body: AwardBody) => void;
  onLaunchAwards: (tier: "Grassroots" | "Trade" | "Blitz", categories: string[]) => void;
}

/**
 * Campaigns tab: festival submission, FYC campaign tiers, awards profile
 * bars, win-probability chart, and the IP vault panel.
 */
export const ProjectCampaignsTab = ({
  project,
  activeCampaign,
  probabilityData,
  cash,
  onSubmitFestival,
  onLaunchAwards,
}: ProjectCampaignsTabProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Best Picture"]);

  return (
    <TabsContent value="campaigns" className="mt-0 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/40 border border-white/5 p-6 rounded-none space-y-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Awards & Festivals Pipeline
            </span>
          </div>

          <div className="space-y-4">
            <Select onValueChange={(v) => onSubmitFestival(v as AwardBody)}>
              <SelectTrigger
                aria-label="Festival Submission"
                className="h-12 bg-black border-white/5 text-xs font-black uppercase tracking-widest"
              >
                <SelectValue placeholder="Festival Submission..." />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/5 text-slate-200">
                {FESTIVALS.map((f) => (
                  <SelectItem
                    key={f.body}
                    value={f.body}
                    className="font-bold flex items-center"
                  >
                    {f.name}{" "}
                    <span className="ml-2 text-emerald-400">({formatMoney(f.cost)})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Active FYC Campaign
            </p>
            {activeCampaign ? (
              <div className="p-4 rounded-none bg-amber-500/10 border border-amber-500/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-amber-500 uppercase italic">
                    Active Outreach
                  </span>
                  <Badge className="bg-amber-500 text-black font-black">
                    +{activeCampaign.buzzBonus} BUZZ
                  </Badge>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    Budget
                  </span>
                  <span className="text-[10px] font-mono text-white">
                    {formatMoney(activeCampaign.budget)}
                  </span>
                </div>
                {activeCampaign.targetCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {activeCampaign.targetCategories.map((cat) => (
                      <Badge
                        key={cat}
                        variant="outline"
                        className="text-[8px] font-black uppercase border-amber-500/30 bg-amber-500/5 text-amber-400"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-slate-300 font-medium leading-relaxed italic border-l border-amber-500/30 pl-3">
                  "Direct studio outreach with Academy voters is amplifying {project.title}'s
                  prestige profile."
                </p>
              </div>
            ) : (
              <>
                <Select
                  value={selectedCategories[0]}
                  onValueChange={(v) => setSelectedCategories([v])}
                >
                  <SelectTrigger
                    aria-label="Select Award Category"
                    className="h-10 bg-black border-white/5 text-xs font-black uppercase tracking-widest"
                  >
                    <SelectValue placeholder="Target Category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/5 text-slate-200">
                    {getCategoriesForFormat(project.format).map((cat) => (
                      <SelectItem key={cat} value={cat} className="font-bold">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-3 gap-2">
                  {(["Grassroots", "Trade", "Blitz"] as const).map((tierKey) => {
                    const tier = CAMPAIGN_TIERS[tierKey];
                    return (
                      <Button
                        key={tierKey}
                        variant="outline"
                        className="h-14 flex flex-col items-center justify-center border-white/5 hover:border-amber-500/50 bg-black/40 group"
                        onClick={() => onLaunchAwards(tierKey, selectedCategories)}
                        disabled={cash < tier.cost}
                      >
                        <span className="text-[8px] font-black text-slate-500 uppercase group-hover:text-amber-500">
                          {tierKey}
                        </span>
                        <span className="text-[10px] font-mono font-black text-white">
                          {formatMoney(tier.cost)}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {project.awardsProfile && (
            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/5">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                  <span className="text-slate-500">Academy Sentiment</span>
                  <span className="text-amber-500">
                    {project.awardsProfile.academyAppeal}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-none overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${project.awardsProfile.academyAppeal}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                  <span className="text-slate-500">Campaign Force</span>
                  <span className="text-white">
                    {project.awardsProfile.campaignStrength}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-none overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-white shadow-[0_0_10px_white]"
                    style={{ width: `${project.awardsProfile.campaignStrength}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {probabilityData.length > 0 && (
            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/5">
              <div className="space-y-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">
                  Category Win Probability
                </span>
                <SimpleBarChart
                  data={probabilityData.map((p) => ({
                    label: p.category,
                    value: p.probability,
                    color: "#f59e0b",
                  }))}
                  height={200}
                  valueFormatter={(v) => `${v}%`}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-black/40 border border-white/5 p-6 rounded-none space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-violet-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                IP Vault & Catalog Properties
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-none bg-black/40 border border-white/5">
                <span className="text-xs font-bold text-slate-400">Governance</span>
                <Badge
                  variant="outline"
                  className="text-[10px] font-black uppercase border-slate-700 bg-slate-800"
                >
                  {project.ipRights?.rightsOwner || "Internal Development"}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-none bg-black/40 border border-white/5">
                <span className="text-xs font-bold text-slate-400">Franchise Asset ID</span>
                <span className="text-xs font-mono text-slate-500 uppercase">
                  {project.franchiseId || "New/Standalone"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5/50 flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                Library Residual Valuation
              </span>
              <div className="text-2xl font-black text-emerald-400 font-mono tracking-tighter tabular-nums">
                {formatMoney(project.ipRights?.catalogValue || project.budget * 0.15)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
};

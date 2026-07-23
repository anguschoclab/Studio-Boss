import React, { useMemo, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { formatMoney } from "@/engine/utils";
import { selectAwardsEligibleProjects, selectAwardsOddsById } from "@/store/selectors";
import { selectAwardsProbability } from "@/store/chartSelectors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Sparkles, Filter, Info, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { CAMPAIGN_TIERS } from "@/store/slices/marketingSlice";
import { getCategoriesForFormat } from "@/engine/data/awards.data";
import { AwardsProbabilityChart } from "@/components/charts/AwardsProbabilityChart";

export const AwardsHQ: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const { selectProject } = useUIStore();
  const launchAwardsCampaign = useGameStore((s) => s.launchAwardsCampaign);

  const [formatFilter, setFormatFilter] = useState<"all" | "film" | "tv">("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Best Picture"]);

  const oddsById = useMemo(() => selectAwardsOddsById(gameState), [gameState]);
  const awardsProbability = useMemo(() => selectAwardsProbability(gameState), [gameState]);

  const eligibleProjects = useMemo(() => {
    return selectAwardsEligibleProjects(gameState)
      .filter((p) => formatFilter === "all" || p.format === formatFilter)
      .sort(
        (a, b) => (b.reception?.metaScore || 0) - (a.reception?.metaScore || 0)
      );
  }, [gameState, formatFilter]);

  if (!gameState) return null;

  const currentSeason = Math.floor(gameState.week / 52) + 1;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-none bg-amber-500/10 border border-amber-500/20">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              Awards HQ
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest opacity-70">
            For Your Consideration • Season Cycle {Math.floor(gameState.week / 52) + 1}
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={formatFilter} onValueChange={(v) => setFormatFilter(v as "all" | "film" | "tv")}>
            <SelectTrigger className="h-10 w-40 border-white/5 bg-black/40 text-slate-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Filter className="w-3 h-3" /> <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="film">Film</SelectItem>
              <SelectItem value="tv">TV</SelectItem>
            </SelectContent>
          </Select>
          <Badge
            variant="outline"
            className="h-10 px-4 border-white/5 bg-black/40 text-slate-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
          >
            <Trophy className="w-3 h-3" /> {gameState.industry.awards?.filter((a) => a.status === "won" && a.year === currentSeason).length || 0} WINS
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active Campaigns",
            val: Object.keys(gameState.studio.activeCampaigns || {}).length,
            icon: Target,
            color: "text-primary",
          },
          {
            label: "Season Wins",
            val: gameState.industry.awards?.filter((a) => a.status === "won" && a.year === currentSeason).length || 0,
            icon: Sparkles,
            color: "text-amber-400",
          },
          {
            label: "Critically Acclaimed",
            val: eligibleProjects.filter((p) => (p.reception?.metaScore || 0) >= 75).length,
            icon: Trophy,
            color: "text-emerald-400",
          },
          {
            label: "Academy Standing",
            val: `${gameState.studio.prestige}/100`,
            icon: Info,
            color: "text-violet-400",
          },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5 rounded-none space-y-2">
            <div className="flex items-center justify-between">
              <stat.icon className={cn("w-5 h-5", stat.color)} />
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                {stat.label}
              </span>
            </div>
            <div className="text-2xl font-black text-white italic tracking-tighter">{stat.val}</div>
          </div>
        ))}
      </div>

      {/* Awards Probability Outlook */}
      {awardsProbability.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
            Awards Probability Outlook
          </h2>
          <div className="glass-card p-6 rounded-none">
            <AwardsProbabilityChart data={awardsProbability} />
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
          Eligible Contenders (Last 52 Weeks)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {eligibleProjects.length === 0 ? (
            <div className="col-span-full p-20 rounded-none border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-4">
              <Trophy className="w-12 h-12 text-slate-700" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
                No projects released in the last year are eligible for honors.
              </p>
            </div>
          ) : (
            eligibleProjects.map((project) => {
              const campaign = gameState.studio.activeCampaigns?.[project.id];
              return (
                <div
                  key={project.id}
                  className="group relative glass-card p-6 rounded-none hover:border-primary/30 transition-all overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-primary/50 transition-colors" />

                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <h3
                        className="text-xl font-black italic uppercase tracking-tight text-white group-hover:text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        role="button"
                        aria-label={`View details for ${project.title}`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            selectProject(project.id);
                          }
                        }}
                        onClick={() => selectProject(project.id)}
                      >
                        {project.title}
                      </h3>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        {project.genre} • {project.format} • Released W{project.releaseWeek}
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="text-right">
                        <div
                          className={cn(
                            "text-3xl font-black italic tracking-tighter",
                            (project.reception?.metaScore || 0) >= 75
                              ? "text-emerald-500"
                              : (project.reception?.metaScore || 0) >= 40
                                ? "text-amber-500"
                                : "text-rose-500"
                          )}
                        >
                          {project.reception?.metaScore || "??"}
                        </div>
                        <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">
                          MetaScore
                        </p>
                      </div>
                      <div className="text-right border-l border-white/5 pl-4">
                        <div className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Win Odds</div>
                        <div className="text-2xl font-black italic tracking-tighter text-amber-500 tabular-nums">
                          {oddsById[project.id] ?? 0}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {campaign ? (
                      <div className="p-4 rounded-none bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-amber-500" />
                          <div>
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                              Active Campaign
                            </p>
                            <p className="text-xs font-bold text-white uppercase italic">
                              {campaign.targetCategories?.join(", ") || "FYC Outreach"}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-amber-500 text-black font-black tracking-tighter">
                          +{campaign.buzzBonus} BUZZ · {formatMoney(campaign.budget)}
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                          Launch FYC Campaign
                        </p>
                        <Select
                          value={selectedCategories[0]}
                          onValueChange={(v) => setSelectedCategories([v])}
                        >
                          <SelectTrigger className="h-9 border-white/5 bg-black/40 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {getCategoriesForFormat(project.format).map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(CAMPAIGN_TIERS)
                            .filter(([, t]) => t.type === "awards")
                            .map(([key, tier]) => (
                              <Button
                                key={key}
                                variant="outline"
                                className="h-16 flex flex-col items-center justify-center border-white/5 hover:border-amber-500/50 bg-black/40 group/btn"
                                onClick={() =>
                                  launchAwardsCampaign(
                                    project.id,
                                    key as "Grassroots" | "Trade" | "Blitz",
                                    selectedCategories
                                  )
                                }
                                disabled={
                                  gameState.finance.cash < tier.cost ||
                                  (project.reception?.metaScore || 0) < 65
                                }
                              >
                                <span className="text-[8px] font-black text-slate-500 uppercase group-hover/btn:text-amber-500">
                                  {key}
                                </span>
                                <span className="text-[10px] font-mono font-black text-white">
                                  {formatMoney(tier.cost)}
                                </span>
                              </Button>
                            ))}
                        </div>
                        {(project.reception?.metaScore || 0) < 65 && (
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-rose-500/60 tracking-widest">
                            <Info className="w-3 h-3" /> Project quality below threshold (65+) for
                            FYC efforts.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

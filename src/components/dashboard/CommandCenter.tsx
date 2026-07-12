import React from "react";
import { FinancialOverviewWidget } from "./FinancialOverviewWidget";
import { DemographicsWidget } from "./DemographicsWidget";
import { useGameStore } from "@/store/gameStore";
import { Clapperboard, Users, PieChart, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { KPIStatCard } from "@/components/shared/KPIStatCard";
import { StudioIdentityPanel } from "@/components/studio/StudioIdentityPanel";
import { AchievementsPanel } from "@/components/achievements/AchievementsPanel";

/** Compact currency that handles billions and negatives (cash can go red on loans). */
function formatCash(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(0)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs}`;
}

/** Honest descriptor derived from real rank + share — no hardcoded label. */
function marketPositionLabel(rank: number, total: number, share: number): string {
  if (total <= 1) return "Sole Studio";
  if (rank === 1) return "Market Leader";
  if (rank <= 3 || share >= 15) return "Major Player";
  if (share >= 5) return "Established Studio";
  return "Challenger";
}

export const CommandCenter: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  if (!gameState) return null;

  const { studio, industry, entities, finance } = gameState;
  const projects = Object.values(entities?.projects || {});
  const newsHistory = industry?.newsHistory ?? [];
  const rivals = Object.values(entities?.rivals || {});

  const activeProjectsCount = projects.filter(
    (p) => p.state !== "released" && p.state !== "post_release" && p.state !== "archived"
  ).length;

  const cash = finance?.cash ?? 0;

  // Real market standing — replaces the old hardcoded "MAJOR CHALLENGER".
  // Ranked by capital, matching the engine's own Antitrust concentration metric
  // (which measures dominance by top-1 / top-3 share of industry cash).
  const rivalCash = rivals.map((r) => r.cash || 0);
  const totalStudios = rivals.length + 1;
  const positiveCapital = Math.max(0, cash) + rivalCash.reduce((sum, c) => sum + Math.max(0, c), 0);
  const myShare = positiveCapital > 0 ? (Math.max(0, cash) / positiveCapital) * 100 : 0;
  const myRank = 1 + rivalCash.filter((c) => c > cash).length;
  const positionLabel = marketPositionLabel(myRank, totalStudios, myShare);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Studio header — legible title, real standing */}
      <header className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-5xl font-black not-italic uppercase tracking-tight leading-none">
              {studio.name}
            </h1>
            <span className="inline-flex h-6 items-center bg-primary px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-primary-foreground">
              {studio.archetype.replace("-", " ")}
            </span>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60 not-italic">
            Command Center · Week {gameState.week}
          </p>
        </div>

        {/* Market position: derived from actual capital share, not a fixed string */}
        <div className="flex min-w-[220px] flex-col items-start gap-1 border-l-2 border-primary/60 bg-white/[0.015] px-5 py-4 md:items-end md:text-right">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60 not-italic">
            Market Position
          </span>
          <span className="font-display text-xl font-bold not-italic uppercase tracking-tight text-foreground">
            {positionLabel}
          </span>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            Rank #{myRank} of {totalStudios} · {myShare.toFixed(1)}% capital
          </span>
        </div>
      </header>

      {/* KPI row — real figures */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <KPIStatCard
          label="Cash on Hand"
          value={formatCash(cash)}
          subLabel="Operating Balance"
          icon={<TrendingUp className="h-5 w-5" strokeWidth={1.75} />}
          variant={cash < 0 ? "destructive" : "primary"}
          tooltip="Current liquid funds available to the studio."
        />
        <KPIStatCard
          label="Active Pipeline"
          value={activeProjectsCount}
          subLabel="Live Projects"
          icon={<Clapperboard className="h-5 w-5" strokeWidth={1.75} />}
          variant="secondary"
          tooltip="Projects currently in development or production."
        />
        <KPIStatCard
          label="Capital Share"
          value={`${myShare.toFixed(1)}%`}
          subLabel={`of ${totalStudios} studios`}
          icon={<PieChart className="h-5 w-5" strokeWidth={1.75} />}
          variant="success"
          tooltip="Your share of total industry cash — the metric the engine's antitrust system uses to gauge market dominance."
        />
        <KPIStatCard
          label="Prestige"
          value={studio.prestige}
          subLabel="Studio Reputation"
          icon={<Users className="h-5 w-5" strokeWidth={1.75} />}
          variant="muted"
          tooltip="Reputation level. Affects talent rates and deal leverage."
        />
      </div>

      {/* Strategic visualizations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FinancialOverviewWidget />
        </div>
        <div className="lg:col-span-1">
          <DemographicsWidget />
        </div>
      </div>

      {/* Studio identity & achievements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-white/10 bg-white/[0.015] p-8">
          <StudioIdentityPanel culture={studio.culture} />
        </div>
        <div className="border border-white/10 bg-white/[0.015] p-8">
          <AchievementsPanel />
        </div>
      </div>

      {/* Industry news — honest label, no surveillance theatre */}
      <section className="border border-white/10 bg-white/[0.015]">
        <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
          <h2 className="font-display text-lg font-bold not-italic uppercase tracking-tight">
            Industry News
          </h2>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 not-italic">
            Latest headlines
          </span>
        </div>

        <div className="grid grid-cols-1 gap-px bg-white/5 md:grid-cols-2">
          {newsHistory.length > 0 ? (
            newsHistory.slice(0, 6).map((news, i) => (
              <article
                key={news.id}
                className={cn(
                  "flex items-start gap-4 bg-background p-5 transition-colors duration-200 hover:bg-white/[0.03]",
                  i === 0 && "md:col-span-2"
                )}
              >
                <div className="flex shrink-0 flex-col items-center justify-center border border-white/10 px-3 py-2 text-center">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40">
                    Wk
                  </span>
                  <span className="font-display text-base font-bold tabular-nums leading-none not-italic">
                    {news.week}
                  </span>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-display text-base font-bold not-italic leading-snug text-foreground">
                    {news.headline}
                  </p>
                  {news.description && (
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      {news.description}
                    </p>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full bg-background py-16 text-center text-sm text-muted-foreground/40">
              No industry activity yet. Advance the week to generate headlines.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

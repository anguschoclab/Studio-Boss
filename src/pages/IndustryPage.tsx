import React, { useMemo } from "react";
import { useGameStore } from "@/store/gameStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { KPIStatCard } from "@/components/shared/KPIStatCard";
import { formatMoney } from "@/engine/utils";
import {
  Building2,
  Users,
  TrendingDown,
  Zap,
  ShieldAlert,
  Target,
  Brain,
  BarChart3,
  Globe2,
  TrendingUp,
  DollarSign,
  Activity,
  AlertTriangle,
  Monitor,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CompetitorComparison } from "@/components/industry/CompetitorComparison";
import { MarketTrendsHeatmap } from "@/components/industry/MarketTrendsHeatmap";

export const IndustryPage: React.FC = () => {
  const state = useGameStore((s) => s.gameState);

  const { rivals } = state?.entities || { rivals: {} };
  const { agencies, agents } = state?.industry || { agencies: [], agents: [] };
  const genrePopularity = state?.studio?.culture?.genrePopularity || {
    Drama: 50,
    Comedy: 50,
    Action: 50,
    "Sci-Fi": 50,
    Horror: 50,
    Romance: 50,
  };

  const rivalsList = Object.values(rivals) as any[];

  const marketFatigue = useMemo(() => {
    if (!state) return {};
    const saturation: Record<string, number> = {};
    [
      ...Object.values(state.entities.projects),
      ...Object.values(state.entities.rivals).flatMap((r) => Object.values(r.projects || {})),
    ].forEach((p) => {
      if (p.genre) {
        const g = p.genre.toUpperCase();
        saturation[g] = (saturation[g] || 0) + 1;
      }
    });
    return saturation;
  }, [state]);

  if (!state) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-700">
      <header className="flex flex-col gap-3 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Globe2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none mb-1">
              Industry Intelligence
            </h1>
            <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.25em]">
              Real-time Analysis • Competitor Profiles • Market Saturation • Agency Leverage
            </p>
          </div>
        </div>
      </header>

      {/* Market Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPIStatCard
          label="Market Sentiment"
          value={`${state.finance.marketState?.sentiment || 50}%`}
          subLabel={state.finance.marketState?.cycle || "STABLE"}
          icon={<Activity className="w-4 h-4" />}
          trend={{ value: (state.finance.marketState?.sentiment || 50) > 50 ? "↑" : "↓", isPositive: (state.finance.marketState?.sentiment || 50) > 50 }}
          variant="secondary"
        />
        <KPIStatCard
          label="Active Rivals"
          value={rivalsList.length}
          subLabel="Competing Entities"
          icon={<Building2 className="w-4 h-4" />}
          variant="destructive"
        />
        <KPIStatCard
          label="Genre Diversity"
          value={Object.keys(genrePopularity).length}
          subLabel="Tracked Sectors"
          icon={<BarChart3 className="w-4 h-4" />}
        />
        <KPIStatCard
          label="Agency Influence"
          value={agencies.length}
          subLabel="Strategic Partners"
          icon={<Users className="w-4 h-4" />}
          variant="secondary"
        />
      </div>

      <m.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-10"
      >
        {/* Left Column: Rival Motivations & Power */}
        <div className="lg:col-span-8 space-y-10">
          <m.section variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-destructive" />
              <h2 className="text-xl font-display font-black uppercase tracking-widest text-foreground italic">
                Strategic Competitor Profiles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rivalsList.map((rival) => (
                <Card
                  key={rival.id}
                  className="glass-card border-white/5 hover:border-destructive/30 transition-all group overflow-hidden relative bg-white/[0.01]"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 scale-150 group-hover:opacity-10 transition-opacity">
                    <Building2 className="w-24 h-24" />
                  </div>

                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-display font-black tracking-tighter uppercase italic group-hover:text-destructive transition-colors">
                          {rival.name}
                        </CardTitle>
                        <CardDescription className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">
                          {rival.archetype} Archetype
                        </CardDescription>
                      </div>
                      <div className="px-3 py-1 bg-destructive/10 border border-destructive/20 rounded-none">
                        <span className="text-[10px] font-display font-black text-destructive uppercase tracking-widest">
                          POWER {rival.strength}%
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Motivation Block */}
                    <div className="bg-black/40 p-4 border border-white/5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Brain className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">
                          Current Vector
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-display font-black text-foreground uppercase italic tracking-tight">
                          {rival.currentMotivation?.replace("_", " ") || "NONE"}
                        </span>
                        <Badge className="bg-primary text-black font-black text-[8px] tracking-widest px-2 h-5 rounded-none">
                          OPERATIONAL
                        </Badge>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase font-black tracking-[0.25em] text-muted-foreground/30">
                          Liquid Reserves
                        </span>
                        <div className="text-sm font-display font-black text-foreground tracking-tight italic">
                          {formatMoney(rival.cash)}
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <span className="text-[8px] uppercase font-black tracking-[0.25em] text-muted-foreground/30">
                          Active Slates
                        </span>
                        <div className="text-sm font-display font-black text-foreground tracking-tight italic">
                          {Object.keys(rival.projects || {}).length} PROJECTS
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </m.section>

          {/* Market Sentiment / Fatigue Section */}
          <m.section variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-display font-black uppercase tracking-widest text-foreground italic">
                Market Saturation Metrics
              </h2>
            </div>

            <Card className="glass-card border-white/5 bg-white/[0.01]">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {Object.entries(genrePopularity)
                    .slice(0, 6)
                    .map(([genre, pop]) => {
                      const saturation = marketFatigue[genre.toUpperCase()] || 0;
                      const fatigue = Math.min(100, (saturation / 10) * 100);

                      return (
                        <div key={genre} className="space-y-3">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/60">
                              {genre}
                            </span>
                            <span
                              className={cn(
                                "text-[8px] font-black px-2 py-0.5 uppercase tracking-widest",
                                fatigue > 70
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-primary/10 text-primary"
                              )}
                            >
                              {fatigue > 70 ? "CRITICAL FATIGUE" : "OPTIMAL"}
                            </span>
                          </div>
                          <div className="relative h-1.5 bg-white/5 overflow-hidden">
                            <m.div
                              initial={{ width: 0 }}
                              animate={{ width: `${fatigue}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className={cn(
                                "h-full shadow-[0_0_8px_rgba(var(--primary),0.2)]",
                                fatigue > 70 ? "bg-destructive" : "bg-primary"
                              )}
                            />
                          </div>
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.15em] text-muted-foreground/30">
                            <span>Sentiment: {pop as React.ReactNode}%</span>
                            <span>Market Load: {saturation} Units</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </m.section>
        </div>

        {/* Right Column: Agency Standing */}
        <div className="lg:col-span-4 space-y-10">
          <m.section variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-black uppercase tracking-widest text-foreground italic">
                Agency Power
              </h2>
            </div>

            <div className="space-y-4">
              {agencies
                .sort((a, b) => b.leverage - a.leverage)
                .map((agency, i) => {
                  const agencyAgents = agents.filter((ag) => ag.agencyId === agency.id);

                  return (
                    <Card
                      key={agency.id}
                      className="glass-card border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group"
                    >
                      <CardContent className="p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4 items-center">
                            <span className="text-2xl font-display font-black opacity-10 group-hover:opacity-20 transition-opacity italic">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <h4 className="font-display font-black text-base tracking-tighter uppercase italic leading-none">
                                {agency.name}
                              </h4>
                              <span className="text-[8px] uppercase font-black text-muted-foreground/40 tracking-[0.2em]">
                                {agency.archetype} Entity
                              </span>
                            </div>
                          </div>
                          <div className="px-2 py-0.5 bg-white/5 border border-white/10">
                            <span className="text-[9px] font-display font-black uppercase tracking-widest">
                              LEV {agency.leverage}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-[8px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">
                            <span>Strategic Leverage</span>
                            <span>{agency.leverage}%</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${agency.leverage}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 text-secondary" />
                            {agencyAgents.length} OPERATIVES
                          </div>
                          <div className="flex items-center gap-2">
                            <Monitor className="w-3 h-3 text-secondary" />
                            {agency.culture}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </m.section>

          {/* Market Trends Heatmap */}
          <m.section variants={itemVariants}>
            <MarketTrendsHeatmap />
          </m.section>

          {/* Quick Industry Summary */}
          <m.section variants={itemVariants}>
            <Card className="bg-primary/5 border-primary/20 overflow-hidden relative rounded-none">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <ShieldAlert className="w-16 h-16 text-primary" />
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                  Strategic Pulse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col">
                  <span className="text-4xl font-display font-black text-foreground tracking-tighter italic leading-none mb-1">
                    {state.finance.marketState?.sentiment || 50}%
                  </span>
                  <span className="text-[8px] uppercase font-black text-muted-foreground/40 tracking-[0.2em]">
                    Global Sentiment Index
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-display font-black text-primary uppercase tracking-tighter italic leading-none mb-1">
                    {state.finance.marketState?.cycle || "STABLE"}
                  </span>
                  <span className="text-[8px] uppercase font-black text-muted-foreground/40 tracking-[0.2em]">
                    Macroeconomic Phase
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground/60 italic border-l-2 border-primary/30 pl-4 py-1 leading-relaxed">
                  Intelligence suggests institutional M&A activity is cooling as macro conditions
                  stabilize.
                </p>
              </CardContent>
            </Card>
          </m.section>
        </div>
      </m.div>
    </div>
  );
};

export default IndustryPage;

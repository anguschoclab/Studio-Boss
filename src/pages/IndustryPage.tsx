import React, { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { StatCard } from '@/components/shared/StatCard';
import { formatMoney } from '@/engine/utils';
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
  AlertTriangle
} from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CompetitorComparison } from '@/components/industry/CompetitorComparison';
import { MarketTrendsHeatmap } from '@/components/industry/MarketTrendsHeatmap';

export const IndustryPage: React.FC = () => {
  const state = useGameStore(s => s.gameState);

  const { rivals } = state?.entities || { rivals: {} };
  const { agencies, agents } = state?.industry || { agencies: [], agents: [] };
  const genrePopularity = state?.studio?.culture?.genrePopularity || {
    'Drama': 50,
    'Comedy': 50,
    'Action': 50,
    'Sci-Fi': 50,
    'Horror': 50,
    'Romance': 50
  };

  const rivalsList = Object.values(rivals) as any[];

  // Calculate Genre Fatigue (Sample logic: comparing popularity vs saturation)
  // In a real scenario, we'd pull this from the fatigueEngine state if we persist it
  const marketFatigue = useMemo(() => {
    if (!state) {
      return {};
    }
    const saturation: Record<string, number> = {};
    [
      ...Object.values(state.entities.projects),
      ...Object.values(state.entities.rivals).flatMap(r => Object.values(r.projects || {}))
    ].forEach(p => {
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
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Globe2 className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-4xl font-black tracking-tighter uppercase font-display bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
            Industry Intelligence Hub
          </h1>
        </div>
        <p className="text-muted-foreground font-medium tracking-tight">
          Real-time analysis of competitor motivations, agency leverage, and market saturation.
        </p>
      </header>

      {/* Market Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Market Sentiment"
          value={`${state.finance.marketState?.sentiment || 50}%`}
          subtitle={state.finance.marketState?.cycle || 'STABLE'}
          icon={Activity}
          color={(state.finance.marketState?.sentiment || 50) > 60 ? 'success' : (state.finance.marketState?.sentiment || 50) < 40 ? 'warning' : 'info'}
          size="sm"
        />
        <StatCard
          title="Active Rivals"
          value={rivalsList.length}
          subtitle="Competing studios"
          icon={Building2}
          color="destructive"
          size="sm"
        />
        <StatCard
          title="Genre Diversity"
          value={Object.keys(genrePopularity).length}
          subtitle="Tracked categories"
          icon={BarChart3}
          color="secondary"
          size="sm"
        />
        <StatCard
          title="Agencies"
          value={agencies.length}
          subtitle="Active representatives"
          icon={Users}
          color="primary"
          size="sm"
        />
      </div>

      <m.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Left Column: Rival Motivations & Power */}
        <div className="lg:col-span-8 space-y-6">
          <m.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Target className="w-5 h-5 text-destructive" />
              <h2 className="text-xl font-bold font-display uppercase tracking-widest text-foreground/90">Competitor Strategic Profiles</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rivalsList.map(rival => (
                <Card key={rival.id} className="bg-card/40 backdrop-blur-sm border-border/50 hover:border-destructive/30 transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 group-hover:opacity-10 transition-opacity">
                    <Building2 className="w-16 h-16" />
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-black tracking-tight group-hover:text-destructive transition-colors">
                          {rival.name}
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                          Archetype: {rival.archetype}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-mono text-[10px]">
                        POWER {rival.strength}%
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Motivation Block */}
                    <div className="bg-background/50 rounded-lg p-3 border border-border/40 space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary">Current Motivation</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-foreground capitalize italic">
                          "{rival.currentMotivation?.replace('_', ' ') || 'None'}"
                        </span>
                        <TooltipWrapper tooltip="This studio's primary strategic focus this week. Affects bidding aggression and talent selection." side="left">
                          <Badge className="text-[9px] h-5 bg-primary/20 text-primary border-none">ACTIVE</Badge>
                        </TooltipWrapper>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-[11px] font-bold uppercase tracking-tight text-muted-foreground/80">
                      <div className="flex flex-col gap-1">
                        <span className="opacity-50">Cash Reserves</span>
                        <span className="text-foreground font-mono">{formatMoney(rival.cash)}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="opacity-50">Active Slates</span>
                        <span className="text-foreground">{Object.keys(rival.projects || {}).length} Projects</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </m.section>

          {/* Market Sentiment / Fatigue Section */}
          <m.section variants={itemVariants} className="space-y-4">
             <div className="flex items-center gap-2 px-1">
              <TrendingDown className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold font-display uppercase tracking-widest text-foreground/90">Market Saturation & Fatigue</h2>
            </div>
            
            <Card className="bg-card/40 backdrop-blur-sm border-border/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {Object.entries(genrePopularity).slice(0, 6).map(([genre, pop]) => {
                    const saturation = marketFatigue[genre.toUpperCase()] || 0;
                    const fatigue = Math.min(100, (saturation / 10) * 100);
                    
                    return (
                      <div key={genre} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-black uppercase tracking-widest text-foreground/80">{genre}</span>
                          <span className={cn(
                            "text-[10px] font-mono font-bold px-2 py-0.5 rounded",
                            fatigue > 70 ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                          )}>
                            {fatigue > 70 ? 'CRITICAL FATIGUE' : 'STABLE'}
                          </span>
                        </div>
                        <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                           <m.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${fatigue}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className={cn(
                                "h-full rounded-full shadow-[0_0_8px_rgba(var(--primary),0.2)]",
                                fatigue > 70 ? "bg-destructive" : "bg-primary"
                              )}
                           />
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-muted-foreground/60">
                           <span>Popularity: {pop as React.ReactNode}%</span>
                           <span>Active Industry Projects: {saturation}</span>
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
        <div className="lg:col-span-4 space-y-6">
          <m.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold font-display uppercase tracking-widest text-foreground/90">Agency Power Rankings</h2>
            </div>

            <div className="space-y-3">
              {agencies.sort((a, b) => b.leverage - a.leverage).map((agency, i) => {
                const agencyAgents = agents.filter(ag => ag.agencyId === agency.id);
                
                return (
                  <Card key={agency.id} className="bg-background/40 border-border/50 hover:bg-background/60 transition-colors group">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                          <span className="text-lg font-black font-mono opacity-20 group-hover:opacity-40 transition-opacity">
                            #0{i + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-sm tracking-tight">{agency.name}</h4>
                            <span className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">
                               {agency.archetype}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          LEV {agency.leverage}
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                         <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground/80">
                            <span>Negotiation Leverage</span>
                            <span>{agency.leverage}%</span>
                         </div>
                         <Progress value={agency.leverage} className="h-1 bg-muted/30" />
                      </div>

                      <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground opacity-70">
                        <div className="flex items-center gap-1">
                           <Users className="w-3 h-3" />
                           {agencyAgents.length} Agents
                        </div>
                        <div className="flex items-center gap-1 capitalize">
                           <BarChart3 className="w-3 h-3" />
                           {agency.culture} Culture
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
            <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShieldAlert className="w-12 h-12 text-primary" />
              </div>
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Market Pulse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex flex-col">
                    <span className="text-2xl font-black font-mono text-foreground">
                       {state.finance.marketState?.sentiment || 50}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Market Sentiment</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xl font-bold text-primary uppercase">
                       {state.finance.marketState?.cycle || 'STABLE'}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Economic Cycle</span>
                 </div>
                 <p className="text-[11px] text-muted-foreground/80 italic border-l-2 border-primary/30 pl-2">
                    Industry insiders suggest major M&A activity is cooling off as interest rates stabilize.
                 </p>
              </CardContent>
            </Card>
          </m.section>

          {/* Competitor Comparison */}
          <m.section variants={itemVariants}>
            <CompetitorComparison />
          </m.section>
        </div>
      </m.div>
    </div>
  );
};

export default IndustryPage;

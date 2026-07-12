import React from "react";
import { useGameStore } from "@/store/gameStore";
import { selectBuyers, selectProjects } from "@/store/selectors";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Handshake, Target, Briefcase } from "lucide-react";
import { Buyer, Project, MandateType } from "@/engine/types";
import { calculateFitScore } from "@/engine/systems/buyers";
import { cn } from "@/lib/utils";

export const DealsDesk = () => {
  const gameState = useGameStore((s) => s.gameState);
  const buyers = selectBuyers(gameState);
  const projects = selectProjects(gameState);
  const pitchingProjects = projects.filter(
    (p) => p.state === "pitching" || p.state === "development"
  );

  return (
    <div className="h-full flex flex-col space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden">
      {/* Deals Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white/[0.02] p-10 rounded-none border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[120px] -mr-32 -mt-32" />

        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-2">
            <div className="w-16 h-16 rounded-none bg-blue-500/5 border border-blue-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              <Briefcase className="h-8 w-8 text-blue-400" strokeWidth={1} />
            </div>
            <div>
              <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none mb-3 drop-shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                DEALS DESK & DISTRIBUTION
              </h2>
              <p className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.4em] italic flex items-center gap-4">
                MANDATE TRACKING
                <span className="w-1.5 h-1.5 bg-white/10" />
                GLOBAL TERRITORY MANAGEMENT
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 relative z-10">
          <div className="bg-blue-500/5 border border-blue-500/20 text-blue-400 px-8 py-4 rounded-none flex flex-col gap-1 shadow-[0_0_20px_rgba(59,130,246,0.05)] min-w-[200px]">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">
              PARTNERS
            </span>
            <span className="text-2xl font-display font-black italic leading-none">
              {buyers.length} NETWORK
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-10 overflow-hidden">
        {/* Buyers List */}
        <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
          <div className="flex items-center gap-4 px-2">
            <div className="w-2 h-6 rounded-none bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/80 italic">
              DISTRIBUTION ACQUISITIONS
            </h3>
          </div>
          <ScrollArea className="flex-1 pr-6 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
              {buyers.map((buyer) => (
                <BuyerCard
                  key={buyer.id}
                  buyer={buyer}
                  projects={pitchingProjects}
                  week={gameState?.week || 0}
                  allProjects={projects}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Pitching Slate Sidebar */}
        <div className="w-full lg:w-96 flex flex-col space-y-6 shrink-0 overflow-hidden">
          <div className="flex items-center gap-4 px-2">
            <div className="w-2 h-6 rounded-none bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/80 italic">
              ACTIVE SLATE BRIEFING
            </h3>
          </div>
          <div className="flex-1 glass-card border border-white/5 rounded-none overflow-hidden flex flex-col p-6 bg-white/[0.01] shadow-2xl">
            <ScrollArea className="flex-1 custom-scrollbar">
              <div className="space-y-4 pr-4">
                {pitchingProjects.length === 0 ? (
                  <div className="text-center py-32 opacity-20 flex flex-col items-center gap-6">
                    <Handshake className="w-12 h-12" strokeWidth={1} />
                    <p className="text-[10px] uppercase font-black tracking-[0.4em] italic">
                      NO ACTIVE PITCH SLATE
                    </p>
                  </div>
                ) : (
                  pitchingProjects.map((p) => (
                    <div
                      key={p.id}
                      className="p-6 rounded-none bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all duration-700 group cursor-pointer shadow-lg"
                    >
                      <div className="text-xs font-black uppercase tracking-[0.2em] group-hover:text-primary transition-all duration-700 truncate italic leading-none mb-3">
                        {p.title}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase text-muted-foreground/30 font-black tracking-[0.3em] italic">
                          {p.genre}
                        </span>
                        <div className="text-[9px] px-3 h-5 bg-primary/5 text-primary border border-primary/20 font-black uppercase flex items-center justify-center rounded-none italic shadow-[0_0_10px_rgba(var(--primary),0.1)]">
                          {p.budgetTier}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

const getMandateStyle = (type?: MandateType) => {
  switch (type) {
    case "prestige":
      return "text-amber-400 bg-amber-400/5 border-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]";
    case "sci-fi":
      return "text-purple-400 bg-purple-400/5 border-purple-400/20 shadow-[0_0_15px_rgba(192,132,252,0.1)]";
    case "comedy":
      return "text-yellow-400 bg-yellow-400/5 border-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.1)]";
    case "drama":
      return "text-blue-400 bg-blue-400/5 border-blue-400/20 shadow-[0_0_15px_rgba(96,165,250,0.1)]";
    case "budget_freeze":
      return "text-red-500 bg-red-500/5 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
    case "broad_appeal":
      return "text-emerald-400 bg-emerald-400/5 border-emerald-400/20 shadow-[0_0_15_rgba(52,211,153,0.1)]";
    default:
      return "text-muted-foreground/40 bg-white/5 border-white/10";
  }
};

const BuyerCard = ({
  buyer,
  projects,
  week,
  allProjects,
}: {
  buyer: Buyer;
  projects: Project[];
  week: number;
  allProjects: Project[];
}) => {
  return (
    <Card className="glass-card border border-white/5 rounded-none hover:border-blue-500/40 group transition-all duration-700 bg-white/[0.01] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <CardContent className="p-8 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h4 className="font-display text-xl font-black tracking-tighter uppercase italic group-hover:text-blue-400 transition-all duration-700 leading-none mb-3 drop-shadow-[0_0_10px_rgba(59,130,246,0.1)]">
              {buyer.name}
            </h4>
            <div className="flex items-center gap-3">
              <div className="text-[9px] font-black border border-white/10 bg-white/[0.02] uppercase px-3 h-5 flex items-center justify-center tracking-[0.2em] rounded-none italic text-muted-foreground/40">
                {buyer.archetype}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "px-4 h-6 border text-[9px] font-black uppercase tracking-[0.25em] flex items-center justify-center rounded-none italic",
              getMandateStyle(buyer.currentMandate?.type)
            )}
          >
            {buyer.currentMandate?.type || "OPEN SLATE"}
          </div>
        </div>

        {/* Intelligence Feed */}
        <div className="p-4 bg-black/40 rounded-none border border-white/5 shadow-inner">
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed italic uppercase tracking-wider group-hover:text-muted-foreground transition-all duration-700">
            {buyer.currentMandate
              ? `STRATEGIC FOCUS LOCKED UNTIL WEEK ${buyer.currentMandate.activeUntilWeek}. HIGH PRIORITY FOR ${buyer.currentMandate.type.toUpperCase()} ASSETS.`
              : "ACQUISITION DESK IS CURRENTLY SEEKING NEW HIGH-POTENTIAL PROPERTY SLATES."}
          </p>
        </div>

        {/* Fit Analysis */}
        {projects.length > 0 && (
          <div className="space-y-5">
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 flex items-center justify-between italic">
              <span className="flex items-center gap-2">
                <Target className="h-3 w-3" /> ACQUISITION FIT ANALYSIS
              </span>
            </div>
            <div className="space-y-5">
              {projects.slice(0, 2).map((p) => {
                const fit = calculateFitScore(p, buyer, week, allProjects);
                return (
                  <div key={p.id} className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] italic leading-none">
                      <span className="truncate max-w-[200px] text-foreground/60 group-hover:text-foreground/90 transition-all duration-700">
                        {p.title}
                      </span>
                      <span
                        className={cn(
                          "font-mono drop-shadow-[0_0_10px_rgba(var(--color),0.3)]",
                          fit > 70
                            ? "text-emerald-400"
                            : fit > 40
                              ? "text-amber-400"
                              : "text-red-500"
                        )}
                      >
                        {fit}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/[0.03] rounded-none overflow-hidden border border-white/5">
                      <div
                        className={cn(
                          "h-full rounded-none transition-all duration-1000",
                          fit > 70
                            ? "bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                            : fit > 40
                              ? "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                              : "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                        )}
                        style={{ width: `${fit}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-white/5">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-[10px] font-black uppercase tracking-[0.3em] h-12 border-white/10 bg-white/[0.02] hover:bg-blue-500 hover:text-black hover:border-blue-400 transition-all duration-700 rounded-none italic shadow-xl"
          >
            NEGOTIATE TERMS
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

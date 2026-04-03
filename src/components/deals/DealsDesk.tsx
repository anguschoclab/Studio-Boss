import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { selectBuyers, selectProjects } from '@/store/selectors';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Handshake, Tv, Globe, Zap, BarChart3, Info, Target, Briefcase } from 'lucide-react';
import { Buyer, Project, MandateType } from '@/engine/types';
import { calculateFitScore } from '@/engine/systems/buyers';
import { cn } from '@/lib/utils';

export const DealsDesk = () => {
  const gameState = useGameStore(s => s.gameState);
  const buyers = selectBuyers(gameState);
  const projects = selectProjects(gameState);
  const pitchingProjects = projects.filter(p => p.state === 'pitching' || p.state === 'development');

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
      {/* Deals Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-r from-white/5 to-transparent p-5 rounded-xl border border-white/5 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Briefcase className="h-6 w-6 text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase leading-none bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent drop-shadow-sm">Deals Desk & Distribution</h2>
                <p className="text-[11px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">Mandate Tracking • Global Territory Management</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400 uppercase font-black tracking-widest text-[9px] py-1 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
              {buyers.length} Network Partners
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Buyers List */}
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-4 rounded-full bg-blue-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/80 flex items-center gap-2">
              Distribution Acquisitions
            </h3>
          </div>
          <ScrollArea className="flex-1 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
              {buyers.map(buyer => (
                <BuyerCard key={buyer.id} buyer={buyer} projects={pitchingProjects} week={gameState?.week || 0} allProjects={projects} />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Pitching Slate Sidebar */}
        <div className="w-full lg:w-80 flex flex-col space-y-4 shrink-0 overflow-hidden group/sidebar">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-4 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/80 flex items-center gap-2 group-hover/sidebar:text-foreground transition-colors">
              Active Slate Briefing
            </h3>
          </div>
          <div className="flex-1 glass-card bg-gradient-to-b from-white/[0.02] to-transparent border-none overflow-hidden flex flex-col p-4 relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />
            <ScrollArea className="flex-1 relative z-10">
              <div className="space-y-3 pr-3">
                {pitchingProjects.length === 0 ? (
                  <div className="text-center py-20 opacity-30 hover:opacity-80 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                       <Handshake className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">No Active Pitch Slate</p>
                  </div>
                ) : (
                  pitchingProjects.map(p => (
                    <div key={p.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-primary/40 hover:bg-white/[0.06] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors duration-300" />
                      <div className="text-[11px] font-black uppercase tracking-tight text-foreground/90 group-hover:text-primary transition-colors truncate drop-shadow-sm">{p.title}</div>
                      <div className="flex justify-between items-center mt-2.5">
                        <span className="text-[9px] uppercase text-muted-foreground/60 font-bold tracking-widest group-hover:text-muted-foreground/80 transition-colors">{p.genre}</span>
                        <Badge className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 font-black uppercase shadow-inner">{p.budgetTier}</Badge>
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
    case 'prestige': return 'text-amber-400 bg-amber-400/10 border-amber-400/30 shadow-[0_0_10px_rgba(251,191,36,0.15)] text-shadow-amber';
    case 'sci-fi': return 'text-purple-400 bg-purple-400/10 border-purple-400/30 shadow-[0_0_10px_rgba(192,132,252,0.15)] text-shadow-purple';
    case 'comedy': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.15)] text-shadow-yellow';
    case 'drama': return 'text-blue-400 bg-blue-400/10 border-blue-400/30 shadow-[0_0_10px_rgba(96,165,250,0.15)] text-shadow-blue';
    case 'budget_freeze': return 'text-destructive bg-destructive/10 border-destructive/30 shadow-[0_0_10px_rgba(239,68,68,0.15)] text-shadow-destructive';
    case 'broad_appeal': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-[0_0_10px_rgba(52,211,153,0.15)] text-shadow-emerald';
    default: return 'text-muted-foreground bg-white/5 border-white/10 shadow-inner';
  }
};

const BuyerCard = ({ buyer, projects, week, allProjects }: { buyer: Buyer, projects: Project[], week: number, allProjects: Project[] }) => {
  return (
    <Card className="glass-card border border-white/5 hover:border-white/10 hover-glow group transition-all duration-500 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
      <CardContent className="p-5 space-y-5 relative z-10">
        {/* Decorative Background Element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-700" />

        {/* Header */}
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h4 className="font-display text-base font-black tracking-tighter uppercase text-foreground/90 group-hover:text-blue-400 transition-colors duration-300 leading-tight drop-shadow-sm">{buyer.name}</h4>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="outline" className="text-[9px] font-black border-white/10 bg-black/40 uppercase py-0.5 tracking-widest text-muted-foreground group-hover:text-foreground/80 transition-colors shadow-inner">{buyer.archetype}</Badge>
            </div>
          </div>
          <div className={cn("px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 group-hover:scale-105", getMandateStyle(buyer.currentMandate?.type))}>
            {buyer.currentMandate?.type || 'Open Slate'}
          </div>
        </div>

        {/* Intelligence Feed */}
        <div className="p-3 bg-black/40 rounded-lg border border-white/5 relative z-10 group-hover:border-white/10 transition-colors duration-300 shadow-inner">
          <p className="text-[10px] text-muted-foreground/80 leading-relaxed italic group-hover:text-muted-foreground transition-colors">
            {buyer.currentMandate 
              ? `Strategic focus locked until Week ${buyer.currentMandate.activeUntilWeek}. High priority for ${buyer.currentMandate.type} assets.` 
              : 'Acquisition desk is currently seeking new high-potential property slates.'}
          </p>
        </div>

        {/* Fit Analysis */}
        {projects.length > 0 && (
          <div className="space-y-3">
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Target className="h-2.5 w-2.5" /> Acquisition Fit Analysis</span>
            </div>
            <div className="space-y-3">
              {projects.slice(0, 2).map(p => {
                const fit = calculateFitScore(p, buyer, week, allProjects);
                return (
                  <div key={p.id} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                      <span className="truncate max-w-[150px] text-foreground/80 opacity-60 group-hover:opacity-100 transition-opacity">{p.title}</span>
                      <span className={cn(
                        "text-glow font-mono",
                        fit > 70 ? 'text-emerald-400' : fit > 40 ? 'text-amber-400' : 'text-destructive'
                      )}>{fit}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          fit > 70 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : fit > 40 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]'
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
        
        <div className="pt-2">
           <Button variant="outline" size="sm" className="w-full text-[9px] font-black uppercase tracking-[0.2em] h-9 border-white/10 hover:bg-blue-500 hover:text-white hover:border-blue-400 transition-all group/btn shadow-xl">
             Negotiate Terms
           </Button>
        </div>
      </CardContent>
    </Card>
  );
};

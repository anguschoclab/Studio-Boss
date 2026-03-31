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
  const buyers = useGameStore(s => selectBuyers(s.gameState));
  const projects = useGameStore(s => selectProjects(s.gameState));
  const pitchingProjects = projects.filter(p => p.state === 'pitching' || p.state === 'development');

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
      {/* Deals Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/5 p-5 rounded-xl border border-white/5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Deals Desk & Distribution</h2>
          </div>
          <p className="text-[11px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">Mandate Tracking • Global Territory Management</p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-500/5 border-blue-500/20 text-blue-400 uppercase font-black tracking-widest text-[9px] py-1">
            {buyers.length} Network Partners
          </Badge>
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
        <div className="w-full lg:w-80 flex flex-col space-y-4 shrink-0 overflow-hidden">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-4 rounded-full bg-primary" />
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/80 flex items-center gap-2">
              Active Slate Briefing
            </h3>
          </div>
          <div className="flex-1 glass-card border-none overflow-hidden flex flex-col p-4">
            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {pitchingProjects.length === 0 ? (
                  <div className="text-center py-20 opacity-20">
                    <Handshake className="w-10 h-10 mx-auto mb-3" />
                    <p className="text-[10px] uppercase font-black tracking-widest">No Active Pitch Slate</p>
                  </div>
                ) : (
                  pitchingProjects.map(p => (
                    <div key={p.id} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-primary/40 transition-all group cursor-pointer">
                      <div className="text-[11px] font-black uppercase tracking-tight group-hover:text-primary transition-colors truncate">{p.title}</div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[9px] uppercase text-muted-foreground/60 font-black tracking-widest">{p.genre}</span>
                        <Badge className="text-[9px] px-1.5 h-4 bg-primary/10 text-primary border-primary/20 font-black uppercase">{p.budgetTier}</Badge>
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
    case 'prestige': return 'text-amber-400 bg-amber-400/10 border-amber-400/30 text-shadow-amber';
    case 'sci-fi': return 'text-purple-400 bg-purple-400/10 border-purple-400/30 text-shadow-purple';
    case 'comedy': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30 text-shadow-yellow';
    case 'drama': return 'text-blue-400 bg-blue-400/10 border-blue-400/30 text-shadow-blue';
    case 'budget_freeze': return 'text-destructive bg-destructive/10 border-destructive/30 text-shadow-destructive';
    case 'broad_appeal': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 text-shadow-emerald';
    default: return 'text-muted-foreground bg-white/5 border-white/10';
  }
};

const BuyerCard = ({ buyer, projects, week, allProjects }: { buyer: Buyer, projects: Project[], week: number, allProjects: Project[] }) => {
  return (
    <Card className="glass-card border-none hover-glow group transition-all duration-300">
      <CardContent className="p-5 space-y-5 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-display text-base font-black tracking-tighter uppercase group-hover:text-blue-400 transition-colors leading-tight">{buyer.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[9px] font-black border-white/10 bg-white/5 uppercase py-0 tracking-widest">{buyer.archetype}</Badge>
            </div>
          </div>
          <div className={cn("px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-[0.15em]", getMandateStyle(buyer.currentMandate?.type))}>
            {buyer.currentMandate?.type || 'Open Slate'}
          </div>
        </div>

        {/* Intelligence Feed */}
        <div className="p-3 bg-black/20 rounded border border-white/5">
          <p className="text-[10px] text-muted-foreground leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
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

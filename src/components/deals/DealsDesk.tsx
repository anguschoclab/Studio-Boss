import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { selectBuyers, selectProjects } from '@/store/selectors';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Handshake, Tv, Globe, Zap, BarChart3, Info } from 'lucide-react';
import { Buyer, Project, MandateType } from '@/engine/types';
import { calculateFitScore } from '@/engine/systems/buyers';

export const DealsDesk = () => {
  const gameState = useGameStore(s => s.gameState);
  const buyers = useGameStore(s => selectBuyers(s.gameState));
  const projects = useGameStore(s => selectProjects(s.gameState));
  const pitchingProjects = projects.filter(p => p.status === 'pitching' || p.status === 'development');

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 tracking-tight">Deals Desk</h2>
          <p className="text-muted-foreground text-sm">Negotiate distribution and track network mandates.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary uppercase font-bold tracking-widest text-[10px]">
            {buyers.length} Active Buyers
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Buyers List */}
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Tv className="w-4 h-4 text-blue-400" /> Distribution Partners
          </h3>
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
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Handshake className="w-4 h-4 text-primary" /> Pitching Slate
          </h3>
          <div className="flex-1 bg-card/30 rounded-xl border border-border/40 overflow-hidden flex flex-col p-4">
            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {pitchingProjects.length === 0 ? (
                  <div className="text-center py-12 opacity-40">
                    <Zap className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-[10px] uppercase font-bold">No active pitches</p>
                  </div>
                ) : (
                  pitchingProjects.map(p => (
                    <div key={p.id} className="p-3 rounded-lg bg-card/50 border border-border/40 hover:border-primary/30 transition-colors">
                      <div className="text-xs font-bold truncate">{p.title}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[9px] uppercase text-muted-foreground font-bold">{p.genre}</span>
                        <Badge className="text-[9px] px-1 h-3.5 bg-primary/10 text-primary border-primary/20">{p.budgetTier.toUpperCase()}</Badge>
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

const getMandateColor = (type?: MandateType) => {
  switch (type) {
    case 'prestige': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'sci-fi': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    case 'comedy': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'drama': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'budget_freeze': return 'text-destructive bg-destructive/10 border-destructive/20';
    case 'broad_appeal': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    default: return 'text-muted-foreground bg-muted/10 border-muted/20';
  }
};

const BuyerCard = ({ buyer, projects, week, allProjects }: { buyer: Buyer, projects: Project[], week: number, allProjects: Project[] }) => {
  return (
    <Card className="bg-card/40 border-border/40 hover:border-blue-500/30 transition-all overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Globe className="w-16 h-16" />
      </div>
      <CardHeader className="p-5 pb-3">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <CardTitle className="font-display text-base font-black tracking-tight">{buyer.name}</CardTitle>
            <Badge variant="outline" className="text-[9px] uppercase mt-1 opacity-70">{buyer.archetype}</Badge>
          </div>
          <div className={`px-2 py-1 rounded border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${getMandateColor(buyer.currentMandate?.type)}`}>
            {buyer.currentMandate?.type || 'No Mandate'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-4 relative z-10">
        <div className="text-[11px] text-muted-foreground leading-relaxed italic border-l-2 border-border/40 pl-3">
          {buyer.currentMandate ? `Active until week ${buyer.currentMandate.activeUntilWeek}` : 'Seeking new opportunities.'}
        </div>

        {projects.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-between">
              <span>Fit Analysis</span>
              <Info className="w-3 h-3" />
            </div>
            <div className="space-y-2">
              {projects.slice(0, 2).map(p => {
                const fit = calculateFitScore(p, buyer, week, allProjects);
                return (
                  <div key={p.id} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="truncate max-w-[150px] opacity-80">{p.title}</span>
                      <span className={fit > 70 ? 'text-emerald-400' : fit > 40 ? 'text-amber-400' : 'text-destructive'}>{fit}% Fit</span>
                    </div>
                    <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${fit > 70 ? 'bg-emerald-500' : fit > 40 ? 'bg-amber-500' : 'bg-destructive'}`}
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
           <Button variant="outline" size="sm" className="w-full text-[10px] font-black uppercase tracking-widest h-8 hover:bg-primary hover:text-primary-foreground transition-colors">
             Open Negotiations
           </Button>
        </div>
      </CardContent>
    </Card>
  );
};

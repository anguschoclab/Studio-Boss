import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { Plus, Search, Newspaper, Sparkles, Zap, Target, TrendingUp } from 'lucide-react';
import { Opportunity } from '@/engine/types';
import { selectOpportunities } from '@/store/selectors';
import { TrendBoard } from '@/components/trends/TrendBoard';
import { NewsFeed } from '@/components/news/NewsFeed';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { LiveAuctionDashboard } from '@/components/talent/LiveAuctionDashboard';
import { OpportunityCard } from './OpportunityCard';

export const DiscoveryBoard = () => {
  const gameState = useGameStore(s => s.gameState);
  const opportunities = selectOpportunities(gameState);
  const { openCreateProject } = useUIStore();
  const [selectedAuctionOpp, setSelectedAuctionOpp] = useState<Opportunity | null>(null);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden pb-20">
      <div className="flex-1 flex flex-col space-y-10 overflow-hidden">
        {/* Executive Trades Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white/[0.02] p-10 rounded-none border border-white/5 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[120px] -mr-32 -mt-32" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-3">
              <div className="w-16 h-16 rounded-none bg-secondary/5 border border-secondary/20 flex items-center justify-center shadow-xl group-hover:bg-secondary/10 transition-all duration-700">
                <Newspaper className="h-8 w-8 text-secondary animate-pulse-slow" strokeWidth={1} />
              </div>
              <div>
                <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none mb-3 drop-shadow-[0_0_30px_rgba(var(--secondary),0.1)]">THE TRADES</h2>
                <p className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.4em] italic flex items-center gap-4">
                  GLOBAL IP MARKETPLACE 
                  <span className="w-1.5 h-1.5 bg-white/10" /> 
                  VENTURE CAPITAL SCOUTING
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="relative w-64 hidden xl:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20" />
              <TooltipWrapper tooltip="FILTER LISTINGS BY PROPERTY NAME, WRITER, OR GENRE" side="bottom">
                <Input aria-label="SEARCH LISTINGS" className="h-12 pl-12 text-[10px] bg-black/40 border-white/5 uppercase font-black tracking-[0.2em] rounded-none focus:ring-secondary/20 italic placeholder:text-muted-foreground/10" placeholder="SEARCH LISTINGS..." />
              </TooltipWrapper>
            </div>
            <Button 
              onClick={openCreateProject} 
              className="h-12 px-8 text-[10px] font-black uppercase tracking-[0.3em] gap-4 bg-primary text-black hover:bg-primary/90 shadow-2xl shadow-primary/10 transition-all duration-700 rounded-none italic active:scale-95"
            >
              <Plus className="h-4 w-4" strokeWidth={3} />
              ORIGINAL IP CONCEPT
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-20">
            {opportunities.length === 0 ? (
              <div className="col-span-full py-48 text-center glass-card border border-white/5 rounded-none flex flex-col items-center justify-center space-y-8 bg-white/[0.01]">
                <div className="w-24 h-24 rounded-none bg-white/5 flex items-center justify-center text-muted-foreground/10 animate-pulse border border-white/5">
                  <Sparkles className="h-12 w-12" strokeWidth={1} />
                </div>
                <div className="space-y-3">
                  <p className="text-xl font-display font-black uppercase tracking-[0.4em] text-muted-foreground/20 italic">MARKET SATURATION PEAK</p>
                  <p className="text-[10px] uppercase font-black text-muted-foreground/10 italic tracking-[0.3em]">NO ACTIVE SCRIPTS OR HIGH-VALUE PACKAGES CURRENTLY CIRCULATING.</p>
                </div>
              </div>
            ) : (
              opportunities.map(opp => (
                <OpportunityCard 
                  key={opp.id} 
                  opportunity={opp} 
                  onEnterAuction={() => setSelectedAuctionOpp(opp)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="w-full lg:w-[450px] flex flex-col gap-10 shrink-0 h-full overflow-hidden">
        <div className="h-[40%] flex flex-col">
           <div className="flex items-center gap-4 px-2 mb-6">
              <div className="w-2 h-6 rounded-none bg-secondary shadow-[0_0_15px_rgba(var(--secondary),0.5)]" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic flex items-center gap-3">
                <TrendingUp className="w-4 h-4" /> MARKET TRENDS
              </h3>
            </div>
          <TrendBoard />
        </div>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center gap-4 px-2 mb-6">
              <div className="w-2 h-6 rounded-none bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic flex items-center justify-between flex-1">
                TOWN FEED
                <div className="h-6 px-4 text-[8px] bg-primary/5 border border-primary/20 text-primary animate-pulse uppercase tracking-[0.3em] font-black flex items-center justify-center rounded-none italic shadow-[0_0_15px_rgba(var(--primary),0.1)]">LIVE WIRE</div>
              </h3>
            </div>
          <div className="flex-1 bg-white/[0.01] rounded-none border border-white/5 overflow-hidden flex flex-col p-1 shadow-2xl">
            <NewsFeed />
          </div>
        </div>
      </div>

      {selectedAuctionOpp && (
        <LiveAuctionDashboard 
           opportunity={selectedAuctionOpp}
           onClose={() => setSelectedAuctionOpp(null)}
        />
      )}
    </div>
  );
};

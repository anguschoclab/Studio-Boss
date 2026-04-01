import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { Plus, Search, Newspaper, Clock, Sparkles, Gavel, TrendingUp } from 'lucide-react';
import { Opportunity } from '@/engine/types';
import { selectOpportunities } from '@/store/selectors';
import { TrendBoard } from '@/components/trends/TrendBoard';
import { NewsFeed } from '@/components/news/NewsFeed';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/engine/utils';
import { LiveAuctionDashboard } from '@/components/talent/LiveAuctionDashboard';

export const DiscoveryBoard = () => {
  const opportunities = useGameStore(s => selectOpportunities(s.gameState));
  const { openCreateProject } = useUIStore();
  const [selectedAuctionOpp, setSelectedAuctionOpp] = useState<Opportunity | null>(null);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden p-2">
      <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/3 p-6 rounded-2xl border border-white/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-lg group-hover:bg-amber-500/20 transition-all duration-500">
                <Newspaper className="h-6 w-6 text-amber-500 animate-pulse-slow" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none drop-shadow-sm">The Trades</h2>
                <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-[0.2em] mt-1">Global IP Marketplace • Venture Capital Scouting</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="relative w-56 hidden xl:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
              <Input aria-label="Search Listings" className="h-9 pl-10 text-[10px] bg-black/40 border-white/5 uppercase font-black tracking-widest focus:ring-amber-500/20" placeholder="Search Listings..." />
            </div>
            <Button onClick={openCreateProject} className="h-10 px-6 text-[10px] font-black uppercase tracking-[0.2em] gap-3 bg-primary text-black hover:bg-primary/90 shadow-xl shadow-primary/10 transition-all active:scale-95">
              <Plus className="h-4 w-4" />
              Original IP Concept
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
            {opportunities.length === 0 ? (
              <div className="col-span-full py-32 text-center glass-panel border-white/5 flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/10 animate-pulse">
                  <Sparkles className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/40">Market Saturation Peak</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground/20 mt-1 italic tracking-widest">No active scripts or high-value packages currently circulating.</p>
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

      <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0 h-full overflow-hidden">
        <div className="h-[40%] flex flex-col">
           <div className="flex items-center gap-3 px-2 mb-3">
              <div className="w-1 h-3 rounded-full bg-secondary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Market Trends</h3>
            </div>
          <TrendBoard />
        </div>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
           <div className="flex items-center gap-3 px-2 mb-3">
              <div className="w-1 h-3 rounded-full bg-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between flex-1">
                Town Feed
                <Badge variant="outline" className="h-4 px-1.5 text-[8px] bg-primary/10 border-primary/20 text-primary animate-pulse uppercase tracking-widest font-black">Live Wire</Badge>
              </h3>
            </div>
          <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 overflow-hidden flex flex-col p-1">
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

const OpportunityCard = ({ opportunity: opp, onEnterAuction }: { opportunity: Opportunity; onEnterAuction: () => void }) => {
  const maxBid = Math.max(...Object.values(opp.bids || {}), opp.costToAcquire);
  const highestBid = opp.highestBidderId ? (opp.highestBidderId === 'PLAYER' ? 'YOU' : 'CONGLOMERATE') : 'STARTING';
  
  return (
    <div className="glass-panel p-6 rounded-2xl group relative overflow-hidden flex flex-col justify-between h-full border border-white/5 hover:border-amber-500/20 hover:bg-amber-500/3 transition-all duration-500 cursor-default">
      <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
         <Gavel className="w-5 h-5 text-amber-500" />
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-black uppercase tracking-tight truncate leading-tight group-hover:text-amber-400 transition-colors">
              {opp.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border-none px-1.5 h-4">
                {opp.genre}
              </Badge>
              <span className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">{opp.type}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[9px] font-black border-white/10 text-muted-foreground uppercase h-5 tracking-widest">{opp.format}</Badge>
          <Badge variant="outline" className="text-[9px] font-black border-primary/20 bg-primary/5 text-primary uppercase h-5 tracking-widest">{opp.budgetTier} BUDGET</Badge>
        </div>

        <div className="p-4 rounded-xl bg-black/40 italic text-xs text-muted-foreground/80 leading-relaxed border-l-2 border-primary/20 group-hover:border-amber-500/40 transition-all shadow-inner">
          "{opp.flavor}"
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Market Bid</span>
                <div className="text-base font-black text-foreground tabular-nums">{formatMoney(maxBid)}</div>
            </div>
            <div className="space-y-1 text-right">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Leader</span>
                <div className={cn("text-[10px] font-black uppercase tracking-widest", highestBid === 'YOU' ? 'text-emerald-400' : 'text-rose-400')}>
                   {highestBid}
                </div>
            </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-white/5 flex justify-between items-center relative z-10">
        <div className="flex flex-col">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-1">
            <Clock className={cn("h-3 w-3", opp.weeksUntilExpiry <= 1 ? "text-rose-500 animate-pulse" : "text-amber-500/40")} />
            Closing Soon
          </div>
          <span className={cn("text-[10px] font-black tabular-nums", opp.weeksUntilExpiry <= 1 ? "text-rose-500 underline decoration-rose-500/40 underline-offset-4" : "text-foreground")}>
            {opp.weeksUntilExpiry} Wks Remaining
          </span>
        </div>
        
        <Button 
          size="sm" 
          className="h-10 text-[10px] px-6 font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-amber-500 hover:text-black border border-white/10 hover:border-amber-500 transition-all shadow-xl group/btn active:scale-95" 
          onClick={onEnterAuction}
        >
          <Gavel className="h-3.5 w-3.5 mr-2 group_hover/btn:rotate-[-45deg] transition-transform" />
          Enter War
        </Button>
      </div>
    </div>
  );
};

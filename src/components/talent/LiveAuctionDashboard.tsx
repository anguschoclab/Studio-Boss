import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Opportunity } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { 
  Gavel, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Clock,
  ShieldAlert,
  ChevronRight,
  History as LucideHistory,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getLiveCounterBid } from '@/engine/systems/ai/biddingEngine';

interface LiveAuctionDashboardProps {
  opportunity: Opportunity;
  onClose: () => void;
}

export const LiveAuctionDashboard: React.FC<LiveAuctionDashboardProps> = ({ opportunity, onClose }) => {
  const gameState = useGameStore(s => s.gameState);
  const placeBid = useGameStore(s => s.placeBid);
  
  const [playerBid, setPlayerBid] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const currentMaxBid = useMemo(() => {
    return Math.max(...Object.values(opportunity.bids || {}), opportunity.costToAcquire);
  }, [opportunity.bids, opportunity.costToAcquire]);

  const recommendedBid = useMemo(() => {
    return getLiveCounterBid(opportunity, 0.1); // 10% increment
  }, [opportunity]);

  useEffect(() => {
    setPlayerBid(recommendedBid);
  }, [recommendedBid]);

  const handleBid = () => {
    if (gameState && gameState.finance.cash >= playerBid) {
      placeBid(opportunity.id, playerBid);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const isLeading = opportunity.highestBidderId === 'PLAYER';
  const history = [...opportunity.bidHistory].reverse().slice(0, 5);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[75vh]">
        {/* Header */}
        <div className="p-8 border-b border-slate-800 bg-black/40 flex items-center justify-between">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group">
                 <Gavel className={cn("w-8 h-8 text-amber-500 transition-transform duration-500", isAnimating ? "rotate-[-45deg]" : "")} />
              </div>
              <div>
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{opportunity.title}</h2>
                 <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] font-black uppercase bg-amber-500/10 text-amber-500 border-none">{opportunity.genre}</Badge>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{opportunity.type} AUCTION</span>
                 </div>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-500" />
           </button>
        </div>

        <div className="flex-1 grid grid-cols-12 overflow-hidden">
           {/* Main Bid Area */}
           <div className="col-span-12 lg:col-span-7 p-8 space-y-8 overflow-y-auto">
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Market Valuation</h3>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Current High Bid</span>
                       <div className="text-3xl font-black text-white tabular-nums">{formatMoney(currentMaxBid)}</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Status</span>
                       <div className={cn("text-xl font-black uppercase italic tracking-tighter flex items-center gap-2", isLeading ? "text-emerald-400" : "text-rose-400")}>
                          {isLeading ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                          {isLeading ? 'Leading' : 'Outbid'}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Your Action</h3>
                    <span className="text-[9px] font-black text-slate-500 uppercase">Available: {formatMoney(gameState?.finance.cash || 0)}</span>
                 </div>
                 
                 <div className="p-8 rounded-3xl bg-slate-800/20 border-2 border-white/5 space-y-8">
                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <span className="text-[11px] font-black uppercase text-slate-400">Proposed Counter</span>
                          <span className="text-4xl font-black text-primary tabular-nums">{formatMoney(playerBid)}</span>
                       </div>
                       <Progress value={(currentMaxBid / (playerBid || 1)) * 100} className="h-3 bg-black/40" />
                       <div className="grid grid-cols-3 gap-2">
                          {[0.05, 0.15, 0.25].map(pct => (
                            <Button 
                              key={pct} 
                              variant="outline" 
                              className="h-10 text-[9px] font-black uppercase border-white/5 bg-white/5 hover:bg-white/10"
                              onClick={() => setPlayerBid(Math.round(currentMaxBid * (1 + pct) / 1000) * 1000)}
                            >
                               +{pct * 100}% Aggression
                            </Button>
                          ))}
                       </div>
                    </div>

                    <Button 
                      className="w-full h-16 bg-primary text-black hover:bg-primary/90 font-black text-sm uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-95"
                      onClick={handleBid}
                      disabled={playerBid <= currentMaxBid || (gameState ? gameState.finance.cash < playerBid : true)}
                    >
                       Place Binding Counter-Bid
                    </Button>
                 </div>
              </div>
           </div>

           {/* Sidebar: History & Intel */}
           <div className="col-span-12 lg:col-span-5 bg-black/40 border-l border-slate-800 p-8 space-y-8">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <LucideHistory className="w-4 h-4" /> Bidding Tape
                 </h4>
                 <div className="space-y-3">
                    {history.map((entry, idx) => (
                       <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 animate-in slide-in-from-right-2" style={{ animationDelay: `${idx * 100}ms` }}>
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Wk {entry.week}</span>
                             <span className={cn("text-[10px] font-black uppercase", entry.rivalId === 'PLAYER' ? 'text-primary' : 'text-slate-300')}>
                                {entry.rivalId === 'PLAYER' ? 'Your Studio' : 'Rival Conglomerate'}
                             </span>
                          </div>
                          <span className="text-xs font-black text-white">{formatMoney(entry.amount)}</span>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" /> Executive Intel
                 </h4>
                 <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                    <p className="text-[11px] font-bold text-amber-200/60 leading-relaxed italic">
                       "Rival studios see high value in this {opportunity.genre} package. We expect aggressive counter-plays. Closing bid estimate is {formatMoney(opportunity.costToAcquire * 2.5)}."
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                       <TrendingUp className="w-4 h-4" /> Market Heat: Extreme
                    </div>
                 </div>
              </div>

              <div className="mt-auto p-4 rounded-2xl bg-black/60 border border-white/5">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Closing Multiplier</span>
                    <span>2.5x</span>
                 </div>
                 <div className="text-[9px] font-bold text-slate-600 mt-1">
                    Final auction resolution takes place at week-end.
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Opportunity } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Gavel,
  Clock,
  History,
  AlertCircle,
  Zap,
  Target,
  Trophy,
  Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveAuctionDashboardProps {
  opportunity: Opportunity;
  onClose: () => void;
}

export const LiveAuctionDashboard: React.FC<LiveAuctionDashboardProps> = ({ opportunity: opp, onClose }) => {
  const { placeBid, acquireOpportunity, gameState } = useGameStore();
  const rivals = gameState?.entities.rivals || {};

  const currentHighest = useMemo(() => {
    return Object.values(opp.bids || {}).reduce((max, b) => Math.max(max, b.amount), 0);
  }, [opp.bids]);

  const isPlayerWinning = opp.highestBidderId === 'PLAYER';
  const highestBidder = isPlayerWinning ? { name: 'YOU' } : Object.values(rivals).find(r => r.id === opp.highestBidderId);

  const handleBid = (amount: number) => {
    if (gameState && gameState.finance.cash < amount) return;
    placeBid(opp.id, amount);
  };

  useEffect(() => {
    handleBid(currentHighest + 1_000_000);
  }, [currentHighest, handleBid]);

  const isExpired = gameState && gameState.week >= opp.expirationWeek;

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header Info */}
      <div className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-black/40 to-transparent border border-primary/20 shadow-2xl relative overflow-hidden">
        {/* Animated Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Gavel className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black uppercase tracking-tighter italic">{opp.title}</h2>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-white/5 border-white/5 h-5">
               {opp.genre}
             </Badge>
             <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-white/5 border-white/5 h-5">
               {opp.format}
             </Badge>
             <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">
               <Clock className="w-3.5 h-3.5" />
               Ends Week {opp.expirationWeek}
             </div>
          </div>
        </div>

        <div className="text-right relative z-10">
           <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none mb-1.5">Highest Bid</div>
           <div className={cn(
             "text-3xl font-black tracking-tighter font-display leading-none tabular-nums",
             isPlayerWinning ? "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" : "text-foreground"
           )}>
             {formatMoney(currentHighest)}
           </div>
           <div className="flex items-center justify-end gap-1.5 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Leader:</span>
              <span className={cn("text-[10px] font-black uppercase tracking-widest", isPlayerWinning ? "text-emerald-400" : "text-primary")}>
                {highestBidder?.name || 'Unknown'}
              </span>
           </div>
        </div>
      </div>

      {/* Main Grid: Bidding and History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Left Column: Bid Control */}
        <div className="flex flex-col space-y-4">
           {/* Action Card */}
           <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-full group">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-primary" /> Placement Strategy
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '+1M Match', amount: currentHighest + 1_000_000, color: 'bg-white/5 hover:bg-white/10' },
                      { label: '+5M Power', amount: currentHighest + 5_000_000, color: 'bg-white/5 hover:bg-white/10' },
                      { label: '10M Strategic', amount: currentHighest + 10_000_000, color: 'bg-white/5 hover:bg-white/10' },
                      { label: 'Aggressive 20M+', amount: currentHighest + 25_000_000, color: 'bg-primary/10 hover:bg-primary/20 border-primary/20' },
                    ].map(btn => (
                      <Button 
                        key={btn.label}
                        variant="outline"
                        onClick={() => handleBid(btn.amount)}
                        disabled={isExpired || (gameState?.finance.cash || 0) < btn.amount}
                        className={cn("h-12 flex flex-col items-center justify-center gap-0.5 border-white/5 group/btn transition-all active:scale-95", btn.color)}
                      >
                         <span className="text-[9px] font-black uppercase tracking-widest leading-none text-muted-foreground group-hover/btn:text-foreground">{btn.label}</span>
                         <span className="text-[11px] font-bold text-foreground">{formatMoney(btn.amount)}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Your Liquidity</span>
                      <span className="text-[10px] font-black text-foreground">{formatMoney(gameState?.finance.cash || 0)}</span>
                   </div>
                   <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${Math.min(100, (currentHighest / (gameState?.finance.cash || 1)) * 100)}%` }} 
                      />
                   </div>
                   <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground/40 italic">
                      <AlertCircle className="w-3 h-3" />
                      Minimum increment is $1,000,000 for top-tier listings.
                   </div>
                </div>
              </div>

              {!isExpired ? (
                <div className="mt-8 space-y-3">
                  <Button 
                    className="w-full h-14 bg-primary text-black hover:bg-primary/90 font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95 group/bid"
                    onClick={() => handleBid(currentHighest + 1_000_000)}
                  >
                    <Gavel className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                    Secure Lead Bid
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full h-10 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-rose-400 hover:bg-rose-400/5"
                    onClick={onClose}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Concede / Walk Away
                  </Button>
                </div>
              ) : (
                <div className="mt-8">
                  {isPlayerWinning ? (
                    <Button 
                      className="w-full h-14 bg-emerald-500 text-white hover:bg-emerald-600 font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-emerald-500/20"
                      onClick={() => {
                        acquireOpportunity(opp.id);
                        onClose();
                      }}
                    >
                      <Trophy className="w-5 h-5 mr-3 animate-bounce" />
                      Claim Rights
                    </Button>
                  ) : (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                       <p className="text-xs font-black uppercase tracking-widest text-rose-500 mb-1">Auction Closed</p>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase leading-tight">Rights acquired by {highestBidder?.name}</p>
                       <Button variant="outline" size="sm" className="mt-3 w-full h-8 text-[9px] font-black uppercase bg-white/5" onClick={onClose}>Dismiss</Button>
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>

        {/* Right Column: Intensity & History */}
        <div className="flex flex-col space-y-4">
           {/* Interest Intensity Meter */}
           <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-400" /> Town Heat Level
              </h3>
              
              <div className="flex items-end justify-between gap-1 h-12 mb-2">
                 {[40, 60, 45, 90, 70, 85, 30, 95, 65, 80].map((h, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex-1 rounded-t-sm transition-all duration-1000",
                        h > 80 ? "bg-rose-400/80 shadow-[0_0_10px_rgba(251,113,133,0.4)]" : 
                        h > 50 ? "bg-amber-400/60" : "bg-white/10"
                      )} 
                      style={{ height: `${h}%` }}
                    />
                 ))}
              </div>
              <p className="text-[10px] font-bold text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-3">
                "{opp.flavor}"
              </p>
           </div>

           {/* Bid History */}
           <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full min-h-[300px]">
              <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                   <History className="w-4 h-4" /> Bid History
                 </h3>
                 <Badge variant="outline" className="text-[8px] font-black uppercase h-4 px-1.5">{opp.bidHistory.length} ENTRIES</Badge>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {[...(opp.bidHistory || [])].reverse().map((bid, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                      bid.rivalId === 'PLAYER' ? "bg-primary/10 border-primary/20" : "bg-white/2 border-white/5"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                       <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black", bid.rivalId === 'PLAYER' ? "bg-primary text-black" : "bg-white/5 text-muted-foreground")}>
                          {bid.rivalId === 'PLAYER' ? 'P' : 'R'}
                       </div>
                       <div>
                          <div className="text-[10px] font-black uppercase tracking-tight">{bid.rivalId === 'PLAYER' ? 'YOUR STUDIO' : Object.values(rivals).find(r => r.id === bid.rivalId)?.name || 'RIVAL'}</div>
                          <div className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">Week {bid.week}</div>
                       </div>
                    </div>
                    <div className="text-xs font-black tabular-nums">{formatMoney(bid.amount)}</div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

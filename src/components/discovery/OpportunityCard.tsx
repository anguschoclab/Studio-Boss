import React from 'react';
import { Button } from '@/components/ui/button';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { Gavel, Clock } from 'lucide-react';
import { Opportunity } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { cn } from '@/lib/utils';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onEnterAuction: () => void;
}

export const OpportunityCard = ({ opportunity: opp, onEnterAuction }: OpportunityCardProps) => {
  const maxBid = Math.max(...Object.values(opp.bids || {}).map(bid => bid.amount), opp.costToAcquire);
  const highestBid = opp.highestBidderId ? (opp.highestBidderId === 'PLAYER' ? 'YOU' : 'CONGLOMERATE') : 'STARTING';
  
  return (
    <TooltipWrapper tooltip="VIEW OPPORTUNITY DETAILS & BID HISTORY" side="top">
      <div className="glass-card p-10 rounded-none group relative overflow-hidden flex flex-col justify-between h-full border border-white/5 hover:border-secondary/40 hover:bg-secondary/[0.02] transition-all duration-700 cursor-pointer active:scale-[0.99] bg-white/[0.01] shadow-2xl">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-all duration-700">
           <Gavel className="w-8 h-8 text-secondary" strokeWidth={1} />
        </div>

        <div className="space-y-8 relative z-10">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <h3 className="text-2xl font-display font-black uppercase tracking-tighter truncate leading-none group-hover:text-secondary transition-all duration-700 italic drop-shadow-[0_0_15px_rgba(var(--secondary),0.1)] mb-3">
                {opp.title}
              </h3>
              <div className="flex items-center gap-3">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] bg-secondary/5 text-secondary border border-secondary/20 px-3 h-5 flex items-center justify-center rounded-none italic shadow-[0_0_10px_rgba(var(--secondary),0.1)]">
                  {opp.genre.toUpperCase()}
                </div>
                <span className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.3em] italic">{opp.type.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-[9px] font-black border border-white/10 bg-white/[0.02] text-muted-foreground/40 uppercase px-3 h-6 flex items-center justify-center tracking-[0.2em] rounded-none italic">{opp.format.toUpperCase()}</div>
            <div className="text-[9px] font-black border border-primary/20 bg-primary/5 text-primary uppercase px-3 h-6 flex items-center justify-center tracking-[0.2em] rounded-none italic shadow-[0_0_10px_rgba(var(--primary),0.1)]">{opp.budgetTier.toUpperCase()} BUDGET</div>
          </div>

          <div className="p-8 rounded-none bg-black/40 italic text-xs text-muted-foreground/60 leading-relaxed border-l-2 border-primary/20 group-hover:border-secondary/40 transition-all duration-700 shadow-inner uppercase tracking-wider">
            "{opp.flavor.toUpperCase()}"
          </div>
          
          <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">MARKET BID</span>
                  <div className="text-2xl font-display font-black text-foreground italic tabular-nums leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{formatMoney(maxBid)}</div>
              </div>
              
              <div className="space-y-2 text-right">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">LEADER</span>
                  <div className={cn("text-xs font-black uppercase tracking-[0.3em] italic leading-none drop-shadow-[0_0_10px_rgba(var(--color),0.3)]", highestBid === 'YOU' ? 'text-emerald-400' : 'text-red-500')}>
                     {highestBid}
                  </div>
              </div>
          </div>
        </div>

        <div className="mt-10 pt-10 border-t border-white/5 flex justify-between items-center relative z-10">
          <div className="flex flex-col gap-2">
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 flex items-center gap-3 italic leading-none">
              <Clock className={cn("h-3.5 w-3.5", opp.weeksUntilExpiry <= 1 ? "text-red-500 animate-pulse" : "text-secondary/20")} strokeWidth={3} />
              CLOSING SOON
            </div>
            <span className={cn("text-[11px] font-black uppercase tracking-[0.2em] italic leading-none", opp.weeksUntilExpiry <= 1 ? "text-red-500" : "text-foreground/80")}>
              {opp.weeksUntilExpiry} WKS REMAINING
            </span>
          </div>
          
          <Button 
            size="sm" 
            className="h-12 text-[10px] px-8 font-black uppercase tracking-[0.3em] bg-white/[0.02] hover:bg-secondary hover:text-black border border-white/10 hover:border-secondary transition-all duration-700 rounded-none italic shadow-2xl group/btn active:scale-95" 
            onClick={(e) => {
              e.stopPropagation();
              onEnterAuction();
            }}
          >
            <Gavel className="h-4 w-4 mr-3 group-hover/btn:rotate-[-45deg] transition-transform duration-700" strokeWidth={3} />
            ENTER WAR
          </Button>
        </div>
      </div>
    </TooltipWrapper>
  );
};

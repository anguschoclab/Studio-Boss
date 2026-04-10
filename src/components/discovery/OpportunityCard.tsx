import React from 'react';
import { Badge } from '@/components/ui/badge';
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
    <TooltipWrapper tooltip="View Opportunity Details & Bid History" side="top">
      <button type="button" onClick={onEnterAuction} className="w-full text-left glass-panel p-6 rounded-2xl group relative overflow-hidden flex flex-col justify-between h-full border border-white/5 hover:border-amber-500/20 hover:bg-amber-500/3 transition-all duration-500 cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50">
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity pointer-events-none">
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
            <TooltipWrapper tooltip="Property format determines distribution strategy and platform suitability." side="top">
              <Badge variant="outline" className="text-[9px] font-black border-white/10 text-muted-foreground uppercase h-5 tracking-widest cursor-help">{opp.format}</Badge>
            </TooltipWrapper>
            <TooltipWrapper tooltip="Estimated production cost category. Higher tiers require more capital but have higher revenue ceilings." side="top">
              <Badge variant="outline" className="text-[9px] font-black border-primary/20 bg-primary/5 text-primary uppercase h-5 tracking-widest cursor-help">{opp.budgetTier} BUDGET</Badge>
            </TooltipWrapper>
          </div>

          <div className="p-4 rounded-xl bg-black/40 italic text-xs text-muted-foreground/80 leading-relaxed border-l-2 border-primary/20 group-hover:border-amber-500/40 transition-all shadow-inner">
            "{opp.flavor}"
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
              <TooltipWrapper tooltip="The current highest bid in the marketplace for these rights." side="top">
                <div className="space-y-1 cursor-help">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Market Bid</span>
                    <div className="text-base font-black text-foreground tabular-nums">{formatMoney(maxBid)}</div>
                </div>
              </TooltipWrapper>
              
              <TooltipWrapper tooltip="The entity currently holding the winning bid position." side="top">
                <div className="space-y-1 text-right cursor-help">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Leader</span>
                    <div className={cn("text-[10px] font-black uppercase tracking-widest", highestBid === 'YOU' ? 'text-emerald-400' : 'text-rose-400')}>
                       {highestBid}
                    </div>
                </div>
              </TooltipWrapper>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/5 flex justify-between items-center relative z-10">
          <TooltipWrapper tooltip="Time remaining before the auction concludes and rights are awarded. Bids placed in the final hour may extend the clock." side="top">
            <div className="flex flex-col cursor-help">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-1">
                <Clock className={cn("h-3 w-3", opp.weeksUntilExpiry <= 1 ? "text-rose-500 animate-pulse" : "text-amber-500/40")} />
                Closing Soon
              </div>
              <span className={cn("text-[10px] font-black tabular-nums", opp.weeksUntilExpiry <= 1 ? "text-rose-500 underline decoration-rose-500/40 underline-offset-4" : "text-foreground")}>
                {opp.weeksUntilExpiry} Wks Remaining
              </span>
            </div>
          </TooltipWrapper>
          
          <Button 
            size="sm" 
            tooltip="Join the high-stakes bidding war for these intellectual property rights"
            className="h-10 text-[10px] px-6 font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-amber-500 hover:text-black border border-white/10 hover:border-amber-500 transition-all shadow-xl group/btn active:scale-95" 
            onClick={(e) => {
              e.stopPropagation();
              onEnterAuction();
            }}
          >
            <Gavel className="h-3.5 w-3.5 mr-2 group_hover/btn:rotate-[-45deg] transition-transform" />
            Enter War
          </Button>
        </div>
      </button>
    </TooltipWrapper>
  );
};

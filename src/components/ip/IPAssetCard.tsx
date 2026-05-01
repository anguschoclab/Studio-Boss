import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { useGameStore } from '@/store/gameStore';
import { TrendingUp, DollarSign, History, Globe, Lock } from 'lucide-react';
import { formatMoney } from '@/engine/utils';
import { IPAsset } from '@/engine/types';
import { SYNDICATION_TIERS } from '@/engine/data/syndicationConfig';
import { cn } from '@/lib/utils';

interface IPAssetCardProps {
  asset: IPAsset;
  isMarket?: boolean;
}

export const IPAssetCard = ({ asset, isMarket = false }: IPAssetCardProps) => {
  const acquireAndRebootIP = useGameStore(s => s.acquireAndRebootIP);
  const relevancePercent = asset.decayRate * 100;
  const tier = SYNDICATION_TIERS[asset.syndicationTier || 'NONE'];
  
  return (
    <TooltipWrapper tooltip={`AUDIT ${asset.title.toUpperCase()} FINANCIALS & LICENSING DETAILS`} side="top">
      <Card className="glass-card border border-white/5 rounded-none hover:border-primary/40 group transition-all duration-700 relative overflow-hidden cursor-pointer active:scale-[0.98] bg-white/[0.01] shadow-2xl">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-none -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <CardContent className="p-8 flex flex-col h-full space-y-8 relative z-10">
          <div className="flex justify-between items-start gap-6">
            <div className="min-w-0">
               <div className="flex items-center gap-3 mb-3">
                 {asset.syndicationTier !== 'NONE' && (
                   <TooltipWrapper tooltip={`THIS IP IS CURRENTLY IN ${tier.label.toUpperCase()} LEVEL SYNDICATION.`}>
                     <div 
                       style={{ backgroundColor: `${tier.color}20`, color: tier.color, borderColor: `${tier.color}30` }}
                       className="text-[8px] font-black uppercase tracking-[0.25em] px-2 h-5 border rounded-none cursor-help italic flex items-center justify-center"
                     >
                        {tier.label}
                     </div>
                   </TooltipWrapper>
                 )}
                 {isMarket && (
                   <TooltipWrapper tooltip="PUBLICLY AVAILABLE INTELLECTUAL PROPERTY RIGHTS.">
                     <div className="bg-secondary/10 text-secondary border border-secondary/30 text-[8px] font-black uppercase tracking-[0.25em] px-2 h-5 rounded-none cursor-help italic flex items-center justify-center">
                        OPEN RIGHTS
                     </div>
                   </TooltipWrapper>
                 )}
                 {asset.syndicationTier === 'NONE' && asset.totalEpisodes > 40 && (
                   <TooltipWrapper tooltip="HIGH-PROBABILITY TARGET FOR A SUCCESSFUL MODERN REBOOT.">
                     <div className="border border-primary/30 text-primary text-[8px] font-black uppercase tracking-[0.25em] px-2 h-5 rounded-none cursor-help italic flex items-center justify-center bg-primary/5">
                        REBOOT POTENTIAL
                     </div>
                   </TooltipWrapper>
                 )}
               </div>
               <h4 className="text-2xl font-display font-black uppercase tracking-tighter truncate group-hover:text-primary transition-all duration-700 italic leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                 {asset.title}
               </h4>
               <TooltipWrapper tooltip="TOTAL VOLUME OF PRODUCED CONTENT IN THE CATALOG.">
                 <div className="text-[9px] font-black uppercase text-muted-foreground/30 tracking-[0.3em] flex items-center gap-2 mt-2 cursor-help italic">
                   <History className="h-3 w-3" /> {asset.totalEpisodes || 0} EPISODES • EST. CATALOG
                 </div>
               </TooltipWrapper>
            </div>
            <div className="w-12 h-12 rounded-none bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-lg group-hover:border-primary/30 transition-all duration-700">
              {isMarket ? <Globe className="h-6 w-6 text-secondary/60" /> : <Lock className="h-6 w-6 text-primary/60" />}
            </div>
          </div>

          {/* Decay/Relevance Indicator */}
          <TooltipWrapper tooltip="CULTURAL RELEVANCE IMPACTS REVENUE AND REBOOT SUCCESS PROBABILITY." side="top">
            <div className="space-y-3 cursor-help">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">
                <span>CULTURAL RELEVANCE</span>
                 <span className={cn(relevancePercent < 20 ? 'text-red-500' : 'text-primary')}>
                   {relevancePercent.toFixed(0)}%
                 </span>
              </div>
              <div className="h-2 w-full bg-white/[0.03] rounded-none overflow-hidden border border-white/5">
                <div 
                   className={cn(
                    "h-full transition-all duration-1000",
                    relevancePercent < 20 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-primary shadow-[0_0_15px_rgba(var(--primary),0.4)]'
                  )} 
                  style={{ width: `${relevancePercent}%` }}
                />
              </div>
            </div>
          </TooltipWrapper>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-8 pt-4">
             <TooltipWrapper tooltip="ESTIMATED PASSIVE INCOME GENERATED PER WEEK." side="top">
               <div className="space-y-2 cursor-help">
                 <div className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-2 italic">
                   <DollarSign className="h-3 w-3 text-emerald-400" /> WEEKLY REVENUE
                 </div>
                 <div className="text-lg font-display font-black tracking-tighter text-emerald-400 italic leading-none">
                   {formatMoney(Math.floor((asset.baseValue * asset.merchandisingMultiplier) * asset.decayRate)).toUpperCase()}
                 </div>
               </div>
             </TooltipWrapper>
             <TooltipWrapper tooltip="CURRENT MARKET VALUATION OF IP RIGHTS." side="top">
               <div className="space-y-2 cursor-help text-right">
                 <div className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center justify-end gap-2 italic">
                   <TrendingUp className="h-3 w-3 text-secondary" /> EQUITY VALUE
                 </div>
                 <div className="text-lg font-display font-black tracking-tighter text-foreground/80 italic leading-none">
                   {formatMoney(asset.baseValue).toUpperCase()}
                 </div>
               </div>
             </TooltipWrapper>
          </div>

          {/* Interaction Footer */}
          <div className="pt-6 mt-auto border-t border-white/5 flex justify-between items-center">
             <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 leading-none italic">
               EXPIRES WEEK {asset.rightsExpirationWeek}
             </div>
             {isMarket && (
               <Button 
                size="sm"
                variant="outline"
                className="h-10 text-[9px] font-black bg-secondary/5 hover:bg-secondary text-secondary hover:text-black border border-secondary/20 px-6 rounded-none uppercase tracking-[0.3em] italic transition-all duration-700 shadow-lg hover:shadow-secondary/20"
                onClick={(e) => {
                  e.stopPropagation();
                  acquireAndRebootIP(asset.id);
                }}
               >
                 ACQUIRE & REBOOT
               </Button>
             )}
          </div>
        </CardContent>
      </Card>
    </TooltipWrapper>
  );
};

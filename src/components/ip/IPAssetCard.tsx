import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <TooltipWrapper tooltip="View IP Asset Financials & Licensing Details" side="top">
      <Card className="glass-card border-none hover-glow group transition-all duration-300 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <CardContent className="p-6 flex flex-col h-full space-y-5 relative z-10">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 {asset.syndicationTier !== 'NONE' && (
                   <TooltipWrapper tooltip={`This IP is currently in ${tier.label} level syndication, generating recurring global royalties.`}>
                     <Badge 
                       style={{ backgroundColor: `${tier.color}20`, color: tier.color, borderColor: `${tier.color}30` }}
                       className="text-[8px] font-black uppercase tracking-widest px-1.5 h-4 border cursor-help"
                     >
                        {tier.label}
                     </Badge>
                   </TooltipWrapper>
                 )}
                 {isMarket && (
                   <TooltipWrapper tooltip="Publicly available intellectual property rights available for acquisition.">
                     <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[8px] font-black uppercase tracking-widest px-1.5 h-4 cursor-help">
                        Open Rights
                     </Badge>
                   </TooltipWrapper>
                 )}
                 {asset.syndicationTier === 'NONE' && asset.totalEpisodes > 40 && (
                   <TooltipWrapper tooltip="The library size and legacy status of this IP makes it a high-probability target for a successful modern reboot.">
                     <Badge variant="outline" className="border-pink-500/30 text-pink-400 text-[8px] font-black uppercase tracking-widest px-1.5 h-4 cursor-help">
                        Reboot Potential
                     </Badge>
                   </TooltipWrapper>
                 )}
               </div>
               <h4 className="text-lg font-black uppercase tracking-tighter truncate group-hover:text-primary transition-colors">{asset.title}</h4>
               <TooltipWrapper tooltip="Total volume of produced content in the catalog. Affects syndication potential and reboot success probabilities.">
                 <div className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest flex items-center gap-1.5 mt-0.5 cursor-help">
                   <History className="h-2.5 w-2.5" /> {asset.totalEpisodes || 0} Episodes • Est. Catalog
                 </div>
               </TooltipWrapper>
            </div>
            <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center">
              {isMarket ? <Globe className="h-5 w-5 text-amber-500/40" /> : <Lock className="h-5 w-5 text-primary/40" />}
            </div>
          </div>

          {/* Decay/Relevance Indicator */}
          <TooltipWrapper tooltip="Cultural relevance impacts revenue and reboot success probability. Decays over time if not refreshed." side="top">
            <div className="space-y-1.5 cursor-help">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
                <span>Cultural Relevance</span>
                 <span className={cn("font-mono", relevancePercent < 20 ? 'text-red-500' : 'text-primary')}>
                   {relevancePercent.toFixed(0)}%
                 </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                   className={cn(
                    "h-full transition-all duration-1000 rounded-full",
                    relevancePercent < 20 ? 'bg-red-500' : (asset.syndicationTier !== 'NONE' ? 'bg-purple-500' : 'bg-primary')
                  )} 
                  style={{ width: `${relevancePercent}%` }}
                />
              </div>
            </div>
          </TooltipWrapper>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
             <TooltipWrapper tooltip="Estimated passive income generated per week from existing licensing deals." side="top">
               <div className="space-y-1 cursor-help">
                 <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                   <DollarSign className="h-2.5 w-2.5 text-emerald-500" /> Weekly Revenue
                 </div>
                 <div className="text-sm font-black tracking-tight text-emerald-400">
                   {formatMoney(Math.floor((asset.baseValue * asset.merchandisingMultiplier) * asset.decayRate))}
                 </div>
               </div>
             </TooltipWrapper>
             <TooltipWrapper tooltip="The current market valuation of the intellectual property rights." side="top">
               <div className="space-y-1 cursor-help">
                 <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                   <TrendingUp className="h-2.5 w-2.5 text-secondary" /> Equity Value
                 </div>
                 <div className="text-sm font-black tracking-tight">
                   {formatMoney(asset.baseValue)}
                 </div>
               </div>
             </TooltipWrapper>
          </div>

          {/* Interaction Footer */}
          <div className="pt-4 mt-auto border-t border-white/5 flex justify-between items-center">
             <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none">
               Rights expire week {asset.rightsExpirationWeek}
             </div>
             {isMarket && (
               <Button 
                size="sm"
                variant="outline"
                tooltip={`Spend ${formatMoney(asset.baseValue)} to acquire rights and initiate a modern reboot of ${asset.title}`}
                className="h-7 text-[8px] font-black bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black border border-amber-500/20 px-3 uppercase tracking-widest"
                onClick={(e) => {
                  e.stopPropagation();
                  if (asset.id) acquireAndRebootIP(asset.id);
                }}
               >
                 Acquire & Reboot
               </Button>
             )}
          </div>
        </CardContent>
      </Card>
    </TooltipWrapper>
  );
};

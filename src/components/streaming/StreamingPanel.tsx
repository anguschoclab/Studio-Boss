import React, { useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Buyer, StreamerPlatform } from '@/engine/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowRightLeft,
  FileSearch,
  Globe,
  History,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlatformCard } from './components/PlatformCard';
import { DealModal } from './components/DealModal';
import { MAHistoryFeed } from './components/MAHistoryFeed';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';

function formatSubscribers(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export const StreamingPanel: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);
  const buyers = useMemo(() => gameState?.market.buyers || [], [gameState?.market.buyers]);
  const [dealBuyer, setDealBuyer] = useState<Buyer | null>(null);
  const [selectedBuyerForHistory, setSelectedBuyerForHistory] = useState<Buyer | null>(null);

  const stats = useMemo(() => {
    const active = buyers.filter(b => !b.acquiredBy);
    const streamers = active.filter(b => b.archetype === 'streamer') as StreamerPlatform[];
    const totalSubs = streamers.reduce((sum, s) => sum + (s.subscribers || 0), 0);
    const totalWeeklyGrowth = streamers.reduce((sum, s) => {
        const lastCount = s.subscriberHistory?.length ? s.subscriberHistory[s.subscriberHistory.length - 2]?.count || s.subscribers : s.subscribers;
        return sum + (s.subscribers - lastCount);
    }, 0);
    const mergers = buyers.filter(b => !!b.acquiredBy).length;
    return { activeCount: active.length, totalSubs, totalWeeklyGrowth, mergers };
  }, [buyers]);

  const activeBuyers = useMemo(() => buyers.filter(b => !b.acquiredBy).sort((a, b) => (b.strength ?? 60) - (a.strength ?? 60)), [buyers]);
  const acquiredPlatforms = useMemo(() => buyers.filter(b => !!b.acquiredBy), [buyers]);

  if (!gameState) return null;

  return (
    <div className="flex flex-col h-full space-y-6 p-2 animate-in fade-in duration-700">
      {/* Dynamic Industry Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/3 p-6 rounded-2xl border border-white/5 backdrop-blur-xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-primary/5 to-transparent opacity-50 pointer-events-none" />
         
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg group-hover:bg-primary/20 transition-all duration-500">
                  <Globe className="w-6 h-6 text-primary animate-pulse-slow" />
               </div>
               <div>
                  <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none drop-shadow-sm">Global Distribution Intel</h1>
                  <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-[0.2em] mt-1">Live Industry M&A Tracking • Network Reach Analytics</p>
               </div>
            </div>
         </div>

         <div className="flex gap-4 relative z-10 shrink-0">
            <TooltipWrapper tooltip="Net change in total platform subscribers across all monitored digital networks over the last 7 days." side="top">
              <div className="text-right cursor-help">
                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Weekly Growth</div>
                  <div className={cn("text-xl font-black tabular-nums leading-none", stats.totalWeeklyGrowth >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {stats.totalWeeklyGrowth >= 0 ? '+' : ''}{formatSubscribers(stats.totalWeeklyGrowth)}
                  </div>
              </div>
            </TooltipWrapper>
            <div className="w-[1px] h-10 bg-white/10" />
            <TooltipWrapper tooltip="Number of independent media entities currently operating digital distribution platforms." side="top">
              <div className="text-right cursor-help">
                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Active Conglomerates</div>
                  <div className="text-xl font-black text-foreground leading-none">{stats.activeCount} <span className="text-[10px] text-muted-foreground/40 italic">Global</span></div>
              </div>
            </TooltipWrapper>
         </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Platform Grid */}
        <div className="flex-1 flex flex-col space-y-4">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                 <Activity className="w-4 h-4 text-primary" /> Active Platforms
              </h2>
              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border-none">Market Open</Badge>
           </div>
           
           <ScrollArea className="flex-1 pr-4">
             <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 pb-8">
               {activeBuyers.map(buyer => (
                 <PlatformCard 
                    key={buyer.id} 
                    buyer={buyer} 
                    allBuyers={buyers} 
                    onDeal={setDealBuyer} 
                    onViewHistory={setSelectedBuyerForHistory}
                 />
               ))}
             </div>
           </ScrollArea>
        </div>

        {/* Right Column: Intelligence Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0">
           {/* Detailed M&A History Feed */}
           <div className="glass-panel rounded-2xl border border-white/5 flex flex-col h-full min-h-[400px] overflow-hidden group/intel">
              <div className="p-5 border-b border-white/5 bg-white/2 flex items-center justify-between">
                 <TooltipWrapper tooltip="Chronological audit of platform acquisitions, mergers, and market consolidation events." side="left">
                   <div className="cursor-help">
                      <h3 className="text-xs font-black uppercase tracking-widest text-foreground leading-none mb-1 flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" /> Industry Intelligence
                      </h3>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Consolidation History</p>
                   </div>
                 </TooltipWrapper>
                 {selectedBuyerForHistory && (
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    tooltip="Reset intelligence feed to show global industry history"
                    onClick={() => setSelectedBuyerForHistory(null)}
                    className="h-6 text-[8px] font-black uppercase hover:bg-white/10 transition-colors duration-200 px-2"
                   >
                     Clear Filter
                   </Button>
                 )}
              </div>
              
              <ScrollArea className="flex-1">
                 <div className="p-5">
                    {selectedBuyerForHistory ? (
                       <MAHistoryFeed buyer={selectedBuyerForHistory} />
                    ) : (
                      <div className="space-y-6">
                        {/* Summary of acquisitions */}
                        <div className="grid grid-cols-2 gap-3">
                           <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center group-hover/intel:border-primary/20 transition-colors">
                              <div className="text-xl font-black text-rose-400">{stats.mergers}</div>
                              <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Mergers</div>
                           </div>
                           <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center group-hover/intel:border-violet-400/20 transition-colors">
                              <div className="text-xl font-black text-violet-400">{acquiredPlatforms.length}</div>
                              <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Absorbed</div>
                           </div>
                        </div>

                        {acquiredPlatforms.length > 0 ? (
                           <div className="space-y-2">
                             {acquiredPlatforms.map(p => (
                               <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5 group/plat">
                                  <div className="min-w-0">
                                     <div className="text-[10px] font-black uppercase text-foreground truncate">{p.name}</div>
                                     <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Absorbed by {p.parentCompany}</div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    tooltip={`Analyze ${p.name} acquisition details`}
                                    onClick={() => setSelectedBuyerForHistory(p)}
                                    className="h-8 w-8 p-0 opacity-0 group-hover/plat:opacity-100 transition-opacity"
                                  >
                                    <FileSearch className="w-3.5 h-3.5" />
                                  </Button>
                               </div>
                             ))}
                           </div>
                        ) : (
                           <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
                              <ArrowRightLeft className="w-8 h-8 mb-2" />
                              <p className="text-[10px] font-black uppercase tracking-widest">No mergers to report</p>
                           </div>
                        )}
                      </div>
                    )}
                 </div>
              </ScrollArea>

              <div className="p-4 border-t border-white/5 bg-white/1 text-center">
                 <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Institutional Grade Data Feed</p>
              </div>
           </div>
        </div>
      </div>

      {dealBuyer && (
        <DealModal 
          buyer={dealBuyer} 
          open={!!dealBuyer} 
          onClose={() => setDealBuyer(null)} 
        />
      )}
    </div>
  );
};

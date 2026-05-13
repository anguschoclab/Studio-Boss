import React, { useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Buyer, StreamerPlatform } from '@/engine/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowRightLeft,
  FileSearch,
  Globe,
  History,
  Activity,
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
    <div className="flex flex-col h-full space-y-10 animate-in fade-in duration-1000 pb-20">
      {/* Dynamic Industry Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white/[0.02] p-10 rounded-none border border-white/5 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
         <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-primary/5 to-transparent opacity-50 pointer-events-none" />
         
         <div className="relative z-10">
            <div className="flex items-center gap-6 mb-3">
               <div className="w-16 h-16 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center shadow-xl group-hover:bg-primary/10 transition-all duration-700">
                  <Globe className="w-8 h-8 text-primary animate-pulse-slow" strokeWidth={1} />
               </div>
               <div>
                  <h1 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none mb-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">GLOBAL DISTRIBUTION INTEL</h1>
                  <p className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.4em] italic flex items-center gap-4 mt-1">
                    LIVE INDUSTRY M&A TRACKING 
                    <span className="w-1.5 h-1.5 bg-white/10" /> 
                    NETWORK REACH ANALYTICS
                  </p>
               </div>
            </div>
         </div>

         <div className="flex gap-10 relative z-10 shrink-0">
            <TooltipWrapper tooltip="NET CHANGE IN TOTAL PLATFORM SUBSCRIBERS ACROSS ALL MONITORED DIGITAL NETWORKS." side="top">
              <div className="text-right cursor-help space-y-2">
                  <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">WEEKLY GROWTH</div>
                  <div className={cn("text-3xl font-display font-black tabular-nums leading-none italic", stats.totalWeeklyGrowth >= 0 ? "text-emerald-400" : "text-red-500")}>
                      {stats.totalWeeklyGrowth >= 0 ? '+' : ''}{formatSubscribers(stats.totalWeeklyGrowth)}
                  </div>
              </div>
            </TooltipWrapper>
            <div className="w-[1px] h-12 bg-white/10 self-center" />
            <TooltipWrapper tooltip="NUMBER OF INDEPENDENT MEDIA ENTITIES CURRENTLY OPERATING DIGITAL DISTRIBUTION PLATFORMS." side="top">
              <div className="text-right cursor-help space-y-2">
                  <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">ACTIVE CONGLOMERATES</div>
                  <div className="text-3xl font-display font-black text-foreground/90 leading-none italic">{stats.activeCount} <span className="text-[12px] text-muted-foreground/20 italic tracking-widest">GLOBAL</span></div>
              </div>
            </TooltipWrapper>
         </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-10">
        {/* Left Column: Platform Grid */}
        <div className="flex-1 flex flex-col space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic flex items-center gap-3">
                 <Activity className="w-5 h-5 text-primary" /> ACTIVE PLATFORMS
              </h2>
              <div className="text-[9px] font-black uppercase tracking-[0.3em] bg-emerald-400/5 text-emerald-400 border border-emerald-400/20 px-4 h-6 flex items-center justify-center rounded-none italic shadow-[0_0_15px_rgba(52,211,153,0.1)]">MARKET OPEN</div>
           </div>
           
           <ScrollArea className="flex-1 pr-6 custom-scrollbar">
             <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8 pb-12">
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
        <div className="w-full lg:w-[400px] flex flex-col shrink-0">
           {/* Detailed M&A History Feed */}
           <div className="glass-card rounded-none border border-white/5 flex flex-col h-full min-h-[500px] overflow-hidden group/intel bg-white/[0.01] shadow-2xl">
              <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                 <TooltipWrapper tooltip="CHRONOLOGICAL AUDIT OF PLATFORM ACQUISITIONS, MERGERS, AND MARKET CONSOLIDATION EVENTS." side="left">
                   <div className="cursor-help">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/80 leading-none mb-3 flex items-center gap-3 italic">
                        <History className="w-5 h-5 text-primary" /> INDUSTRY INTELLIGENCE
                      </h3>
                      <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] italic">CONSOLIDATION HISTORY</p>
                   </div>
                 </TooltipWrapper>
                 {selectedBuyerForHistory && (
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedBuyerForHistory(null)}
                    className="h-8 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/5 px-4 rounded-none italic border border-white/10"
                   >
                     CLEAR FILTER
                   </Button>
                 )}
              </div>
              
              <ScrollArea className="flex-1 custom-scrollbar">
                 <div className="p-8">
                    {selectedBuyerForHistory ? (
                       <MAHistoryFeed buyer={selectedBuyerForHistory} />
                    ) : (
                      <div className="space-y-8">
                        {/* Summary of acquisitions */}
                        <div className="grid grid-cols-2 gap-6">
                           <div className="p-6 rounded-none bg-black/40 border border-white/5 text-center group-hover/intel:border-red-500/20 transition-all duration-700 shadow-xl">
                              <div className="text-3xl font-display font-black text-red-500 italic leading-none mb-2">{stats.mergers}</div>
                              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">MERGERS</div>
                           </div>
                           <div className="p-6 rounded-none bg-black/40 border border-white/5 text-center group-hover/intel:border-violet-500/20 transition-all duration-700 shadow-xl">
                              <div className="text-3xl font-display font-black text-violet-500 italic leading-none mb-2">{acquiredPlatforms.length}</div>
                              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">ABSORBED</div>
                           </div>
                        </div>

                        {acquiredPlatforms.length > 0 ? (
                           <div className="space-y-4">
                             {acquiredPlatforms.map(p => (
                               <div key={p.id} className="flex items-center justify-between p-6 rounded-none bg-white/[0.02] border border-white/5 group/plat hover:border-primary/20 transition-all duration-700 shadow-lg">
                                  <div className="min-w-0">
                                     <div className="text-xs font-black uppercase tracking-[0.2em] text-foreground/90 truncate italic mb-1">{p.name}</div>
                                     <div className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] italic">ABSORBED BY {p.parentCompany?.toUpperCase()}</div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setSelectedBuyerForHistory(p)}
                                    className="h-10 w-10 p-0 opacity-0 group-hover/plat:opacity-100 transition-all duration-700 bg-primary/5 hover:bg-primary/20 text-primary border border-primary/20 rounded-none"
                                  >
                                    <FileSearch className="w-4 h-4" />
                                  </Button>
                               </div>
                             ))}
                           </div>
                        ) : (
                           <div className="flex flex-col items-center justify-center py-32 text-center opacity-20 space-y-6">
                              <ArrowRightLeft className="w-12 h-12" strokeWidth={1} />
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">NO MERGERS TO REPORT</p>
                           </div>
                        )}
                      </div>
                    )}
                 </div>
              </ScrollArea>

              <div className="p-6 border-t border-white/5 bg-white/[0.01] text-center">
                 <p className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.5em] italic">INSTITUTIONAL GRADE DATA FEED</p>
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

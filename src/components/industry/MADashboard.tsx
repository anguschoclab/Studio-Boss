import React, { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { RegulatorSystem } from '@/engine/systems/industry/RegulatorSystem';
import { TrendingUp, ShieldAlert, History, Users, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MADashboard: React.FC = () => {
  const state = useGameStore(s => s.gameState);
  
  const industryData = useMemo(() => {
    if (!state) return { allStudios: [], playerShare: 0 };
    const rivals = Object.values(state.entities?.rivals || {});
    const playerShare = RegulatorSystem.getMarketShare(state, 'player');
    
    const allStudios = [
      { id: state.studio.id, name: state.studio.name, share: playerShare, isPlayer: true, archetype: state.studio.archetype },
      ...rivals.map(r => ({
        id: r.id,
        name: r.name,
        share: RegulatorSystem.getMarketShare(state, r.id),
        isPlayer: false,
        archetype: r.archetype
      }))
    ].sort((a, b) => b.share - a.share);

    const mnaEvents = state.industry.newsHistory.filter(n => 
      n.headline.toLowerCase().includes('consolidation') || 
      n.headline.toLowerCase().includes('acquisition') ||
      n.headline.toLowerCase().includes('merger') ||
      n.headline.toLowerCase().includes('vertical integration')
    );

    return { allStudios, mnaEvents };
  }, [state]);

  return (
    <div className="p-0 space-y-12 animate-in fade-in duration-700">
      <header className="flex justify-between items-end pb-8 border-b border-white/5">
        <div>
          <h1 className="text-4xl font-display font-black text-foreground uppercase tracking-tighter italic leading-none">
            Consolidation Intelligence
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mt-4">MARKET SHARE ANALYSIS & ANTI-TRUST RISK MONITORING</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/[0.02] border border-white/5 p-4 px-8 flex items-center gap-4">
             <Users className="text-primary w-5 h-5" />
             <div>
               <div className="text-[9px] text-muted-foreground/40 uppercase tracking-[0.2em] font-black">Active Studios</div>
               <div className="text-xl font-display font-black italic text-foreground leading-none mt-1">{industryData.allStudios.length}</div>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Market Share Heatmap / Bubble View */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center gap-3 mb-4">
             <Activity className="text-primary w-5 h-5" />
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">Market Share Matrix</h2>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
             {industryData.allStudios.map((studio) => (
               <div 
                 key={studio.id}
                 className={cn(
                   "relative overflow-hidden rounded-none p-8 border transition-all duration-700 group",
                   studio.isPlayer 
                    ? 'bg-primary/5 border-primary/20 shadow-2xl' 
                    : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10'
                 )}
               >
                 <div className="relative z-10 space-y-6">
                   <div className="flex justify-between items-start">
                     <span className={cn(
                       "text-[9px] uppercase font-black tracking-[0.2em] px-3 py-1 rounded-none border",
                       studio.archetype === 'major' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                       studio.archetype === 'mid-tier' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                       'bg-white/5 text-muted-foreground/40 border-white/5'
                     )}>
                       {studio.archetype}
                     </span>
                     <span className="text-4xl font-display font-black italic text-foreground tracking-tighter leading-none">
                       {studio.share.toFixed(1)}%
                     </span>
                   </div>
                   <h3 className={cn(
                     "font-display font-black uppercase italic tracking-tighter text-xl truncate leading-none",
                     studio.isPlayer ? "text-primary" : "text-foreground/80"
                   )}>
                     {studio.name} {studio.isPlayer && "(HQ)"}
                   </h3>
                   
                   {/* Danger Zone Indicator */}
                   {studio.share > 25 && (
                     <div className="flex items-center gap-2 text-[9px] text-destructive font-black uppercase tracking-widest animate-pulse border-t border-destructive/20 pt-4">
                       <ShieldAlert className="w-3.5 h-3.5" />
                       ANTI-TRUST VECTOR DETECTED
                     </div>
                   )}
                 </div>

                 {/* Visual Heat Gradient Background */}
                 <div 
                   className="absolute bottom-0 left-0 h-1 transition-all duration-1000" 
                   style={{ 
                     width: `${studio.share}%`, 
                     backgroundColor: studio.share > 25 ? '#ef4444' : (studio.isPlayer ? 'rgba(var(--primary),1)' : 'rgba(255,255,255,0.1)'),
                     boxShadow: `0 0 20px ${studio.share > 25 ? '#ef4444' : 'rgba(var(--primary),0.3)'}`
                   }} 
                 />
               </div>
             ))}
           </div>
        </div>

        {/* History / M&A Timeline */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-4">
             <History className="text-secondary w-5 h-5" />
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">Consolidation History</h2>
          </div>
          
          <div className="bg-white/[0.01] border border-white/5 rounded-none h-[640px] overflow-y-auto custom-scrollbar p-8">
            {industryData.mnaEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                 <div className="w-16 h-16 bg-white/[0.02] border border-white/5 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 opacity-10" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic max-w-[200px]">NO RECENT CONSOLIDATION VECTORS DETECTED</p>
              </div>
            ) : (
              <div className="space-y-10 relative before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
                {industryData.mnaEvents.map((event) => (
                  <div key={event.id} className="relative pl-10 group">
                    <div className="absolute left-0 top-1.5 w-2 h-2 bg-secondary group-hover:shadow-[0_0_15px_rgba(var(--secondary),0.6)] transition-all" />
                    <div className="text-[9px] font-display font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-2">
                      WEEK {event.week}
                    </div>
                    <div className="text-sm font-display font-black uppercase italic tracking-tighter text-foreground/90 mb-2 leading-tight group-hover:text-primary transition-colors">
                      {event.headline}
                    </div>
                    <div className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest">
                       INTEL SOURCE: THE TRADES
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

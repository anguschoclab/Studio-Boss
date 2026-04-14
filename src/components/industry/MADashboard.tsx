import React, { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { RegulatorSystem } from '@/engine/systems/industry/RegulatorSystem';
import { TrendingUp, ShieldAlert, History, Users, Activity } from 'lucide-react';

export const MADashboard: React.FC = () => {
  const state = useGameStore(s => s.gameState);

  const industryData = useMemo(() => {
    if (!state) {
      return { allStudios: [], mnaEvents: [] };
    }
    const rivals = state.entities.rivals;
    const playerShare = RegulatorSystem.getMarketShare(state, 'player');

    const allStudios = [
      { id: 'player', name: state.studio.name, share: playerShare, isPlayer: true, archetype: state.studio.archetype },
      ...Object.values(rivals).map(r => ({
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

  if (!state) return null;

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Industry Consolidation Tracker
          </h1>
          <p className="text-slate-400 mt-1">Market share analysis and anti-trust risk monitoring</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 px-5 flex items-center gap-3">
             <Users className="text-blue-400 w-5 h-5" />
             <div>
               <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Active Studios</div>
               <div className="text-xl font-mono text-white">{industryData.allStudios.length}</div>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Share Heatmap / Bubble View */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center gap-2 mb-2">
             <Activity className="text-indigo-400 w-5 h-5" />
             <h2 className="text-xl font-semibold text-white">Market Share Heatmap</h2>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             {industryData.allStudios.map((studio) => (
               <div 
                 key={studio.id}
                 className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] ${
                   studio.isPlayer 
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                    : 'bg-slate-800/40 border-slate-700/50'
                 }`}
               >
                 <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                     <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                       studio.archetype === 'major' ? 'bg-amber-500/20 text-amber-500' :
                       studio.archetype === 'mid-tier' ? 'bg-indigo-500/20 text-indigo-500' :
                       'bg-slate-500/20 text-slate-400'
                     }`}>
                       {studio.archetype}
                     </span>
                     <span className="text-2xl font-mono font-bold text-white">
                       {studio.share.toFixed(1)}%
                     </span>
                   </div>
                   <h3 className={`font-bold truncate text-lg ${studio.isPlayer ? 'text-blue-200' : 'text-slate-200'}`}>
                     {studio.name} {studio.isPlayer && "(You)"}
                   </h3>
                   
                   {/* Danger Zone Indicator */}
                   {studio.share > 25 && (
                     <div className="mt-4 flex items-center gap-2 text-[10px] text-rose-400 font-bold uppercase animate-pulse">
                       <ShieldAlert className="w-3 h-3" />
                       Anti-Trust High Risk
                     </div>
                   )}
                 </div>

                 {/* Visual Heat Gradient Background */}
                 <div 
                   className="absolute bottom-0 left-0 h-1 transition-all duration-1000" 
                   style={{ 
                     width: `${studio.share}%`, 
                     backgroundColor: studio.share > 25 ? '#f43f5e' : (studio.isPlayer ? '#3b82f6' : '#6366f1'),
                     boxShadow: `0 0 10px ${studio.share > 25 ? '#f43f5e' : '#6366f1'}44`
                   }} 
                 />
               </div>
             ))}
           </div>
        </div>

        {/* History / M&A Timeline */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <History className="text-amber-400 w-5 h-5" />
             <h2 className="text-xl font-semibold text-white">Consolidation History</h2>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl h-[600px] overflow-y-auto custom-scrollbar">
            {industryData.mnaEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 p-8 text-center space-y-4">
                 <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 opacity-20" />
                 </div>
                 <p className="text-sm">No major mergers detected in recent history. The landscape remains fragmented.</p>
              </div>
            ) : (
              <div className="p-4 space-y-6">
                {industryData.mnaEvents.map((event) => (
                  <div key={event.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-slate-700">
                    <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                      Week {event.week}
                    </div>
                    <div className="text-sm font-semibold text-slate-200 mb-1 leading-tight">
                      {event.headline}
                    </div>
                    <div className="text-xs text-slate-500 italic">
                       Reported by The Trades
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

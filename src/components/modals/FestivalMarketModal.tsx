import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Project } from '@/engine/types';
import { Button } from '@/components/ui/button';
import { Gavel, Users, TrendingUp, Clock } from 'lucide-react';
import { generateFestivalBid } from '@/engine/systems/ai/AgentBrain';
import { RandomGenerator } from '@/engine/utils/rng';

/**
 * FestivalMarketModal: The "Gavel Auction" live bidding interface.
 * Simulates real-time (simulated) bidding between the player and AI rivals.
 */
export const FestivalMarketModal: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);
  const studioFinance = useGameStore(s => s.finance);
  const addProject = useGameStore(s => s.addProject);
  const addFunds = useGameStore(s => s.addFunds);
  
  const { activeModal, resolveCurrentModal } = useUIStore();
  
  const project = activeModal?.payload?.project as Project;
  const [currentBid, setCurrentBid] = useState(Math.round(project?.budget * 0.8 || 0));
  const [highestBidderId, setHighestBidderId] = useState<string | 'PLAYER' | null>(null);
  const [highestBidderName, setHighestBidderName] = useState<string>('Opening Floor');
  const [timeLeft, setTimeLeft] = useState(10); // Ticks until gavel falls
  const [isResolved, setIsResolved] = useState(false);

  // AI Bidding Logic (Simulated ticks)
  useEffect(() => {
    if (isResolved || !project || !gameState) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalize();
          return 0;
        }
        return prev - 1;
      });

      // 🎭 UI Simulation: We use a non-deterministic local RNG for the "feeling" of a live auction.
      // The actual acquisition is committed to the state only on win.
      const localRng = new RandomGenerator(Date.now()); 
      const rivals = gameState.entities.rivals;
      
      Object.values(rivals).forEach(rival => {
        if (rival.id === highestBidderId) return;

        // Determine if this rival wants to bid
        const potentialBid = generateFestivalBid(rival, project, localRng);
        const nextIncrementalBid = Math.round(currentBid * 1.05);

        if (potentialBid && potentialBid >= nextIncrementalBid && rival.cash >= nextIncrementalBid) {
          // AI Bids! - Add some jitter to make it feel more human/rivalrous
          if (localRng.next() < 0.25) { 
            setCurrentBid(nextIncrementalBid);
            setHighestBidderId(rival.id);
            setHighestBidderName(rival.name);
            setTimeLeft(5); // Reset timer on new bid
          }
        }
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [currentBid, highestBidderId, isResolved, project, gameState]);

  const handlePlayerBid = () => {
    if (!gameState) return;
    const nextBid = Math.round(currentBid * 1.05);
    if (studioFinance.cash < nextBid) return;

    setCurrentBid(nextBid);
    setHighestBidderId('PLAYER');
    setHighestBidderName(gameState.studio.name);
    setTimeLeft(5); // Reset timer
  };

  const handleFinalize = () => {
    setIsResolved(true);
    if (!highestBidderId || !project) {
       resolveCurrentModal();
       return;
    }

    // Dispatch victory impact
    if (highestBidderId === 'PLAYER') {
      addProject({
        ...project,
        state: 'released',
        isAcquired: true,
        acquisitionCost: currentBid
      });
      addFunds(-currentBid);
    }

    // Wait 2 seconds then close
    setTimeout(() => {
        resolveCurrentModal();
    }, 2000);
  };

  if (!project || !gameState) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <Gavel className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Live Festival Auction</span>
          </div>
          <h2 className="text-3xl font-display font-black tracking-tight text-white line-clamp-1">{project.title}</h2>
          <p className="text-slate-400 text-xs mt-1 italic">{project.genre} • quality: {project.reviewScore}%</p>
        </div>

        {/* Main Auction Block */}
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className="mb-8">
            <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Current High Bid</div>
            <div className="text-6xl font-display font-black text-white tabular-nums tracking-tighter">
              ${(currentBid / 1000000).toFixed(2)}M
            </div>
            <div className="flex items-center justify-center gap-2 mt-3 p-2 bg-slate-900 rounded-full border border-slate-800">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className={`text-xs font-bold ${highestBidderId === 'PLAYER' ? 'text-green-400' : 'text-slate-200'}`}>
                {highestBidderName}
              </span>
            </div>
          </div>

          {/* Progress Bar / Timer */}
          <div className="w-full max-w-md bg-slate-900 h-1.5 rounded-full overflow-hidden mb-8 border border-slate-800">
             <div 
               className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 3 ? 'bg-red-500' : 'bg-amber-500'}`}
               style={{ width: `${(timeLeft / 10) * 100}%` }}
             />
          </div>

          {isResolved ? (
            <div className="py-6 animate-bounce">
              <span className="text-4xl font-display font-black text-amber-500 uppercase italic tracking-tighter">
                Sold!
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full max-w-sm">
              <Button 
                size="lg" 
                onClick={handlePlayerBid}
                disabled={studioFinance.cash < currentBid * 1.05}
                className="h-16 text-lg font-black uppercase tracking-wider bg-white text-black hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Bid ${( (currentBid * 1.05) / 1000000).toFixed(2)}M
              </Button>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Your Cash: ${(studioFinance.cash / 1000000).toFixed(1)}M
              </div>
            </div>
          )}
        </div>

        {/* Footer / Info */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center text-[9px] uppercase font-black tracking-widest text-slate-500">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Time Remaining: {timeLeft}s</span>
          </div>
          <div>Location: Park City, Utah</div>
        </div>
      </div>
    </div>
  );
};

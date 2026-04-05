import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Trophy, Star, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AwardsPayload {
  awards: import('@/engine/types').Award[];
  body?: string;
  year?: number;
}

export const AwardsCeremonyModal = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  
  const [phase, setPhase] = useState<'nominees' | 'reveal'>('nominees');
  const [currentAwardIdx, setCurrentAwardIdx] = useState(0);

  if (!gameState || !activeModal || activeModal.type !== 'AWARDS') return null;

  const payload = activeModal.payload as unknown as AwardsPayload;
  const { awards = [], body = 'Annual Industry Awards', year = 2026 } = payload || {};
  
  // Safety guard for empty awards
  if (awards.length === 0) {
    // If the modal was triggered but has no awards, resolve it immediately to avoid a crash
    resolveCurrentModal();
    return null;
  }

  const currentAward = awards[currentAwardIdx];
  if (!currentAward) {
    resolveCurrentModal();
    return null;
  }

  const handleNext = () => {
    if (currentAwardIdx < awards.length - 1) {
      setCurrentAwardIdx(prev => prev + 1);
      setPhase('reveal');
    } else {
      resolveCurrentModal();
      // Reset local state for next time
      setPhase('nominees');
      setCurrentAwardIdx(0);
    }
  };

  const getProjectTitle = (id: string) => {
    return gameState?.studio?.internal?.projects[id]?.title || "Unknown Project";
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-4xl bg-stone-950 border-stone-800 shadow-[0_0_100px_rgba(212,175,55,0.15)] overflow-hidden p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05),transparent)] pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {phase === 'nominees' ? (
            <motion.div 
              key="nominees"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 flex flex-col items-center gap-8"
            >
              <div className="text-center space-y-2">
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3].map(i => <Star key={i} className="h-4 w-4 text-amber-500 animate-pulse" fill="currentColor" />)}
                </div>
                <h2 className="text-4xl font-serif font-black tracking-widest text-amber-500 uppercase">
                  {body}
                </h2>
                <p className="text-stone-400 font-medium tracking-[0.2em] uppercase text-sm">
                  Class of {year} • Official Nominees
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {awards.map((award: any, i: number) => (
                  <motion.div 
                    key={award.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-stone-900/50 border border-stone-800 p-4 rounded-xl flex flex-col gap-1 hover:border-amber-500/50 transition-colors"
                  >
                    <span className="text-xs font-black text-amber-500/60 uppercase tracking-tighter">{award.category}</span>
                    <span className="text-lg font-bold text-white leading-tight">{getProjectTitle(award.projectId)}</span>
                  </motion.div>
                ))}
              </div>

              <Button 
                onClick={() => setPhase('reveal')}
                className="bg-amber-600 hover:bg-amber-500 text-black font-black uppercase tracking-widest px-12 py-6 h-auto text-lg rounded-full shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all hover:scale-105 active:scale-95"
              >
                Enter the Ballroom
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="reveal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="relative p-12 min-h-[500px] flex flex-col items-center justify-center gap-8 text-center"
            >
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute top-10"
              >
                <Trophy className="h-24 w-24 text-amber-500 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
              </motion.div>

              <div className="space-y-6 pt-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="text-sm font-black text-amber-500/60 uppercase tracking-[0.3em] mb-2 block">The Category is</span>
                  <h3 className="text-3xl font-serif font-black text-white uppercase italic">{currentAward.category}</h3>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className="space-y-4"
                >
                  <div className="inline-block p-1 rounded-sm bg-stone-800 text-amber-500 text-[10px] font-black uppercase tracking-widest px-3 mb-2">And the winner is...</div>
                  
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [0.8, 1.1, 1] }}
                    transition={{ delay: 1.8, duration: 0.5 }}
                    className="relative"
                  >
                    <h1 className="text-5xl md:text-6xl font-serif font-black text-white tracking-tight drop-shadow-2xl">
                      {getProjectTitle(currentAward.projectId)}
                    </h1>
                    <Sparkles className="absolute -top-10 -left-10 h-10 w-10 text-amber-300 animate-ping" />
                    <Sparkles className="absolute -bottom-10 -right-10 h-10 w-10 text-amber-300 animate-ping delay-75" />
                  </motion.div>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
                className="mt-8"
              >
                <Button 
                  onClick={handleNext}
                  variant="ghost"
                  className="text-amber-500 hover:text-amber-400 hover:bg-stone-900 border border-amber-900/30 font-black uppercase tracking-widest px-8 group"
                >
                  {currentAwardIdx < awards.length - 1 ? "Next Category" : "Discard the Envelope"}
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

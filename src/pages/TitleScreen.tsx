import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGameStore } from '@/store/gameStore';
import { formatMoney, getWeekDisplay } from '@/engine/utils';
import { SaveSlotInfo } from '@/persistence/saveLoad';

const TitleScreen = () => {
  const navigate = useNavigate();
  const { loadFromSlot, getSaveSlots } = useGameStore();
  const [showLoad, setShowLoad] = useState(false);
  const [slots, setSlots] = useState<SaveSlotInfo[]>([]);
  const [hasSaves, setHasSaves] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSlots = async () => {
      const result = await getSaveSlots();
      if (!isMounted) return;
      setSlots(result);
      setHasSaves(result.some((s: any) => s.exists));
    };
    fetchSlots();

    // Handle Auto-Start redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoStart') === 'true' && useGameStore.getState().gameState) {
      navigate({ to: '/dashboard' });
    }
    return () => { isMounted = false; };
  }, [getSaveSlots, navigate]);

  const handleLoad = async (slot: number) => {
    const success = await loadFromSlot(slot);
    if (success) {
      navigate({ to: '/dashboard' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/3 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 text-center space-y-12">
        <div className="space-y-4">
          <h1 className="font-display text-6xl font-black tracking-tighter uppercase text-foreground leading-none text-glow">
            STUDIO <span className="text-primary">BOSS</span>
          </h1>
          <p className="text-muted-foreground text-base font-medium italic">
            Build your empire. Control the narrative.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-[480px] mx-auto">
          <Button
            onClick={() => navigate({ to: '/new-game' })}
            size="lg"
            className="w-full text-lg h-14 font-display font-bold tracking-wide"
          >
            New Game
          </Button>
          {hasSaves && (
            <Button
              onClick={() => setShowLoad(true)}
              variant="outline"
              size="lg"
              className="w-full h-12 font-display tracking-wide"
            >
              Load Game
            </Button>
          )}
          <Button
            onClick={() => {
              const { devAutoInit } = useGameStore.getState();
              devAutoInit();
              navigate({ to: '/dashboard' });
            }}
            variant="ghost"
            size="sm"
            className="w-full h-10 font-display text-muted-foreground hover:text-primary transition-colors opacity-50 hover:opacity-100"
          >
            Quick Start (Dev)
          </Button>
        </div>

        <p className="text-muted-foreground/50 text-xs tracking-widest uppercase">
          A Hollywood Studio Management Simulation
        </p>
      </div>

      <Dialog open={showLoad} onOpenChange={setShowLoad}>
        <DialogContent className="max-w-2xl bg-card/90 backdrop-blur-2xl border border-white/10">
          <DialogHeader>
            <DialogTitle className="font-display font-black text-2xl tracking-tight uppercase">Load Game</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {slots.map(slot => (
              <button
                key={slot.slot}
                disabled={!slot.exists}
                onClick={() => handleLoad(slot.slot)}
                className="glass-card p-4 text-left hover:-translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {slot.exists ? (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="font-display font-black text-sm text-foreground truncate">{slot.studioName}</p>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Slot {slot.slot + 1}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Week {getWeekDisplay(slot.week).displayWeek}, Year {getWeekDisplay(slot.week).year}
                      </p>
                      <p className="text-primary font-black text-sm">{formatMoney(slot.cash)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-20">
                    <p className="text-muted-foreground text-sm font-medium">Slot {slot.slot + 1} — Empty</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TitleScreen;

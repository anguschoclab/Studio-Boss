import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGameStore } from '@/store/gameStore';
import { formatMoney, getWeekDisplay } from '@/engine/utils';

const TitleScreen = () => {
  const navigate = useNavigate();
  const { loadFromSlot, getSaveSlots } = useGameStore();
  const [showLoad, setShowLoad] = useState(false);
  const slots = getSaveSlots();
  const hasSaves = slots.some(s => s.exists);

  const handleLoad = (slot: number) => {
    if (loadFromSlot(slot)) {
      navigate({ to: '/dashboard' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/3 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 text-center space-y-12">
        <div className="space-y-4">
          <h1 className="font-display text-8xl font-black tracking-tighter text-foreground leading-none">
            STUDIO <span className="text-primary">BOSS</span>
          </h1>
          <p className="text-muted-foreground text-lg tracking-[0.3em] uppercase font-light">
            Build your empire. Control the narrative.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-72 mx-auto">
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
        </div>

        <p className="text-muted-foreground/50 text-xs tracking-widest uppercase">
          A Hollywood Studio Management Simulation
        </p>
      </div>

      {/* Load Dialog */}
      <Dialog open={showLoad} onOpenChange={setShowLoad}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Load Game</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {slots.map(slot => (
              <button
                key={slot.slot}
                disabled={!slot.exists}
                onClick={() => handleLoad(slot.slot)}
                className="w-full p-4 rounded-lg border border-border bg-accent/50 text-left hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {slot.exists ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-display font-semibold text-foreground">{slot.studioName}</p>
                      <p className="text-sm text-muted-foreground">
                        Week {getWeekDisplay(slot.week).displayWeek}, Year {getWeekDisplay(slot.week).year}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-semibold">{formatMoney(slot.cash)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(slot.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Slot {slot.slot + 1} — Empty</p>
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

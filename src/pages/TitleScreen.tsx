/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGameStore } from "@/store/gameStore";
import { formatMoney, getWeekDisplay } from "@/engine/utils";
import { SaveSlotInfo } from "@/persistence/saveLoad";
import { Play, Database, Terminal, Shield, Zap, Target } from "lucide-react";

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
    if (params.get("autoStart") === "true" && useGameStore.getState().gameState) {
      navigate({ to: "/dashboard" });
    }
    return () => {
      isMounted = false;
    };
  }, [getSaveSlots, navigate]);

  const handleLoad = async (slot: number) => {
    const success = await loadFromSlot(slot);
    if (success) {
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden font-display">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="relative z-10 text-center space-y-20 animate-in fade-in duration-1000">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-4 px-6 py-2 bg-primary/5 border border-primary/20 text-[10px] font-black uppercase tracking-[0.5em] italic text-primary mb-4 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
            <Shield className="w-4 h-4" /> SECURE CONSOLE ACCESS
          </div>
          <h1 className="text-9xl font-black tracking-tighter uppercase text-foreground leading-none drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] italic select-none">
            STUDIO <span className="text-primary italic">BOSS</span>
          </h1>
          <p className="text-muted-foreground/40 text-xs font-black uppercase tracking-[0.8em] italic leading-none pl-4">
            BUILD YOUR EMPIRE. CONTROL THE NARRATIVE.
          </p>
        </div>

        <div className="flex flex-col gap-6 w-full max-w-[500px] mx-auto px-4">
          <Button
            onClick={() => navigate({ to: "/new-game" })}
            size="lg"
            className="w-full h-20 text-xl font-black tracking-[0.3em] uppercase italic bg-primary text-black hover:bg-primary/90 rounded-none shadow-[0_0_30px_rgba(var(--primary),0.2)] group transition-all duration-700"
          >
            <Play className="mr-4 h-5 w-5 fill-current group-hover:scale-125 transition-transform" />
            INITIALIZE EMPIRE
          </Button>

          {hasSaves && (
            <Button
              onClick={() => setShowLoad(true)}
              variant="outline"
              size="lg"
              className="w-full h-16 text-xs font-black tracking-[0.4em] uppercase italic bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.05] rounded-none transition-all duration-700"
            >
              <Database className="mr-4 h-4 w-4 text-muted-foreground/40" />
              RESTORE ARCHIVES
            </Button>
          )}

          <Button
            onClick={() => {
              const { devAutoInit } = useGameStore.getState();
              devAutoInit();
              navigate({ to: "/dashboard" });
            }}
            variant="ghost"
            size="sm"
            className="w-full h-12 text-[9px] font-black tracking-[0.5em] uppercase italic text-muted-foreground/20 hover:text-primary transition-all duration-700 opacity-50 hover:opacity-100"
          >
            <Terminal className="mr-4 h-3 w-3" />
            BYPASS PROTOCOL (DEV)
          </Button>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-12 opacity-10">
            <div className="w-12 h-px bg-white" />
            <Target className="w-6 h-6" />
            <div className="w-12 h-px bg-white" />
          </div>
          <p className="text-muted-foreground/20 text-[9px] font-black tracking-[0.6em] uppercase italic">
            HOLLYWOOD STUDIO MANAGEMENT SIMULATION • V1.0 COMPLIANT
          </p>
        </div>
      </div>

      <Dialog open={showLoad} onOpenChange={setShowLoad}>
        <DialogContent className="max-w-4xl bg-black/95 backdrop-blur-3xl border border-white/5 rounded-none p-0 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-white/5 bg-white/[0.02]">
            <DialogHeader>
              <DialogTitle className="text-4xl font-display font-black tracking-tighter uppercase italic leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                LOAD ARCHIVES
              </DialogTitle>
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic mt-4 flex items-center gap-4">
                SELECT PERSISTENT DATA MODULE
                <span className="w-1.5 h-1.5 bg-white/10" />
                SYSTEM READY
              </p>
            </DialogHeader>
          </div>

          <div className="p-10 grid grid-cols-2 gap-8">
            {slots.map((slot) => (
              <button
                key={slot.slot}
                disabled={!slot.exists}
                onClick={() => handleLoad(slot.slot)}
                className="group relative flex flex-col gap-6 p-8 bg-white/[0.01] border border-white/5 hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-700 disabled:opacity-20 disabled:cursor-not-allowed text-left rounded-none overflow-hidden"
              >
                {slot.exists && (
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-100 transition-opacity">
                    <Zap className="w-12 h-12 text-primary" strokeWidth={1} />
                  </div>
                )}

                {slot.exists ? (
                  <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] italic">
                        SLOT {String(slot.slot + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-xl font-display font-black text-foreground uppercase tracking-tight italic group-hover:text-primary transition-colors">
                        {slot.studioName}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] italic">
                          TIMELINE
                        </p>
                        <p className="text-[10px] font-black text-foreground/60 uppercase tracking-widest italic">
                          W{getWeekDisplay(slot.week).displayWeek} • Y
                          {getWeekDisplay(slot.week).year}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] italic">
                          REVENUE
                        </p>
                        <p className="text-sm font-display font-black text-primary italic leading-none">
                          {formatMoney(slot.cash)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 gap-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Database className="w-8 h-8" strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">
                      VACANT MODULE {slot.slot + 1}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowLoad(false)}
              className="text-[9px] font-black uppercase tracking-[0.4em] italic text-muted-foreground/40 hover:text-white transition-colors"
            >
              CANCEL ACCESS
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TitleScreen;

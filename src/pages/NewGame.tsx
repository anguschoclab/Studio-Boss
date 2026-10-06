import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dices, Shield, Target, ArrowRight } from "lucide-react";
import { generateStudioName } from "@/engine/generators/names";
import { useGameStore } from "@/store/gameStore";
import { ARCHETYPES, ArchetypeData } from "@/engine/data/archetypes";
import { ArchetypeKey } from "@/engine/types";
import { ArchetypeCard } from "@/components/setup/ArchetypeCard";

const NewGame = () => {
  const navigate = useNavigate();
  const { newGame } = useGameStore();
  const [studioName, setStudioName] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeKey | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("autoStart") === "true") {
      navigate({ to: "/dashboard" });
    }
  }, [navigate]);

  const handleLaunch = async () => {
    if (!studioName.trim() || !selectedArchetype) return;
    await newGame(studioName.trim(), selectedArchetype);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 relative overflow-hidden font-display">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.05),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-6xl space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
        {/* Executive Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-4 px-6 py-2 bg-primary/5 border border-primary/20 text-[10px] font-black uppercase tracking-[0.5em] italic text-primary mb-2 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
            <Shield className="w-4 h-4" /> SECURE INITIALIZATION
          </div>
          <h1 className="text-7xl font-black tracking-tighter uppercase italic text-foreground leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            STUDIO <span className="text-primary italic">SETUP</span>
          </h1>
          <p className="text-muted-foreground/40 text-xs font-black uppercase tracking-[0.4em] italic">
            ESTABLISH YOUR CORPORATE IDENTITY AND MARKET POSITIONING.
          </p>
        </div>

        {/* Studio Name Input Suite */}
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4 px-2">
            <div className="w-2 h-4 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
            <label
              htmlFor="studioName"
              className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic"
            >
              CORPORATE DESIGNATION
            </label>
          </div>
          <div className="flex gap-4">
            <div className="relative flex-1 group">
              <Input
                id="studioName"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="ENTER STUDIO NAME..."
                className="h-20 text-2xl text-center font-black bg-white/[0.02] border-white/10 focus:border-primary/40 focus:ring-primary/10 rounded-none uppercase italic tracking-[0.1em] transition-all duration-700 placeholder:text-muted-foreground/5"
                maxLength={30}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-20 w-20 shrink-0 bg-white/[0.02] border-white/10 hover:border-primary hover:bg-primary/[0.05] hover:text-primary transition-all duration-700 rounded-none group shadow-2xl"
              onClick={() => setStudioName(generateStudioName([]))}
              title="RANDOMIZE DESIGNATION"
              aria-label="RANDOMIZE DESIGNATION"
            >
              <Dices
                className="h-8 w-8 group-hover:rotate-180 transition-transform duration-700"
                strokeWidth={1}
                aria-hidden="true"
              />
            </Button>
          </div>
          <div className="flex justify-end px-2">
            <span className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest italic">
              {studioName.length} / 30 CHARACTER LIMIT
            </span>
          </div>
        </div>

        {/* Archetype Selector */}
        <div className="space-y-10">
          <div className="flex items-center gap-4 px-2">
            <div className="w-2 h-4 bg-secondary shadow-[0_0_10px_rgba(var(--secondary),0.5)]" />
            <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">
              OPERATIONAL ARCHETYPE
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(Object.values(ARCHETYPES) as ArchetypeData[]).map((arch) => (
              <ArchetypeCard
                key={arch.key}
                arch={arch}
                selected={selectedArchetype === arch.key}
                onSelect={setSelectedArchetype}
              />
            ))}
          </div>
        </div>

        {/* Tactical Footer / Launch */}
        <div className="flex flex-col items-center gap-12 pt-10 pb-20">
          <div className="flex justify-center gap-8 w-full max-w-xl">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/" })}
              className="h-16 px-10 text-[10px] font-black uppercase tracking-[0.4em] italic rounded-none border-white/10 bg-white/[0.01] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-700 flex-1"
            >
              ABORT SESSION
            </Button>
            <Button
              onClick={handleLaunch}
              disabled={!studioName.trim() || !selectedArchetype}
              className="h-16 px-16 text-[10px] font-black uppercase tracking-[0.4em] italic rounded-none bg-primary text-black hover:bg-primary/90 shadow-[0_0_30px_rgba(var(--primary),0.2)] flex-[2] group transition-all duration-700 active:scale-95"
            >
              INITIALIZE STUDIO{" "}
              <ArrowRight
                className="ml-4 h-4 w-4 group-hover:translate-x-2 transition-transform"
                strokeWidth={3}
              />
            </Button>
          </div>

          <div className="flex items-center gap-10 opacity-10">
            <div className="w-16 h-px bg-white" />
            <Target className="w-6 h-6" />
            <div className="w-16 h-px bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewGame;

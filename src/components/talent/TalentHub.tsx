import { useState, useMemo } from "react";
import { useGameStore } from "@/store/gameStore";
import { Talent, TalentRole } from "@/engine/types";
import { TalentModal } from "./TalentProfileModal";
import { TalentCard } from "./TalentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users, Star, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";

export const TalentHub = () => {
  const state = useGameStore((s) => s.gameState);
  const talentPool = useMemo(
    () => Object.values(state?.industry.talentPool || {}),
    [state?.industry.talentPool]
  );

  // Roster filters
  const [rosterFilter, setRosterFilter] = useState<TalentRole | "all">("all");

  // SBDB filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const filteredRoster = useMemo(() => {
    return talentPool.filter(
      (t) => rosterFilter === "all" || t.roles.includes(rosterFilter as TalentRole)
    );
  }, [talentPool, rosterFilter]);

  const filteredSBDB = useMemo(() => {
    return talentPool
      .filter((t) => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "all" || t.roles.includes(roleFilter as TalentRole);
        let matchesTier = true;
        if (tierFilter !== "all") {
          const prestige = t.prestige;
          if (tierFilter === "a-list") matchesTier = prestige >= 80;
          else if (tierFilter === "b-list") matchesTier = prestige >= 60 && prestige < 80;
          else if (tierFilter === "rising") matchesTier = prestige >= 40 && prestige < 60;
          else if (tierFilter === "undiscovered") matchesTier = prestige < 40;
        }
        return matchesSearch && matchesRole && matchesTier;
      })
      .sort((a, b) => (b.starMeter || 0) - (a.starMeter || 0));
  }, [talentPool, search, roleFilter, tierFilter]);

  if (!state) return null;

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12 pb-20">
      {/* Executive Talent Header */}
      <div className="flex items-center gap-10 border-b border-white/5 pb-12">
        <div className="w-20 h-20 rounded-none bg-secondary/5 border border-secondary/20 flex items-center justify-center shadow-[0_0_30px_rgba(var(--secondary),0.15)]">
          <Users className="h-10 w-10 text-secondary" strokeWidth={1} />
        </div>
        <div className="space-y-3">
          <h2 className="text-7xl font-display font-black tracking-tighter uppercase italic leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            HUMAN CAPITAL
          </h2>
          <p className="text-[10px] font-black uppercase text-muted-foreground/20 tracking-[0.5em] italic flex items-center gap-4">
            GLOBAL ROSTER
            <span className="w-1.5 h-1.5 bg-white/10" />
            STUDIO STABLE MANAGEMENT
          </p>
        </div>
      </div>

      <Tabs defaultValue="roster" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-fit bg-white/[0.02] border border-white/5 mb-12 p-1 h-16 rounded-none">
          <TabsTrigger
            value="roster"
            className="gap-6 h-14 px-12 font-display font-black uppercase tracking-[0.3em] text-[10px] data-[state=active]:bg-secondary data-[state=active]:text-black transition-all duration-700 rounded-none italic"
          >
            <Star className="h-4 w-4" /> YOUR ROSTER
          </TabsTrigger>
          <TabsTrigger
            value="sbdb"
            className="gap-6 h-14 px-12 font-display font-black uppercase tracking-[0.3em] text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-700 rounded-none italic"
          >
            <Database className="h-4 w-4" /> INDUSTRY SBDB
          </TabsTrigger>
        </TabsList>

        {/* YOUR ROSTER */}
        <TabsContent
          value="roster"
          className="flex-1 flex flex-col overflow-hidden mt-0 outline-none animate-in fade-in duration-1000"
        >
          <div className="flex gap-6 flex-wrap mb-12">
            {(["all", "actor", "director", "writer", "producer"] as (TalentRole | "all")[]).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={rosterFilter === type}
                  onClick={() => setRosterFilter(type)}
                  className={cn(
                    "px-8 h-12 text-[10px] uppercase font-black tracking-[0.3em] border transition-all duration-700 rounded-none italic flex items-center justify-center min-w-[140px]",
                    rosterFilter === type
                      ? "bg-secondary text-black border-secondary shadow-[0_0_30px_rgba(var(--secondary),0.2)]"
                      : "bg-white/[0.02] text-muted-foreground/30 border-white/5 hover:bg-white/[0.05] hover:text-foreground hover:border-white/20"
                  )}
                >
                  {type}
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 overflow-y-auto pb-20 custom-scrollbar pr-6">
            {filteredRoster.map((talent: Talent) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
            {filteredRoster.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  icon={Star}
                  title="ROSTER EMPTY"
                  message="NO TALENT ASSETS ARE CURRENTLY CONTRACTED TO YOUR STUDIO STABLE."
                  className="py-32 bg-transparent border-none shadow-none backdrop-blur-none opacity-20"
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* SBDB DATABASE */}
        <TabsContent
          value="sbdb"
          className="flex-1 flex flex-col overflow-hidden mt-0 outline-none animate-in fade-in duration-1000"
        >
          <div className="glass-card p-10 flex flex-col md:flex-row gap-8 items-center justify-between mb-12 bg-black/40 border border-white/5 rounded-none shadow-2xl">
            <div className="relative w-full md:w-[500px] group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/20 group-focus-within:text-primary transition-all duration-700" />
              <Input
                placeholder="SEARCH GLOBAL DATABASE..."
                className="pl-14 h-14 bg-black/60 border-white/10 focus-visible:border-primary/40 focus-visible:ring-0 text-[10px] font-black uppercase tracking-[0.3em] rounded-none italic"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-6 w-full md:w-auto">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[200px] h-14 bg-black/60 border-white/10 text-[10px] font-black uppercase tracking-[0.3em] rounded-none italic focus:ring-0 focus:border-primary/40 transition-all duration-700">
                  <SelectValue placeholder="ALL ROLES" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 backdrop-blur-3xl border-white/10 rounded-none">
                  <SelectItem
                    value="all"
                    className="text-[10px] font-black uppercase tracking-[0.3em] italic focus:bg-primary focus:text-black"
                  >
                    ALL ROLES
                  </SelectItem>
                  <SelectItem
                    value="actor"
                    className="text-[10px] font-black uppercase tracking-[0.3em] italic focus:bg-primary focus:text-black"
                  >
                    ACTORS
                  </SelectItem>
                  <SelectItem
                    value="director"
                    className="text-[10px] font-black uppercase tracking-[0.3em] italic focus:bg-primary focus:text-black"
                  >
                    DIRECTORS
                  </SelectItem>
                  <SelectItem
                    value="writer"
                    className="text-[10px] font-black uppercase tracking-[0.3em] italic focus:bg-primary focus:text-black"
                  >
                    WRITERS
                  </SelectItem>
                  <SelectItem
                    value="producer"
                    className="text-[10px] font-black uppercase tracking-[0.3em] italic focus:bg-primary focus:text-black"
                  >
                    PRODUCERS
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-[200px] h-14 bg-black/60 border-white/10 text-[10px] font-black uppercase tracking-[0.3em] rounded-none italic focus:ring-0 focus:border-primary/40 transition-all duration-700">
                  <SelectValue placeholder="ALL TIERS" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 backdrop-blur-3xl border-white/10 rounded-none">
                  <SelectItem
                    value="all"
                    className="text-[10px] font-black uppercase tracking-[0.3em] italic focus:bg-primary focus:text-black"
                  >
                    ALL TIERS
                  </SelectItem>
                  <SelectItem
                    value="a-list"
                    className="text-[10px] font-black uppercase tracking-[0.3em] italic focus:bg-primary focus:text-black"
                  >
                    A-LIST (80+)
                  </SelectItem>
                  <SelectItem
                    value="b-list"
                    className="text-[10px] font-black uppercase tracking-[0.3em] italic focus:bg-primary focus:text-black"
                  >
                    B-LIST (60-79)
                  </SelectItem>
                  <SelectItem
                    value="rising"
                    className="text-[10px] font-black uppercase tracking-[0.3em] italic focus:bg-primary focus:text-black"
                  >
                    RISING STAR (40-59)
                  </SelectItem>
                  <SelectItem
                    value="undiscovered"
                    className="text-[10px] font-black uppercase tracking-[0.3em] italic focus:bg-primary focus:text-black"
                  >
                    NEW TALENT (&lt;40)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="flex-1 pr-6 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pb-20">
              {filteredSBDB.map((talent) => (
                <TalentCard key={talent.id} talent={talent} showStarMeter={true} />
              ))}
            </div>
            {filteredSBDB.length === 0 && (
              <div className="py-48 flex flex-col items-center text-center space-y-10 opacity-20">
                <Database className="w-20 h-20 text-muted-foreground" strokeWidth={1} />
                <div className="space-y-4 px-12">
                  <p className="text-sm font-black uppercase tracking-[0.6em] italic">
                    NO RECORDS FOUND
                  </p>
                  <p className="text-xs font-black uppercase tracking-[0.3em] leading-relaxed max-w-[400px]">
                    YOUR SURVEILLANCE FILTERS RETURNED ZERO MATCHES FROM THE INDUSTRY DATABASE.
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      <TalentModal />
    </div>
  );
};

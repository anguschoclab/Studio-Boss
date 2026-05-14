import { useMemo } from "react";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { formatMoney } from "@/engine/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Clapperboard, Trophy, History, Star, MapPin, Calendar } from "lucide-react";
import { TalentAvatar } from "./TalentAvatar";
import { getTalentVisualAge, getCountryFlag } from "@/engine/generators/avatarGenerator";

// Import Tabs
import { BioTab } from "./tabs/BioTab";
import { StatsTab } from "./tabs/StatsTab";
import { KnownForTab } from "./tabs/KnownForTab";
import { FilmographyTab } from "./tabs/FilmographyTab";

/**
 * A comprehensive cinematic modal component for viewing a talent's detailed profile.
 * Displays a cinematic header with demographic badges, star meter, and role information.
 * Organized into tabs for Bio, Market Stats, Top Projects, and Filmography.
 * 
 * Uses game and UI stores to resolve the selected talent and display their data.
 */
export const TalentModal = () => {
  const { selectedTalentId, selectTalent } = useUIStore();
  const gameState = useGameStore((s) => s.gameState);
  const currentWeek = gameState?.week ?? 1;

  const talent = useMemo(
    () => (selectedTalentId ? gameState?.industry.talentPool?.[selectedTalentId] : null),
    [gameState?.industry.talentPool, selectedTalentId]
  );

  const talentPool = useMemo(
    () => Object.values(gameState?.industry.talentPool || {}),
    [gameState?.industry.talentPool]
  );

  const agencies = useMemo(
    () => gameState?.industry.agencies || [],
    [gameState?.industry.agencies]
  );
  const agents = useMemo(() => gameState?.industry.agents || [], [gameState?.industry.agents]);
  const agency = useMemo(() => agencies.find((a) => a.id === talent?.agencyId), [agencies, talent]);
  const agent = useMemo(() => agents.find((a) => a.id === talent?.agentId), [agents, talent]);

  const families = useMemo(
    () => gameState?.industry.families || [],
    [gameState?.industry.families]
  );
  const family = useMemo(() => families.find((f) => f.id === talent?.familyId), [families, talent]);

  // Find family members for nepo-baby display
  const familyMembers = useMemo(() => {
    if (!talent?.familyId) return [];
    return talentPool.filter((t) => t.familyId === talent.familyId && t.id !== talent.id);
  }, [talentPool, talent]);

  const statData = useMemo(() => {
    if (!talent) return [];
    return [
      { name: "Prestige", value: talent.prestige, color: "#fbbf24" },
      { name: "Draw", value: talent.draw, color: "#3b82f6" },
      { name: "Star Meter", value: talent.starMeter || 50, color: "#8b5cf6" },
      { name: "Ego", value: talent.psychology?.ego || 50, color: "#ef4444" },
    ];
  }, [talent]);

  if (!talent) return null;

  const visualAge = getTalentVisualAge(talent, currentWeek);
  const countryFlag = getCountryFlag(talent.demographics.country);
  const genderLabel =
    talent.demographics.gender === "MALE"
      ? "Male"
      : talent.demographics.gender === "FEMALE"
        ? "Female"
        : "Non-Binary";

  return (
    <Dialog open={!!selectedTalentId} onOpenChange={() => selectTalent(null)}>
      <DialogContent className="max-w-4xl bg-black border-white/5 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[90vh] p-0 rounded-none">
        {/* Cinematic Header Section */}
        <div className="relative h-72 bg-black/60 shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-rose-500/10" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30" />

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />

          <div className="absolute bottom-6 left-10 flex items-end gap-8 z-10 w-full pr-20">
            {/* Avatar replaces the old placeholder icon */}
            <div className="relative group">
              <TalentAvatar
                talent={talent}
                size="xl"
                className="border-slate-950 shadow-2xl group-hover:border-primary/30 transition-all duration-500"
              />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                <Badge className="text-[10px] bg-primary text-black font-black uppercase tracking-widest px-3 py-1 shadow-[0_4px_10px_rgba(var(--primary),0.4)]">
                  {talent.roles[0]}
                </Badge>
              </div>
            </div>

            <div className="flex-1 pb-2">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic drop-shadow-2xl">
                  {talent.name}
                </h2>
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-none border border-white/10 shadow-xl">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-xl font-black text-primary italic leading-none">
                    {talent.starMeter || 50}
                  </span>
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">
                    Star Meter
                  </span>
                </div>
              </div>

              {/* Demographics Row */}
              <div className="flex gap-2 flex-wrap mb-2">
                <Badge
                  variant="outline"
                  className="text-[10px] border-white/10 bg-white/5 text-slate-300 font-bold uppercase tracking-widest px-2.5 py-1 gap-1.5"
                >
                  <Calendar className="w-3 h-3 opacity-60" />
                  {visualAge} years old
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] border-white/10 bg-white/5 text-slate-300 font-bold uppercase tracking-widest px-2.5 py-1"
                >
                  {genderLabel}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] border-white/10 bg-white/5 text-slate-300 font-bold uppercase tracking-widest px-2.5 py-1"
                >
                  {talent.demographics.ethnicity}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] border-white/10 bg-white/5 text-slate-300 font-bold uppercase tracking-widest px-2.5 py-1 gap-1"
                >
                  <MapPin className="w-3 h-3 opacity-60" />
                  {countryFlag} {talent.demographics.country}
                </Badge>
              </div>

              <div className="flex gap-3">
                {talent.roles.map((r) => (
                  <Badge
                    key={r}
                    variant="outline"
                    className="text-[10px] border-white/10 bg-white/5 text-slate-300 font-black uppercase tracking-widest px-3 py-1"
                  >
                    {r}
                  </Badge>
                ))}
                <Badge
                  variant="outline"
                  className="text-[10px] border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-black uppercase tracking-widest px-3 py-1 ml-auto mr-10"
                >
                  {formatMoney(talent.fee)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pt-8 pb-10 custom-scrollbar">
          <Tabs defaultValue="bio" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-black/40 p-1.5 border border-white/5/50 rounded-none mb-10 shadow-inner">
              <TabsTrigger
                value="bio"
                className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-black uppercase text-[11px] font-black tracking-widest transition-all duration-300"
              >
                <History className="h-4 w-4 mr-2" /> Bio & Trivia
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-black uppercase text-[11px] font-black tracking-widest transition-all duration-300"
              >
                <BarChart3 className="h-4 w-4 mr-2" /> Market Stats
              </TabsTrigger>
              <TabsTrigger
                value="knownFor"
                className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-black uppercase text-[11px] font-black tracking-widest transition-all duration-300"
              >
                <Trophy className="h-4 w-4 mr-2" /> Top Projects
              </TabsTrigger>
              <TabsTrigger
                value="filmography"
                className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-black uppercase text-[11px] font-black tracking-widest transition-all duration-300"
              >
                <Clapperboard className="h-4 w-4 mr-2" /> Filmography
              </TabsTrigger>
            </TabsList>

            <BioTab
              talent={talent}
              agency={agency}
              agent={agent}
              family={family}
              familyMembers={familyMembers}
              selectTalent={selectTalent}
            />

            <StatsTab talent={talent} statData={statData} />

            <KnownForTab talent={talent} />

            <FilmographyTab talent={talent} />
          </Tabs>
        </div>

        {/* Footer Action Bar */}
        <div className="px-10 py-8 bg-black/90 border-t border-slate-900 flex justify-between items-center shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
              RECORD ID
            </p>
            <p className="text-xs font-mono text-slate-300 opacity-50">{talent.id}</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => selectTalent(null)}
              className="px-12 py-3 bg-white text-black font-black uppercase text-xs rounded-none hover:bg-primary transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              Close Profile
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

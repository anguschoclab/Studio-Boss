import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { selectTalentPool } from '@/store/selectors';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Clapperboard,
  Trophy,
  Briefcase,
  Star,
  MapPin,
  Calendar,
  History
} from 'lucide-react';
import { TalentAvatar } from './TalentAvatar';
import { getTalentVisualAge, getCountryFlag } from '@/engine/generators/avatarGenerator';
import { TalentBioTab } from './tabs/TalentBioTab';
import { TalentStatsTab } from './tabs/TalentStatsTab';
import { TalentKnownForTab } from './tabs/TalentKnownForTab';
import { TalentFilmographyTab } from './tabs/TalentFilmographyTab';
import { TalentScheduleTab } from './tabs/TalentScheduleTab';

export const TalentModal = () => {
  const { selectedTalentId, selectTalent } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const currentWeek = gameState?.week ?? 1;
  
  const talentPool = useMemo(() => selectTalentPool(gameState), [gameState?.entities?.talents]);
  const talent = useMemo(() => talentPool.find(t => t.id === selectedTalentId), [talentPool, selectedTalentId]);
  
  const agencies = useMemo(() => gameState?.industry.agencies || [], [gameState?.industry.agencies]);
  const agents = useMemo(() => gameState?.industry.agents || [], [gameState?.industry.agents]);
  const agency = useMemo(() => agencies.find(a => a.id === talent?.agencyId), [agencies, talent]);
  const agent = useMemo(() => agents.find(a => a.id === talent?.agentId), [agents, talent]);
  
  const families = useMemo(() => gameState?.industry.families || [], [gameState?.industry.families]);
  const family = useMemo(() => families.find(f => f.id === talent?.familyId), [families, talent]);

  // Find family members for nepo-baby display
  const familyMembers = useMemo(() => {
    if (!talent?.familyId) return [];
    return talentPool.filter(t => t.familyId === talent.familyId && t.id !== talent.id);
  }, [talentPool, talent]);

  const statData = useMemo(() => {
    if (!talent) return [];
    return [
      { name: 'Prestige', value: talent.prestige, color: '#fbbf24' },
      { name: 'Draw', value: talent.draw, color: '#3b82f6' },
      { name: 'Star Meter', value: talent.starMeter || 50, color: '#8b5cf6' },
      { name: 'Ego', value: talent.psychology?.ego || 50, color: '#ef4444' }
    ];
  }, [talent]);

  if (!talent) return null;

  const visualAge = getTalentVisualAge(talent, currentWeek);
  const countryFlag = getCountryFlag(talent.demographics.country);
  const genderLabel = talent.demographics.gender === 'MALE' ? 'Male' : talent.demographics.gender === 'FEMALE' ? 'Female' : 'Non-Binary';

  return (
    <Dialog open={!!selectedTalentId} onOpenChange={() => selectTalent(null)}>
      <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[90vh] p-0 rounded-3xl">
        {/* Cinematic Header Section */}
        <div className="relative h-72 bg-slate-900 shrink-0 overflow-hidden">
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
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span className="text-xl font-black text-primary italic leading-none">{talent.starMeter || 50}</span>
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Star Meter</span>
                  </div>
                  {talent.contractId && (
                    <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                      <Briefcase className="w-3 h-3 text-rose-400" />
                      <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Exclusive Pact</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Condition Row */}
              <div className="flex gap-2 mb-4">
                <div className="flex flex-col gap-1 grow">
                  <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase tracking-widest px-1">
                    <span>Performance Fatigue</span>
                    <span className={talent.fatigue > 70 ? 'text-rose-400' : 'text-slate-400'}>{talent.fatigue}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        talent.fatigue > 70 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 
                        talent.fatigue > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${talent.fatigue}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Demographics Row */}
              <div className="flex gap-2 flex-wrap mb-2">
                <Badge variant="outline" className="text-[10px] border-white/10 bg-white/5 text-slate-300 font-bold uppercase tracking-widest px-2.5 py-1 gap-1.5">
                  <Calendar className="w-3 h-3 opacity-60" />
                  {visualAge} years old
                </Badge>
                <Badge variant="outline" className="text-[10px] border-white/10 bg-white/5 text-slate-300 font-bold uppercase tracking-widest px-2.5 py-1">
                  {genderLabel}
                </Badge>
                <Badge variant="outline" className="text-[10px] border-white/10 bg-white/5 text-slate-300 font-bold uppercase tracking-widest px-2.5 py-1">
                  {talent.demographics.ethnicity}
                </Badge>
                <Badge variant="outline" className="text-[10px] border-white/10 bg-white/5 text-slate-300 font-bold uppercase tracking-widest px-2.5 py-1 gap-1">
                  <MapPin className="w-3 h-3 opacity-60" />
                  {countryFlag} {talent.demographics.country}
                </Badge>
              </div>
              
              <div className="flex gap-3">
                {talent.roles.map(r => (
                  <Badge key={r} variant="outline" className="text-[10px] border-white/10 bg-white/5 text-slate-300 font-black uppercase tracking-widest px-3 py-1">
                    {r}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-black uppercase tracking-widest px-3 py-1 ml-auto mr-10">
                  {formatMoney(talent.fee)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pt-8 pb-10 custom-scrollbar">
          <Tabs defaultValue="bio" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-900/40 p-1.5 border border-slate-800/50 rounded-2xl mb-10 shadow-inner">
              <TabsTrigger value="bio" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black uppercase text-[11px] font-black tracking-widest transition-all duration-300">
                <History className="h-4 w-4 mr-2" /> Bio & Trivia
              </TabsTrigger>
              <TabsTrigger value="stats" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black uppercase text-[11px] font-black tracking-widest transition-all duration-300">
                <BarChart3 className="h-4 w-4 mr-2" /> Career Stats
              </TabsTrigger>
              <TabsTrigger value="knownFor" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black uppercase text-[11px] font-black tracking-widest transition-all duration-300">
                <Trophy className="h-4 w-4 mr-2" /> Top Projects
              </TabsTrigger>
              <TabsTrigger value="filmography" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black uppercase text-[11px] font-black tracking-widest transition-all duration-300">
                <Clapperboard className="h-4 w-4 mr-2" /> Filmography
              </TabsTrigger>
              <TabsTrigger value="schedule" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black uppercase text-[11px] font-black tracking-widest transition-all duration-300">
                <Calendar className="h-4 w-4 mr-2" /> Schedule
              </TabsTrigger>
            </TabsList>

            <TalentBioTab
              talent={talent}
              agency={agency}
              agent={agent}
              family={family}
              familyMembers={familyMembers}
              onSelectTalent={selectTalent}
            />

            <TalentStatsTab talent={talent} statData={statData} />

            <TalentKnownForTab talent={talent} />

            <TalentFilmographyTab talent={talent} />

            <TalentScheduleTab talent={talent} currentWeek={currentWeek} />

          </Tabs>
        </div>

        {/* Footer Action Bar */}
        <div className="px-10 py-8 bg-slate-950/90 border-t border-slate-900 flex justify-between items-center shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
           <div className="flex flex-col">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">RECORD ID</p>
              <p className="text-xs font-mono text-slate-300 opacity-50">{talent.id}</p>
           </div>
           
           <div className="flex gap-4">
              <button 
                onClick={() => selectTalent(null)}
                className="px-12 py-3 bg-white text-black font-black uppercase text-xs rounded-2xl hover:bg-primary transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                Close Profile
              </button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Quote = (props: any) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 7.55228 14.017 7V5C14.017 4.44772 14.4647 4 15.017 4H19.017C20.1216 4 21.017 4.89543 21.017 6V15C21.017 18.3137 18.3307 21 15.017 21H14.017ZM3 21L3 18C3 16.8954 3.89543 16 5 16H8C8.55228 16 9 15.5523 9 15V9C9 8.44772 8.55228 8 8 8H4C3.44772 8 3 7.55228 3 7V5C3 4.44772 3.44772 4 4 4H8C9.10457 4 10 4.89543 10 6V15C10 18.3137 7.31371 21 4 21H3Z" />
  </svg>
);

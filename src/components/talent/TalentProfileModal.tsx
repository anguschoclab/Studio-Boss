import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  BarChart3, 
  Clapperboard, 
  Trophy, 
  Briefcase,
  Heart,
  TrendingUp,
  DollarSign,
  History,
  Star,
  Award,
  Zap,
  Info,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { TalentAvatar } from './TalentAvatar';
import { getTalentVisualAge, getCountryFlag } from '@/engine/generators/avatarGenerator';

export const TalentModal = () => {
  const { selectedTalentId, selectTalent } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const currentWeek = gameState?.week ?? 1;
  
  const talentPool = useMemo(() => Object.values(gameState?.industry.talentPool || {}), [gameState?.industry.talentPool]);
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
            </TabsList>

            {/* BIO & TRIVIA TAB */}
            <TabsContent value="bio" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 focus-visible:outline-none">
              <div className="grid grid-cols-5 gap-8">
                <div className="col-span-3 space-y-8">
                   <div className="glass-panel p-8 rounded-3xl relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Quote className="w-20 h-20" />
                      </div>
                      <h4 className="text-[11px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Info className="h-4 w-4" /> Biography
                      </h4>
                      <p className="text-base text-slate-300 leading-relaxed font-medium italic drop-shadow-sm">
                        {talent.bio}
                      </p>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-2 pl-2">
                        <Zap className="h-4 w-4" /> DID YOU KNOW?
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {talent.trivia?.map((t, i) => (
                          <div key={i} className="bg-slate-900/30 p-5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all duration-300 flex gap-4">
                            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                               <span className="text-[10px] font-black text-primary">{i+1}</span>
                            </div>
                            <p className="text-sm text-slate-300 font-medium">{t}</p>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="col-span-2 space-y-6">
                  <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 space-y-4 shadow-xl">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> Representation
                    </h4>
                    {agency ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Agency</p>
                          <p className="font-black text-white text-lg tracking-tight uppercase italic">{agency.name}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="text-[9px] h-5 bg-primary/20 text-primary border-primary/20 uppercase font-black">{agency.tier}</Badge>
                            <Badge variant="secondary" className="text-[9px] h-5 bg-slate-800 text-slate-400 uppercase font-black">{agency.culture}</Badge>
                          </div>
                        </div>
                        {talent.contractId && (
                           <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                              <p className="text-[10px] font-bold text-rose-500/60 uppercase tracking-widest mb-1">Exclusive Pact</p>
                              <p className="text-xs font-black text-rose-400 uppercase italic">Active Industry Tie-up</p>
                              <p className="text-[9px] text-rose-400/60 font-bold mt-1 uppercase">Limited availability for outside projects</p>
                           </div>
                        )}
                        {agent && (
                          <div className="pl-2">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Primary Agent</p>
                            <p className="font-bold text-slate-200">{agent.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Specialty: {agent.specialty.replace('_', ' ')}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-2xl">
                        <p className="text-xs italic text-slate-500 font-bold uppercase tracking-widest opacity-40">Unrepresented</p>
                      </div>
                    )}
                  </div>

                  {family && (
                    <div className="bg-amber-500/5 p-6 border border-amber-500/10 rounded-3xl shadow-xl">
                      <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Heart className="h-4 w-4" /> Industry Heritage
                      </h4>
                      <div className="flex items-center gap-4 mb-4">
                         <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-black text-amber-500 text-2xl tracking-tighter">
                            {family.name[0]}
                         </div>
                         <div>
                            <p className="text-xs font-black text-amber-500 uppercase tracking-widest">The {family.name} Family</p>
                            <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-400/80 uppercase px-2 py-0 h-4 mt-1">{family.status}</Badge>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                         <div className="bg-amber-950/20 p-2 rounded-xl text-center border border-amber-500/10">
                            <p className="text-[8px] font-black text-amber-500/60 uppercase">Prestige</p>
                            <p className="text-sm font-black text-amber-200">{family.prestigeLegacy}</p>
                         </div>
                         <div className="bg-amber-950/20 p-2 rounded-xl text-center border border-amber-500/10">
                            <p className="text-[8px] font-black text-amber-500/60 uppercase">Recognition</p>
                            <p className="text-sm font-black text-amber-200">{family.recognition}</p>
                         </div>
                      </div>

                      {/* Family Members with Avatars */}
                      {familyMembers.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-amber-500/10">
                          <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> Family Members
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {familyMembers.slice(0, 4).map(member => (
                              <div 
                                key={member.id} 
                                role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTalent(member.id); } }} className="flex items-center gap-2 bg-amber-950/30 px-2 py-1.5 rounded-xl border border-amber-500/10 hover:border-amber-500/30 transition-colors cursor-pointer text-left"
                                onClick={() => selectTalent(member.id)}
                              >
                                <TalentAvatar talent={member} size="xs" className="border-amber-500/20" />
                                <div>
                                  <p className="text-[10px] font-bold text-amber-200 leading-tight">{member.name}</p>
                                  <p className="text-[8px] font-bold text-amber-500/50 uppercase">{member.roles[0]}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-amber-200/40 leading-relaxed font-bold uppercase tracking-tight mt-3">
                        A recognized lineage in the Hollywood hierarchy. Transitioning from {family.status} status.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* STATS TAB */}
            <TabsContent value="stats" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 focus-visible:outline-none">
               <div className="grid grid-cols-2 gap-8">
                  <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 shadow-2xl h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                       <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Market Metric Distribution</h4>
                       <Star className="w-4 h-4 text-primary opacity-30" />
                    </div>
                    <div className="flex-1 pb-4">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={statData} layout="vertical" margin={{ left: -10, right: 20 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" horizontal={false} />
                           <XAxis type="number" hide domain={[0, 100]} />
                           <YAxis 
                             dataKey="name" 
                             type="category" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{fontSize: 11, fontWeight: '900', fill: '#94a3b8', textAnchor: 'start', dx: 10}}
                             width={100}
                           />
                           <Tooltip 
                            cursor={{fill: '#ffffff05'}}
                            contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                            itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                            labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', fontWeight: '900' }}
                           />
                           <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={26}>
                             {statData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                           </Bar>
                         </BarChart>
                       </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 shadow-xl flex flex-col items-center text-center">
                        <div className="relative mb-6">
                           <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-white/10 flex items-center justify-center font-black text-4xl text-white shadow-[0_0_30px_rgba(var(--primary),0.2)]">
                              {talent.draw}
                           </div>
                           <div className="absolute -bottom-2 -right-2 bg-primary text-black text-[10px] font-black px-2 py-1 rounded-lg border-2 border-slate-950">
                              DRAW
                           </div>
                        </div>
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Box Office Leverage</h4>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-tight">
                          Currently commands a baseline {talent.draw >= 70 ? 'Blockbuster' : talent.draw >= 40 ? 'Moderate' : 'Niche'} theatrical draw momentum.
                        </p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-500/5 p-6 border border-emerald-500/10 rounded-2xl text-center">
                           <DollarSign className="w-5 h-5 text-emerald-500 mx-auto mb-2 opacity-50" />
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Career Gross</p>
                           <p className="text-xl font-black text-emerald-400 mt-1">{formatMoney(talent.careerGross || 0)}</p>
                        </div>
                        <div className="bg-indigo-500/5 p-6 border border-indigo-500/10 rounded-2xl text-center">
                           <TrendingUp className="w-5 h-5 text-indigo-500 mx-auto mb-2 opacity-50" />
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Star Meter</p>
                           <p className="text-xl font-black text-indigo-400 mt-1">{talent.starMeter || 50}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </TabsContent>

            {/* KNOWN FOR TAB */}
            <TabsContent value="knownFor" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 focus-visible:outline-none">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {talent.knownFor?.map((title, i) => (
                    <div key={i} className="group relative glass-panel p-8 rounded-3xl hover:border-primary/40 transition-all duration-500 text-center overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                         <Star className="w-20 h-20" />
                      </div>
                      <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-black transition-all duration-300">
                         <span className="font-black italic text-xl">#</span>
                      </div>
                      <h4 className="text-2xl font-black tracking-tighter text-white uppercase italic truncate mb-2">{title}</h4>
                      <Badge className="bg-slate-800 text-slate-400 border-slate-700 uppercase text-[10px] font-black">LEGACY HIT</Badge>
                    </div>
                  ))}
                  {(!talent.knownFor || talent.knownFor.length === 0) && (
                    <div className="col-span-3 py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                       <p className="text-slate-500 font-black uppercase tracking-widest italic opacity-40">No Significant Hits Recorded</p>
                    </div>
                  )}
               </div>
               
               <div className="grid grid-cols-2 gap-6 mt-4">
                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Highest Movie Payday</h5>
                    {talent.highestSalaryMovie ? (
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="font-black text-white italic">{talent.highestSalaryMovie.project}</p>
                            <p className="text-[10px] text-slate-500 font-bold">{talent.highestSalaryMovie.year}</p>
                         </div>
                         <p className="text-2xl font-black text-emerald-400">{formatMoney(talent.highestSalaryMovie.amount)}</p>
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-600">No data recorded</p>
                    )}
                  </div>
                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Highest TV Payday</h5>
                    {talent.highestSalaryTv ? (
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="font-black text-white italic">{talent.highestSalaryTv.project}</p>
                            <p className="text-[10px] text-slate-500 font-bold">{talent.highestSalaryTv.year}</p>
                         </div>
                         <p className="text-2xl font-black text-indigo-400">{formatMoney(talent.highestSalaryTv.amount)}</p>
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-600">No data recorded</p>
                    )}
                  </div>
               </div>
            </TabsContent>

            {/* FILMOGRAPHY TAB */}
            <TabsContent value="filmography" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 focus-visible:outline-none">
              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-800">
                      <th className="px-8 py-5 font-black uppercase tracking-widest text-slate-500 text-[10px]">Year</th>
                      <th className="px-8 py-5 font-black uppercase tracking-widest text-slate-500 text-[10px]">Title</th>
                      <th className="px-8 py-5 font-black uppercase tracking-widest text-slate-500 text-[10px]">Format</th>
                      <th className="px-8 py-5 font-black uppercase tracking-widest text-slate-500 text-[10px]">Role</th>
                      <th className="px-8 py-5 font-black uppercase tracking-widest text-slate-500 text-[10px] text-right">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/30">
                    {talent.filmography?.map((f, i) => (
                      <tr key={i} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-8 py-5 text-slate-500 font-mono text-xs">{f.year}</td>
                        <td className="px-8 py-5">
                           <p className="font-black text-white uppercase italic tracking-tight text-base group-hover:text-primary transition-colors">{f.title}</p>
                        </td>
                        <td className="px-8 py-5">
                          <Badge variant="outline" className="text-[9px] border-slate-800 bg-slate-900 text-slate-400 font-black uppercase tracking-widest px-2 py-0.5">
                            {f.type === 'movie' ? 'Film' : 'TV'}
                          </Badge>
                        </td>
                        <td className="px-8 py-5">
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{f.role}</span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex flex-col">
                            <span className="font-black text-emerald-500 italic text-sm">{f.type === 'movie' ? formatMoney(f.gross) : 'N/A'}</span>
                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Pay: {formatMoney(f.salary)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
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

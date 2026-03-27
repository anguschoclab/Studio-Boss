import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Star
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

export const TalentDetailModal = () => {
  const { selectedTalentId, selectTalent } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  
  const talentPool = useMemo(() => gameState?.industry.talentPool || [], [gameState?.industry.talentPool]);
  const talent = useMemo(() => talentPool.find(t => t.id === selectedTalentId), [talentPool, selectedTalentId]);
  
  const agencies = useMemo(() => gameState?.industry.agencies || [], [gameState?.industry.agencies]);
  const agents = useMemo(() => gameState?.industry.agents || [], [gameState?.industry.agents]);
  const agency = useMemo(() => agencies.find(a => a.id === talent?.agencyId), [agencies, talent]);
  const agent = useMemo(() => agents.find(a => a.id === talent?.agentId), [agents, talent]);
  
  const families = useMemo(() => gameState?.industry.families || [], [gameState?.industry.families]);
  const family = useMemo(() => families.find(f => f.id === talent?.familyId), [families, talent]);

  const topGrossingFilm = useMemo(() => {
    if (!talent?.filmography) return null;
    return [...talent.filmography]
      .filter(f => f.type === 'movie')
      .sort((a, b) => (b.gross || 0) - (a.gross || 0))[0];
  }, [talent]);

  const topMovieSalary = useMemo(() => {
    if (!talent?.filmography) return null;
    return [...talent.filmography]
      .filter(f => f.type === 'movie')
      .sort((a, b) => b.salary - a.salary)[0];
  }, [talent]);

  const topTVSalary = useMemo(() => {
    if (!talent?.filmography) return null;
    return [...talent.filmography]
      .filter(f => f.type === 'tv')
      .sort((a, b) => b.salary - a.salary)[0];
  }, [talent]);

  const statData = useMemo(() => {
    if (!talent) return [];
    return [
      { name: 'Prestige', value: talent.prestige, color: '#fbbf24' },
      { name: 'Draw', value: talent.draw, color: '#3b82f6' },
      { name: 'Ego', value: talent.ego || 50, color: '#ef4444' },
      { name: 'Loyalty', value: talent.loyalty || 50, color: '#10b981' }
    ];
  }, [talent]);

  if (!talent) return null;

  return (
    <Dialog open={!!selectedTalentId} onOpenChange={() => selectTalent(null)}>
      <DialogContent className="max-w-3xl bg-slate-950 border-slate-800 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[85vh] p-0">
        {/* Header Section */}
        <div className="relative h-48 bg-gradient-to-br from-slate-900 to-slate-950 border-b border-slate-800 shrink-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute bottom-[-40px] left-8 w-32 h-32 rounded-2xl bg-slate-800 border-4 border-slate-950 shadow-2xl overflow-hidden flex items-center justify-center group">
            <User className="w-16 h-16 text-slate-600 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
               <Badge className="text-[8px] bg-primary text-black font-black uppercase tracking-widest">{talent.gender === 'male' ? 'Actor' : 'Actress'}</Badge>
            </div>
          </div>
          
          <div className="absolute bottom-4 left-44 right-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic drop-shadow-lg">{talent.name}</h2>
                <div className="flex gap-2 mt-1">
                  {talent.roles.map(r => (
                    <Badge key={r} variant="outline" className="text-[10px] border-slate-700 text-slate-400 font-bold uppercase tracking-widest">{r}</Badge>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Market Value</p>
                <p className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">{formatMoney(talent.fee)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pt-12 pb-8 custom-scrollbar">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-900/50 p-1 border border-slate-800 rounded-lg mb-8">
              <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest"><User className="h-3 w-3 mr-2" /> Bio</TabsTrigger>
              <TabsTrigger value="filmography" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest"><Clapperboard className="h-3 w-3 mr-2" /> Credits</TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest"><TrendingUp className="h-3 w-3 mr-2" /> Stats</TabsTrigger>
              <TabsTrigger value="trivia" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest"><Star className="h-3 w-3 mr-2" /> Trivia</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6 focus-visible:outline-none">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                   <div className="bg-slate-900/40 p-6 border border-slate-800 rounded-2xl">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <History className="h-3 w-3" /> Biography
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        {talent.bio}
                      </p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-2xl flex flex-col justify-center">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Career Gross</span>
                        <span className="text-xl font-black text-white">{formatMoney(talent.careerGross || 0)}</span>
                        {topGrossingFilm && (
                          <span className="text-[8px] text-emerald-500 uppercase font-bold truncate">Top Hit: {topGrossingFilm.title}</span>
                        )}
                      </div>
                      <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-2xl flex flex-col justify-center gap-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Record Salaries</span>
                        <div className="space-y-1">
                          {topMovieSalary && (
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-500 font-bold uppercase tracking-tighter">Film</span>
                              <span className="text-white font-black">{formatMoney(topMovieSalary.salary)}</span>
                            </div>
                          )}
                          {topTVSalary && (
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-500 font-bold uppercase tracking-tighter">TV</span>
                              <span className="text-white font-black">{formatMoney(topTVSalary.salary)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-900/60 p-5 border border-slate-800 rounded-2xl space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Briefcase className="h-3 w-3" /> Representation
                    </h4>
                    {agency ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase font-sans">Agency</p>
                          <p className="font-black text-white text-sm">{agency.name}</p>
                          <Badge variant="secondary" className="text-[8px] h-4 mt-1 bg-slate-800 text-slate-400 capitalize">{agency.tier}</Badge>
                        </div>
                        {agent && (
                          <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase font-sans">Agent</p>
                            <p className="font-bold text-slate-200 text-xs">{agent.name}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-500">Unrepresented</p>
                    )}
                  </div>

                  {family && (
                    <div className="bg-amber-950/20 p-5 border border-amber-500/20 rounded-2xl">
                      <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Heart className="h-3 w-3" /> Legacy
                      </h4>
                      <p className="text-xs font-bold text-amber-200/80 mb-1">{family.name} Dynasty</p>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        Part of a {family.status} lineage in Hollywood with a prestige level of {family.prestigeLegacy}.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* FILMOGRAPHY TAB */}
            <TabsContent value="filmography" className="space-y-4 focus-visible:outline-none">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800">
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-slate-500 text-[10px]">Year</th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-slate-500 text-[10px]">Title</th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-slate-500 text-[10px]">Format</th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-slate-500 text-[10px]">Role</th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-slate-500 text-[10px] text-right">Box Office / Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {talent.filmography?.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-slate-400 font-mono">{f.year}</td>
                        <td className="px-6 py-4 font-bold text-slate-100">{f.title}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-[9px] border-slate-700 bg-slate-950 text-slate-400 capitalize">{f.type === 'movie' ? 'Film' : 'TV Series'}</Badge>
                        </td>
                        <td className="px-6 py-4 capitalize text-slate-400">{f.role}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col">
                            <span className="font-bold text-emerald-500">{f.type === 'movie' ? formatMoney(f.gross) : 'N/A'}</span>
                            <span className="text-[9px] text-slate-500">Salary: {formatMoney(f.salary)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* STATS TAB */}
            <TabsContent value="stats" className="space-y-6 focus-visible:outline-none">
               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-900/40 p-6 border border-slate-800 rounded-2xl h-[300px]">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Career Metrics Correlation</h4>
                    <div className="w-full h-full pb-8">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={statData} layout="vertical" margin={{ left: -10, right: 20 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <XAxis type="number" hide domain={[0, 100]} />
                           <YAxis 
                             dataKey="name" 
                             type="category" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                           />
                           <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                            itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                           />
                           <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                             {statData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                           </Bar>
                         </BarChart>
                       </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div className="bg-slate-900/40 p-6 border border-slate-800 rounded-2xl">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Temperament Profile</h4>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-white shadow-inner">
                              {talent.temperament.charAt(0)}
                           </div>
                           <div>
                              <p className="font-black text-white uppercase">{talent.temperament}</p>
                              <p className="text-xs text-slate-400">Behavior Score: {100 - (talent.ego || 50)}/100 Reliability</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-slate-900/40 p-6 border border-slate-800 rounded-2xl">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Active Perks & Quirks</h4>
                        <div className="flex flex-wrap gap-2">
                           {talent.perks?.length ? talent.perks.map(p => (
                             <Badge key={p} className="bg-blue-600/20 text-blue-400 border-blue-500/30 text-[9px] py-1 px-2">{p}</Badge>
                           )) : (
                             <span className="text-xs text-slate-500 italic">No standout perks or quirks</span>
                           )}
                           {talent.hasRazzie && (
                             <Badge className="bg-pink-600/20 text-pink-400 border-pink-500/30 text-[9px] py-1 px-2 uppercase font-black">Razzie Veteran</Badge>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </TabsContent>

            {/* TRIVIA TAB */}
            <TabsContent value="trivia" className="space-y-4 focus-visible:outline-none">
               <div className="grid grid-cols-1 gap-4">
                  {talent.trivia?.map((t, i) => (
                    <div key={i} className="group relative bg-slate-900/40 p-6 border border-slate-800 rounded-2xl hover:border-primary/30 transition-all duration-300">
                      <div className="absolute top-4 left-[-4px] w-1 h-8 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex gap-4">
                        <div className="text-primary font-serif italic text-2xl opacity-50">"</div>
                        <p className="text-slate-300 font-medium leading-relaxed italic pr-4">{t}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Action Bar */}
        <div className="p-6 bg-slate-900/80 border-t border-slate-800 flex justify-end gap-3 shrink-0">
           <Badge variant="outline" className="mr-auto self-center text-xs border-slate-700 text-slate-500 uppercase font-black">ID: {talent.id.split('-')[1]}</Badge>
           <button 
             onClick={() => selectTalent(null)}
             className="px-6 py-2 bg-slate-100 text-slate-950 font-black uppercase text-xs rounded-full hover:bg-white transition-colors"
           >
             Close File
           </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

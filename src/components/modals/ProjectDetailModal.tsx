import { useMemo, useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { evaluateGreenlight } from '@/engine/systems/greenlight';
import { FESTIVALS } from '@/engine/systems/festivals';
import { AwardBody } from '@/engine/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  Clapperboard, 
  Trophy, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  AlertCircle,
  Megaphone,
  Package,
  ShieldAlert
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const MARKETING_ANGLES = [
  { id: 'romance', label: 'Romance & Heart' },
  { id: 'spectacle', label: 'Visual Spectacle' },
  { id: 'thrills', label: 'Action & Thrills' },
  { id: 'humor', label: 'Comedy & Fun' },
  { id: 'prestige', label: 'Prestige & Awards' },
  { id: 'mystery', label: 'Mystery & Intrigue' }
];

export const ProjectDetailModal = () => {
  const [marketingBudget, setMarketingBudget] = useState(0);
  const [domesticSplit, setDomesticSplit] = useState(50);
  const [marketingAngle, setMarketingAngle] = useState('spectacle');
  const [selectedTier, setSelectedTier] = useState<'none' | 'basic' | 'blockbuster'>('none');

  const { selectedProjectId, selectProject } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const signContract = useGameStore(s => s.signContract);
  const renewProject = useGameStore(s => s.renewProject);
  const greenlightProject = useGameStore(s => s.greenlightProject);
  const exploitFranchise = useGameStore(s => s.exploitFranchise);
  const lockMarketingCampaign = useGameStore(s => s.lockMarketingCampaign);
  const submitToFestival = useGameStore(s => s.submitToFestival);
  const launchAwardsCampaign = useGameStore(s => s.launchAwardsCampaign);

  const projects = useMemo(() => Object.values(gameState?.studio.internal.projects || {}), [gameState?.studio.internal.projects]);
  const project = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
  const talentPool = useMemo(() => Object.values(gameState?.industry.talentPool || {}), [gameState?.industry.talentPool]);
  const contracts = useMemo(() => gameState?.studio.internal.contracts || [], [gameState?.studio.internal.contracts]);
  const talentMap = useMemo(() => new Map(talentPool.map(t => [t.id, t])), [talentPool]);

  const talentByRole = useMemo(() => {
    const map = new Map<string, import('@/engine/types').Talent[]>();
    const rolesToTrack = ['director', 'actor', 'writer', 'producer'];
    for (const r of rolesToTrack) {
      map.set(r, []);
    }
    for (const t of talentPool) {
      for (const r of t.roles) {
        const arr = map.get(r);
        if (arr) {
          arr.push(t);
        }
      }
    }
    return map;
  }, [talentPool]);

  const tier = project ? BUDGET_TIERS[project.budgetTier] : null;

  const roleGroups = useMemo(() => {
    const groups = new Map<string, { attached: import('@/engine/types').Talent[], available: import('@/engine/types').Talent[] }>();
    const rolesToTrack = ['director', 'actor', 'writer', 'producer'];

    if (!project) {
      for (const r of rolesToTrack) {
        groups.set(r, { attached: [], available: [] });
      }
      return groups;
    }

    const projectContracts = contracts.filter(c => c.projectId === project.id);
    const projectTalentIds = new Set(projectContracts.map(c => c.talentId));

    for (const r of rolesToTrack) {
      const allInRole = talentByRole.get(r) || [];
      const attached: import('@/engine/types').Talent[] = [];
      const available: import('@/engine/types').Talent[] = [];

      for (let i = 0; i < allInRole.length; i++) {
        const t = allInRole[i];
        if (projectTalentIds.has(t.id)) {
          attached.push(t);
        } else {
          available.push(t);
        }
      }

      groups.set(r, { attached, available });
    }
    return groups;
  }, [project, contracts, talentByRole]);

  const greenlightReport = useMemo(() => {
    if (!project || project.state !== 'needs_greenlight' || !gameState) return null;
    const projectContracts = contracts.filter(c => c.projectId === project.id);
    const attachedTalent = projectContracts.reduce((acc, c) => {
      const t = talentMap.get(c.talentId);
      if (t) acc.push(t);
      return acc;
    }, [] as import('@/engine/types').Talent[]);
    return evaluateGreenlight(project, gameState.finance.cash, attachedTalent);
  }, [project, gameState, contracts, talentMap]);

  const projectionData = useMemo(() => {
    if (!project) return [];
    
    let buzz = project.buzz;
    if (selectedTier === 'basic') buzz += 15;
    if (selectedTier === 'blockbuster') buzz += 40;
    buzz = Math.min(100, buzz);

    const baseRevenue = project.budget * (buzz / 50) * 1.5;
    const data: { week: string, revenue: number }[] = [];
    let currentWeekly = baseRevenue * 0.35;
    
    for (let i = 1; i <= 8; i++) {
        data.push({
            week: `Wk ${i}`,
            revenue: Math.round(currentWeekly / 1000) * 1000
        });
        currentWeekly *= 0.65; // Simulated decay
    }
    return data;
  }, [project, selectedTier]);

  if (!project || !tier) return null;

  return (
    <Dialog open={!!selectedProjectId} onOpenChange={() => selectProject(null)}>
      <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif text-3xl font-black tracking-tight text-white uppercase italic">
              {project.title}
            </DialogTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 uppercase font-black">{project.state}</Badge>
              {project.type === 'SERIES' && (project as any).tvDetails && (
                <Badge className="bg-blue-600 text-white font-black">SEASON {(project as any).tvDetails.currentSeason}</Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue={
          project.state === 'marketing' ? "marketing" :
          (project.state === 'needs_greenlight' || project.state === 'development' || project.state === 'production') ? "production" :
          "overview"
        } className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-900/50 p-1 border border-slate-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest"><BarChart3 className="h-3 w-3 mr-2" /> Intro</TabsTrigger>
            <TabsTrigger value="production" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest"><Clapperboard className="h-3 w-3 mr-2" /> Build</TabsTrigger>
            <TabsTrigger value="casting" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest"><Users className="h-3 w-3 mr-2" /> Talent</TabsTrigger>
            <TabsTrigger 
              value="marketing" 
              disabled={project.state === 'development' || project.state === 'production' || project.state === 'needs_greenlight' || project.state === 'pitching'}
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest"
            >
              <Megaphone className="h-3 w-3 mr-2" /> Sell
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest"><Trophy className="h-3 w-3 mr-2" /> Buzz</TabsTrigger>
          </TabsList>

          <div className="mt-4 min-h-[400px]">
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Metadata</span>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-slate-800 text-slate-200">{project.format.toUpperCase()}</Badge>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-200">{project.genre}</Badge>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-200">{tier.name}</Badge>
                  </div>
                  {project.flavor && <p className="text-sm italic text-slate-400 border-t border-slate-800/50 pt-2 mt-2">"{project.flavor}"</p>}
                </div>
                
                <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-xl space-y-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Financial P&L</span>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Total Budget</span>
                      <span className="text-sm font-bold text-white">{formatMoney(project.budget)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Weekly Burn</span>
                      <span className="text-sm font-bold text-red-400">-{formatMoney(project.weeklyCost)}</span>
                    </div>
                    {(project.state === 'released' || project.revenue > 0) && (
                      <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                        <span className="text-xs font-black text-slate-400 uppercase">Gross Revenue</span>
                        <span className="text-lg font-black text-green-400">{formatMoney(project.revenue)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {(project.state === 'released' || project.state === 'post_release') && (
                <div className="bg-blue-950/20 border border-blue-500/20 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Release Stats</span>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-black text-white">{project.buzz.toFixed(0)}% <span className="text-xs font-normal text-slate-500 uppercase italic">Cultural Buzz</span></p>
                    </div>
                    {project.type === 'SERIES' && (
                      <p className="text-sm font-bold text-slate-400">Released {(project as any).tvDetails?.episodesAired || 0}/{(project as any).tvDetails?.episodesOrdered || 0} Episodes</p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* PRODUCTION TAB */}
            <TabsContent value="production" className="space-y-6">
              {(project.state === 'development' || project.state === 'production') && (
                <div className="space-y-2 bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span className="text-slate-500">{project.state} Progress</span>
                    <span className="text-white">{project.weeksInPhase}/{project.state === 'development' ? project.developmentWeeks : project.productionWeeks} weeks</span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(217,119,6,0.5)] transition-all duration-1000"
                      style={{ width: `${(project.weeksInPhase / (project.state === 'development' ? project.developmentWeeks : project.productionWeeks)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {project.state === 'needs_greenlight' && greenlightReport && (
                <div className="border-2 border-amber-600/50 bg-amber-950/20 p-6 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-xl font-black text-amber-500 uppercase">Greenlight Committee</h4>
                    <Badge className={greenlightReport.score >= 60 ? 'bg-green-600' : 'bg-red-600'}>{greenlightReport.recommendation}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1"><span className="text-green-400 font-bold uppercase block">Pros</span><ul className="list-disc list-inside text-slate-300">{greenlightReport.positives.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
                    <div className="space-y-1"><span className="text-red-400 font-bold uppercase block">Cons</span><ul className="list-disc list-inside text-slate-300">{greenlightReport.negatives.map((n, i) => <li key={i}>{n}</li>)}</ul></div>
                  </div>
                  <Button className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black uppercase" onClick={() => { greenlightProject(project.id); selectProject(null); }}>Authorize Production</Button>
                </div>
              )}

              {project.state === 'marketing' && gameState && (
                <div className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
                    <p className="text-sm text-blue-200 uppercase font-black tracking-tighter mb-2">Production Wrapped</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your film is in the can. Now you must decide how much to risk on the global release. High spend increases opening buzz but eats deep into your margins.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full border-blue-500/30 text-blue-400" onClick={() => { /* Navigation handled by tabs */ }}>
                    Continue to Marketing Tab →
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* MARKETING TAB */}
            <TabsContent value="marketing" className="space-y-6">
               <div className="grid grid-cols-3 gap-3">
                 {[
                   { id: 'none', name: 'Word of Mouth', cost: 0, buzz: 0, desc: 'Hope for the best.' },
                   { id: 'basic', name: 'Targeted Digital', cost: project.budget * 0.1, buzz: 15, desc: 'Solid social presence.' },
                   { id: 'blockbuster', name: 'Global Blitz', cost: project.budget * 0.5, buzz: 40, desc: 'Super Bowl ads, billboards.' }
                 ].map(tier => (
                   <button
                     key={tier.id}
                     disabled={!!project.marketingLevel || (gameState ? gameState.finance.cash < tier.cost : false)}
                     onClick={() => setSelectedTier(tier.id as any)}
                     className={`p-3 rounded-xl border text-left transition-all ${
                       project.marketingLevel === tier.id || selectedTier === tier.id 
                         ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                         : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                     } ${!!project.marketingLevel && project.marketingLevel !== tier.id ? 'opacity-40' : ''}`}
                   >
                     <p className="text-[10px] font-black uppercase text-blue-400">{tier.name}</p>
                     <p className="text-sm font-bold text-white mb-1">{formatMoney(tier.cost)}</p>
                     <p className="text-[9px] text-slate-400 leading-tight">{tier.desc}</p>
                     <div className="mt-2 flex items-center justify-between">
                       <span className="text-[9px] font-black text-emerald-400">+{tier.buzz} BUZZ</span>
                     </div>
                   </button>
                 ))}
               </div>

               <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 h-[200px] relative overflow-hidden">
                 <div className="absolute top-4 left-4 z-10">
                   <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Projected Weekly Box Office</p>
                 </div>
                 <div className="w-full h-full pt-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={projectionData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                          dataKey="week" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 9, fill: '#64748b'}} 
                        />
                        <YAxis 
                          hide 
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                          itemStyle={{ color: '#3b82f6', fontSize: '10px', fontWeight: 'bold' }}
                          labelStyle={{ color: '#64748b', fontSize: '9px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#3b82f6" 
                          fillOpacity={1} 
                          fill="url(#colorRev)" 
                          strokeWidth={2}
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
               </div>

               {!project.marketingLevel ? (
                 <Button 
                   className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase py-6 shadow-lg shadow-blue-900/20"
                   disabled={!selectedTier || (gameState ? gameState.finance.cash < (selectedTier === 'basic' ? project.budget * 0.1 : selectedTier === 'blockbuster' ? project.budget * 0.5 : 0) : false)}
                   onClick={() => { lockMarketingCampaign(project.id, selectedTier); selectProject(null); }}
                 >
                   Lock Campaign & Commit Capital
                 </Button>
               ) : (
                 <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl flex items-center justify-center gap-3">
                    <Megaphone className="h-5 w-5 text-blue-400" />
                    <span className="text-xs font-black uppercase text-slate-300">Campaign Finalized: {project.marketingLevel} Strategy</span>
                 </div>
               )}
            </TabsContent>

            {/* CASTING TAB */}
            <TabsContent value="casting" className="space-y-4">
              <div className="space-y-3">
                {['director', 'actor', 'writer', 'producer'].map(role => {
                  const group = roleGroups.get(role)!;
                  return (
                    <div key={role} className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{role}</span>
                        {group.attached.length > 0 ? (
                          <div className="space-y-1">
                            {group.attached.map(t => (
                              <div key={t.id} className="flex items-center gap-2">
                                <span className="font-bold text-white">{t.name}</span>
                                <Badge className="bg-amber-600/20 text-amber-500 border-amber-600/30 text-[8px] h-4">★ {t.prestige}</Badge>
                                {t.psychology?.ego && t.psychology.ego > 70 && <Badge variant="destructive" className="text-[8px] h-4">DIVA</Badge>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600 italic text-sm">Vacant</span>
                        )}
                      </div>
                      
                      {(project.state === 'development' || project.state === 'needs_greenlight') && (
                        <Select onValueChange={(val) => val && gameState && gameState.finance.cash >= talentMap.get(val)!.fee && signContract(val, project.id)}>
                          <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 h-8 text-xs font-bold uppercase"><SelectValue placeholder="Sign Talent..." /></SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                            {group.available.map(t => (
                              <SelectItem key={t.id} value={t.id} disabled={gameState ? gameState.finance.cash < t.fee : true}>
                                {t.name} ({formatMoney(t.fee)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* CAMPAIGNS TAB */}
            <TabsContent value="campaigns" className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl space-y-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Trophy className="h-3 w-3" /> Awards & Festivals</span>
                
                <div className="flex gap-3">
                  <Select onValueChange={(v) => { submitToFestival(project.id, v as AwardBody); selectProject(null); }}>
                    <SelectTrigger className="flex-1 bg-slate-900 border-slate-700"><SelectValue placeholder="Submit to Festival..." /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                      {FESTIVALS.map(f => <SelectItem key={f.body} value={f.body}>{f.name} ({formatMoney(f.cost)})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="border-amber-600/30 text-amber-500 hover:bg-amber-600/10" onClick={() => { launchAwardsCampaign(project.id, 500000); selectProject(null); }}>
                    Boost FYC ($500k)
                  </Button>
                </div>
                
                {project.awardsProfile && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Academy Appeal</span>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${project.awardsProfile.academyAppeal}%` }} /></div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Campaign Strength</span>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-white" style={{ width: `${project.awardsProfile.campaignStrength}%` }} /></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl space-y-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><DollarSign className="h-3 w-3" /> Intellectual Property</span>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Rights Ownership</span><Badge variant="outline" className="capitalize border-slate-700">{project.ipRights?.rightsOwner || 'studio'}</Badge></div>
                  <div className="flex justify-between pt-2 border-t border-slate-800/50"><span className="text-slate-400">Library Value</span><span className="font-mono text-green-400 font-bold">{formatMoney(project.ipRights?.catalogValue || project.budget * 0.1)}</span></div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Action Bar */}
        {(project.state === 'archived' && project.type === 'SERIES') && (
          <div className="mt-6 border-t border-slate-800 pt-4">
            <Button onClick={() => { renewProject(project.id); selectProject(null); }} className="w-full bg-blue-600 hover:bg-blue-500 font-black uppercase">Order Season {((project as any).tvDetails?.currentSeason || 1) + 1}</Button>
          </div>
        )}
        
        {project.state === 'released' && project.revenue > project.budget * 1.5 && (
          <div className="mt-6 border-t border-slate-800 pt-4">
            <Button onClick={() => { exploitFranchise(project.id); selectProject(null); }} className="w-full bg-purple-600 hover:bg-purple-500 font-black uppercase">Greenlight Spinoff / Reboot</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};


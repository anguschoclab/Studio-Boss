import { useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { evaluateGreenlight } from '@/engine/systems/greenlight';
import { FESTIVALS } from '@/engine/systems/festivals';
import { RandomGenerator } from '@/engine/utils/rng';
import { AwardBody, Project, Talent, ScriptedProject, SeriesProject, Contract } from '@/engine/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  ShieldAlert,
  Brain,
  Type,
  Activity,
  Package,
  CheckCircle2
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
import { cn } from '@/lib/utils';
import { DevelopmentLog } from './DevelopmentLog';
import { TalentAttachmentPanel } from '../talent/TalentAttachmentPanel';
import { calculateAudienceIndex } from '@/engine/systems/demographics';

export const ProjectDetailModal = () => {
  const [selectedTier, setSelectedTier] = useState<'none' | 'basic' | 'blockbuster'>('none');

  const { selectedProjectId, selectProject } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const renewProject = useGameStore(s => s.renewProject);
  const greenlightProject = useGameStore(s => s.greenlightProject);
  const exploitFranchise = useGameStore(s => s.exploitFranchise);
  const lockMarketingCampaign = useGameStore(s => s.lockMarketingCampaign);
  const submitToFestival = useGameStore(s => s.submitToFestival);
  const launchAwardsCampaign = useGameStore(s => s.launchAwardsCampaign);

  const projects = useMemo(() => Object.values(gameState?.entities.projects || {}), [gameState?.entities.projects]);
  const project = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
  const talentPool = useMemo(() => Object.values(gameState?.entities.talents || {}), [gameState?.entities.talents]);
  const contracts = useMemo(() => Object.values(gameState?.entities.contracts || {}), [gameState?.entities.contracts]);
  const talentMap = useMemo(() => new Map(talentPool.map(t => [t.id, t])), [talentPool]);

  const talentByRole = useMemo(() => {
    const map = new Map<string, Talent[]>();
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
  const scriptedProject = useMemo(() => (
    project && project.format !== 'unscripted' ? project as ScriptedProject : null
  ), [project]);
  const seriesProject = useMemo(() => (
    project && project.type === 'SERIES' && 'tvDetails' in project ? project as SeriesProject : null
  ), [project]);

  const greenlightReport = useMemo(() => {
    if (!project || project.state !== 'needs_greenlight' || !gameState) return null;
    const projectContracts = contracts.filter(c => c.projectId === project.id);
    const attachedTalent = projectContracts.reduce((acc, c) => {
      const t = talentMap.get(c.talentId);
      if (t) acc.push(t);
      return acc;
    }, [] as Talent[]);

    const seedValue = (gameState.gameSeed ? Number(gameState.gameSeed) : 0) + gameState.week + project.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const uiRng = new RandomGenerator(seedValue);
    
    return evaluateGreenlight(project, gameState.finance.cash, attachedTalent, uiRng, gameState.week, projects);
  }, [project, gameState, contracts, talentMap, projects]);

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
      <DialogContent className="max-w-4xl h-[85vh] bg-slate-950 border-slate-800 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col p-0 text-left">
        <DialogHeader className="p-6 border-b border-slate-800 bg-black/40">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                 <Type className="w-6 h-6 text-primary" />
                 <DialogTitle className="font-serif text-3xl font-black tracking-tight text-white uppercase italic">
                    {project.title}
                 </DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-amber-500 border-amber-500/30 uppercase font-black text-[10px] tracking-widest">{project.state}</Badge>
                <div className="h-1 w-1 rounded-full bg-slate-700" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{project.genre} • {project.format}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="text-right">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Capital At Risk</span>
                  <div className="text-xl font-black text-foreground leading-none">{formatMoney(project.budget)}</div>
               </div>
                {seriesProject?.tvDetails && (
                  <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/30 font-black h-10 px-4">S{seriesProject.tvDetails.currentSeason}</Badge>
               )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          <Tabs defaultValue={
            project.state === 'marketing' ? "marketing" :
            (project.state === 'needs_greenlight' || project.state === 'development' || project.state === 'production') ? "production" :
            "overview"
          } className="flex-1 flex overflow-hidden">
            <div className="w-18 border-r border-slate-800 bg-black/60 flex flex-col items-center py-6 space-y-8 min-w-[72px]">
               <TabsList className="flex flex-col h-auto bg-transparent gap-6 p-0 border-none">
                 {[
                   { val: 'overview', icon: BarChart3, label: 'Intel' },
                   { val: 'production', icon: Clapperboard, label: 'Build' },
                   { val: 'casting', icon: Users, label: 'Talent' },
                   { val: 'marketing', icon: Megaphone, label: 'Sell' },
                   { val: 'campaigns', icon: Trophy, label: 'Buzz' }
                 ].map(tab => (
                   <TabsTrigger 
                     key={tab.val}
                     value={tab.val} 
                     className="flex flex-col items-center gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-slate-500 hover:text-slate-300 transition-all p-2 rounded-xl border-none"
                     disabled={tab.val === 'marketing' && (project.state === 'development' || project.state === 'production' || project.state === 'needs_greenlight' || project.state === 'pitching')}
                   >
                     <tab.icon className="h-5 w-5" />
                     <span className="text-[8px] font-black uppercase tracking-tighter">{tab.label}</span>
                   </TabsTrigger>
                 ))}
               </TabsList>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="min-h-full">
                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="mt-0 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 space-y-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Package Analysis</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-xs font-bold text-slate-400">Town Heat</span>
                            <span className="text-sm font-black text-primary">{scriptedProject?.scriptHeat || 50}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                           <div className="h-full bg-primary" style={{ width: `${scriptedProject?.scriptHeat || 50}%` }} />
                        </div>
                        {project.flavor && (
                          <div className="relative p-4 rounded-xl bg-black/40 border-l-4 border-primary/40 italic text-sm text-slate-300">
                             "{project.flavor}"
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 space-y-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">P&L Forecast</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400">Accumulated Cost</span>
                          <span className="text-sm font-black text-rose-400">-{formatMoney(project.accumulatedCost || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Weekly Burn</span>
                          <span className="text-rose-400/60 font-bold">-{formatMoney(project.weeklyCost)}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-800/50 flex justify-between items-center">
                          <span className="text-xs font-black uppercase text-slate-400">Current Yield</span>
                          <span className="text-xl font-black text-emerald-500">{formatMoney(project.revenue)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                     {[
                       { label: 'Buzz', val: `${project.buzz.toFixed(0)}%`, icon: TrendingUp, color: 'text-violet-400' },
                       { label: 'Complexity', val: project.budgetTier.toUpperCase(), icon: Brain, color: 'text-emerald-400' },
                       { label: 'Week', val: project.weeksInPhase, icon: Calendar, color: 'text-amber-400' }
                     ].map(card => (
                       <div key={card.label} className="p-4 rounded-xl bg-slate-900/20 border border-slate-800/50 flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/5", card.color)}>
                             <card.icon className="w-5 h-5" />
                          </div>
                          <div>
                             <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{card.label}</div>
                             <div className="text-lg font-black text-foreground leading-none">{card.val}</div>
                          </div>
                       </div>
                     ))}
                  </div>

                  {/* Audience Intel (New Phase 4) */}
                  <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Audience Resonance Breakdown</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                       {['male_under_25', 'female_under_25', 'male_over_25', 'female_over_25'].map(q => {
                         const score = calculateAudienceIndex(project, q as any);
                         return (
                           <div key={q} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{q.replace(/_/g, ' ')}</p>
                             <div className="flex items-center justify-between">
                               <span className="text-sm font-black text-white">{score.toFixed(2)}x</span>
                               <div className={cn("w-1.5 h-1.5 rounded-full", score > 1.2 ? "bg-emerald-500" : score > 0.8 ? "bg-amber-500" : "bg-rose-500")} />
                             </div>
                           </div>
                         );
                       })}
                    </div>
                  </div>

                  {project.reception && (
                    <div className="mt-8 p-6 bg-black/60 border border-slate-800 rounded-3xl space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3">
                         {project.reception.isCultPotential && (
                           <Badge className="bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-600/50 animate-pulse font-black uppercase tracking-tighter">Cult Potential</Badge>
                         )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Critic & Audience Reception</span>
                      </div>
                      <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-4xl font-black italic tracking-tighter text-white">{project.reception.metaScore}</span>
                            <span className="text-[10px] font-black uppercase text-slate-500 mb-1">MetaScore</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className={cn(
                              "h-full transition-all duration-1000",
                              project.reception.metaScore >= 75 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' :
                              project.reception.metaScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                            )} style={{ width: `${project.reception.metaScore}%` }} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-4xl font-black italic tracking-tighter text-white">{project.reception.audienceScore}</span>
                            <span className="text-[10px] font-black uppercase text-slate-500 mb-1">Audience</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className={cn(
                              "h-full bg-primary transition-all duration-1000",
                              project.reception.audienceScore >= 75 ? 'shadow-[0_0_15px_rgba(var(--primary),0.5)]' : ''
                            )} style={{ width: `${project.reception.audienceScore}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-800/50">
                        <p className="text-xs font-bold text-slate-400">
                           Status: <span className={cn(
                             "uppercase font-black tracking-widest ml-1",
                             project.reception.status === 'Acclaimed' ? 'text-emerald-400' :
                             project.reception.status === 'Mixed' ? 'text-amber-400' : 'text-rose-400'
                           )}>{project.reception.status}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* PRODUCTION TAB */}
                <TabsContent value="production" className="mt-0 space-y-6">
                  {project.state === 'development' ? (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                        <div className="lg:col-span-2">
                           <DevelopmentLog project={project} />
                        </div>
                        <div className="space-y-4">
                           <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-black/40 space-y-4">
                              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                 <Activity className="w-4 h-4 text-primary" /> Phase Status
                              </h3>
                              <div className="space-y-2">
                                 <div className="flex justify-between text-[10px] font-bold uppercase">
                                    <span className="text-slate-500">Drafting Progress</span>
                                    <span>{project.weeksInPhase}/{project.developmentWeeks} wks</span>
                                 </div>
                                 <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-0.5">
                                    <div 
                                      className="h-full bg-gradient-to-r from-violet-600 to-primary rounded-full transition-all duration-1000" 
                                      style={{ width: `${(project.weeksInPhase / (project.developmentWeeks || 1)) * 100}%` }} 
                                    />
                                 </div>
                              </div>
                              <p className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed italic">
                                 Script is currently in active development. AI drafting system tracks role splitting and Town Heat in real-time.
                              </p>
                           </div>
                        </div>
                     </div>
                  ) : project.state === 'production' ? (
                     <div className="space-y-6">
                        <div className="glass-panel p-8 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col items-center text-center space-y-4">
                           <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                              <Clapperboard className="w-8 h-8 text-primary animate-bounce" />
                           </div>
                           <h3 className="text-2xl font-black uppercase italic tracking-tighter">Principal Photography Active</h3>
                           <p className="text-sm text-muted-foreground max-w-md">
                              Cameras are rolling on "{project.title}". The budget is being consumed at {formatMoney(project.weeklyCost)} per week. Review casting or wait for wrap.
                           </p>
                           <div className="w-full max-w-lg space-y-2 pt-4">
                             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                                 <span>Shoot Completion</span>
                                 <span>{project.weeksInPhase} / {project.productionWeeks} Weeks</span>
                             </div>
                             <div className="h-2 rounded-full bg-black/60 border border-white/5">
                                <div 
                                  className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all duration-1000" 
                                  style={{ width: `${(project.weeksInPhase / (project.productionWeeks || 1)) * 100}%` }} 
                                />
                             </div>
                           </div>
                        </div>
                     </div>
                  ) : project.state === 'needs_greenlight' && greenlightReport ? (
                    <div className="space-y-6">
                       <div className="border border-primary/20 bg-primary/5 p-8 rounded-2xl space-y-6">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <ShieldAlert className="w-8 h-8 text-primary" />
                              <div>
                                 <h4 className="text-2xl font-black italic uppercase tracking-tighter">Executive Greenlight</h4>
                                 <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Final Authorization Review</p>
                              </div>
                           </div>
                           <div className={cn(
                             "px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-xl",
                             greenlightReport.score >= 60 ? 'bg-emerald-500 text-black shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'
                           )}>
                             {greenlightReport.recommendation}
                           </div>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Bull Case</span>
                              <ul className="space-y-2">{greenlightReport.positives.map((p, i) => <li key={i} className="text-xs text-slate-300 flex gap-2"><div className="w-1 h-1 bg-emerald-500/40 rounded-full mt-1.5 shrink-0" /> {p}</li>)}</ul>
                           </div>
                           <div className="space-y-3">
                              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2"><AlertCircle className="w-3 h-3" /> Bear Case</span>
                              <ul className="space-y-2">{greenlightReport.negatives.map((n, i) => <li key={i} className="text-xs text-slate-300 flex gap-2"><div className="w-1 h-1 bg-rose-500/40 rounded-full mt-1.5 shrink-0" /> {n}</li>)}</ul>
                           </div>
                         </div>

                         <div className="pt-6 border-t border-white/5">
                            <Button 
                              className="w-full h-14 bg-primary text-black hover:bg-primary/90 font-black text-sm uppercase tracking-[0.2em] rounded-xl shadow-2xl" 
                              onClick={() => { greenlightProject(project.id); selectProject(null); }}
                            >
                              Execute Authorization & Release Budgets
                            </Button>
                         </div>
                       </div>
                    </div>
                  ) : null}
                </TabsContent>

                {/* CASTING TAB */}
                <TabsContent value="casting" className="mt-0 h-[60vh]">
                  <TalentAttachmentPanel project={project} />
                </TabsContent>

                {/* MARKETING TAB */}
                <TabsContent value="marketing" className="mt-0 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {[
                       { id: 'none', name: 'Word of Mouth', cost: 0, buzz: 0, desc: 'Rely on natural cultural momentum.' },
                       { id: 'basic', name: 'Targeted Digital', cost: project.budget * 0.1, buzz: 15, desc: 'Coordinated social campaign.' },
                       { id: 'blockbuster', name: 'Global Blitz', cost: project.budget * 0.5, buzz: 40, desc: 'Omnichannel market saturation.' }
                     ].map(tier => (
                       <button aria-pressed={project.marketingLevel === tier.id || selectedTier === tier.id}
                         key={tier.id}
                         disabled={!!project.marketingLevel || (gameState ? gameState.finance.cash < tier.cost : false)}
                         onClick={() => setSelectedTier(tier.id as any)}
                         className={cn(
                           "p-6 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between group h-52",
                           project.marketingLevel === tier.id || selectedTier === tier.id 
                             ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.1)]' 
                             : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                         )}
                       >
                         {selectedTier === tier.id && <div className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-bl-2xl flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-black" /></div>}
                         
                         <div>
                            <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">{tier.name}</p>
                            <p className="text-2xl font-black text-white mb-2 tabular-nums">{formatMoney(tier.cost)}</p>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">{tier.desc}</p>
                         </div>
                         
                         <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                           <TrendingUp className="w-4 h-4" /> +{tier.buzz} Project Momentum
                         </div>
                       </button>
                     ))}
                   </div>

                   <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                     <div className="p-5 border-b border-white/5 bg-white/3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <BarChart3 className="w-4 h-4 text-primary" />
                           <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Yield Simulation (8-Week Lifecycle)</p>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground border-white/5">Algorithm V3.1</Badge>
                     </div>
                     <div className="h-[240px] w-full p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={projectionData}>
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="week" hide />
                            <YAxis hide />
                            <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} />
                            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} animationDuration={2000} />
                          </AreaChart>
                        </ResponsiveContainer>
                     </div>
                   </div>

                   {!project.marketingLevel ? (
                     <Button 
                       className="w-full h-16 bg-primary text-black hover:bg-primary/90 font-black text-sm uppercase tracking-[0.3em] rounded-xl shadow-2xl transition-all active:scale-[0.98]"
                       disabled={!selectedTier || (gameState ? gameState.finance.cash < (selectedTier === 'basic' ? project.budget * 0.1 : selectedTier === 'blockbuster' ? project.budget * 0.5 : 0) : false)}
                       onClick={() => { lockMarketingCampaign(project.id, selectedTier); selectProject(null); }}
                     >
                       Authorize Global Release & Dedicate Reserves
                     </Button>
                   ) : (
                     <div className="p-6 bg-slate-900/80 border border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-3">
                           <Megaphone className="h-6 w-6 text-primary animate-pulse" />
                           <span className="text-base font-black uppercase text-white tracking-widest">Deployment: {project.marketingLevel} Initiative</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Box office data will populate in the week summary</p>
                     </div>
                   )}
                </TabsContent>

                {/* CAMPAIGNS TAB */}
                <TabsContent value="campaigns" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-6">
                      <div className="flex items-center gap-3">
                         <Trophy className="w-5 h-5 text-amber-500" />
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Awards & Festivals Pipeline</span>
                      </div>
                      
                      <div className="space-y-4">
                        <Select onValueChange={(v) => { submitToFestival(project.id, v as AwardBody); selectProject(null); }}>
                          <SelectTrigger className="h-12 bg-slate-950 border-slate-800 text-xs font-black uppercase tracking-widest"><SelectValue placeholder="Festival Submission..." /></SelectTrigger>
                          <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                             {FESTIVALS.map(f => <SelectItem key={f.body} value={f.body} className="font-bold flex items-center">
                               {f.name} <span className="ml-2 text-emerald-400">({formatMoney(f.cost)})</span>
                             </SelectItem>)}
                          </SelectContent>
                        </Select>
                        
                        <div className="grid grid-cols-1 gap-2">
                           <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Active FYC Campaign</p>
                           {gameState?.studio.activeCampaigns?.[project.id] ? (
                             <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                <div className="flex justify-between items-center mb-2">
                                   <span className="text-xs font-black text-amber-500 uppercase italic">Active Outreach</span>
                                    <Badge className="bg-amber-500 text-black font-black">+{gameState.studio.activeCampaigns[project.id].buzzBonus} BUZZ</Badge>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Targeting major categories for the upcoming season.</p>
                             </div>
                           ) : (
                             <div className="grid grid-cols-3 gap-2">
                                {[
                                  { k: 'Grassroots', c: 250000 },
                                  { k: 'Trade', c: 1000000 },
                                  { k: 'Blitz', c: 5000000 }
                                ].map(tier => (
                                  <Button 
                                    key={tier.k as any}
                                    variant="outline" 
                                    className="h-14 flex flex-col items-center justify-center border-slate-800 hover:border-amber-500/50 bg-black/40 group"
                                    onClick={() => { launchAwardsCampaign(project.id, tier.k as any); selectProject(null); }}
                                    disabled={gameState ? gameState.finance.cash < tier.c : true}
                                  >
                                     <span className="text-[8px] font-black text-slate-500 uppercase group-hover:text-amber-500">{tier.k as any}</span>
                                     <span className="text-[10px] font-mono font-black text-white">{formatMoney(tier.c)}</span>
                                  </Button>
                                ))}
                             </div>
                           )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-6 flex flex-col justify-between">
                      <div className="space-y-6">
                         <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-violet-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IP Vault & Catalog Properties</span>
                         </div>
                         <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/5">
                               <span className="text-xs font-bold text-slate-400">Governance</span>
                               <Badge variant="outline" className="text-[10px] font-black uppercase border-slate-700 bg-slate-800">Internal Development</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/5">
                               <span className="text-xs font-bold text-slate-400">Franchise Asset ID</span>
                               <span className="text-xs font-mono text-slate-500 uppercase">{project.franchiseId || 'New/Standalone'}</span>
                            </div>
                         </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800/50 flex justify-between items-end">
                         <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Library Residual Valuation</span>
                            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tighter tabular-nums">{formatMoney(project.budget * 0.15)}</div>
                         </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Global Footer Controls */}
        <div className="p-6 bg-black/80 border-t border-slate-800 flex items-center justify-between gap-4">
           {((project.state === 'archived' || project.state === 'released' || project.state === 'post_release') && project.type === 'SERIES') ? (
             <Button onClick={() => { renewProject(project.id); selectProject(null); }} className="flex-1 max-w-sm h-12 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20">
                Order Next Season (Production)
             </Button>
           ) : project.state === 'released' && project.revenue > project.budget * 1.5 ? (
             <Button onClick={() => { exploitFranchise(project.id); selectProject(null); }} className="flex-1 max-w-sm h-12 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-violet-900/20">
                Spin-Off / Franchise Expansion
             </Button>
           ) : (
             <div className="flex-1" />
           )}
           
           <div className="flex items-center gap-3">
              <Button variant="ghost" className="h-10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white" onClick={() => selectProject(null)}>Close Terminal</Button>
              <div className="h-8 w-[1px] bg-slate-800" />
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">Connection Stable</span>
              </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

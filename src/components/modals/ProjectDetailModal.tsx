import { useMemo, useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { evaluateGreenlight } from '@/engine/systems/greenlight';
import { FESTIVALS } from '@/engine/systems/festivals';
import { AwardBody, Project, Talent, ScriptedProject, SeriesProject } from '@/engine/types';
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
  Search,
  CheckCircle2,
  Brain,
  Type,
  Activity,
  Package
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
import { CastingFeedback } from '../talent/CastingFeedback';

const MARKETING_ANGLES = [
  { id: 'romance', label: 'Romance & Heart' },
  { id: 'spectacle', label: 'Visual Spectacle' },
  { id: 'thrills', label: 'Action & Thrills' },
  { id: 'humor', label: 'Comedy & Fun' },
  { id: 'prestige', label: 'Prestige & Awards' },
  { id: 'mystery', label: 'Mystery & Intrigue' }
];

export const ProjectDetailModal = () => {
  const [selectedTier, setSelectedTier] = useState<'none' | 'basic' | 'blockbuster'>('none');
  const [hoveredTalentId, setHoveredTalentId] = useState<string | null>(null);

  const { selectedProjectId, selectProject } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const signContract = useGameStore(s => s.signContract);
  const renewProject = useGameStore(s => s.renewProject);
  const greenlightProject = useGameStore(s => s.greenlightProject);
  const exploitFranchise = useGameStore(s => s.exploitFranchise);
  const lockMarketingCampaign = useGameStore(s => s.lockMarketingCampaign);
  const submitToFestival = useGameStore(s => s.submitToFestival);
  const launchAwardsCampaign = useGameStore(s => s.launchAwardsCampaign);

  const projects = useMemo(() => Object.values(gameState?.studio?.internal?.projects || {}), [gameState?.studio?.internal?.projects]);
  const project = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
  const talentPool = useMemo(() => Object.values(gameState?.industry?.talentPool || {}), [gameState?.industry?.talentPool]);
  const contracts = useMemo(() => gameState?.studio?.internal?.contracts || [], [gameState?.studio?.internal?.contracts]);
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

  const roleGroups = useMemo(() => {
    const groups = new Map<string, { attached: Talent[], available: Talent[] }>();
    const rolesToTrack = scriptedProject?.activeRoles || ['director', 'writer', 'producer', 'protagonist'];

    if (!project) {
      for (const r of rolesToTrack) {
        groups.set(r, { attached: [], available: [] });
      }
      return groups;
    }

    const projectContracts = contracts.filter(c => c.projectId === project.id);
    const projectTalentIds = new Set(projectContracts.map(c => c.talentId));

    for (const r of rolesToTrack) {
      const roleKey = r === 'protagonist' ? 'actor' : (r === 'antagonist' ? 'actor' : (r === 'love_interest' ? 'actor' : r));
      const allInRole = talentByRole.get(roleKey) || talentByRole.get('actor') || [];
      const attached: Talent[] = [];
      const available: Talent[] = [];

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
  }, [project, scriptedProject, contracts, talentByRole]);

  const greenlightReport = useMemo(() => {
    if (!project || project.state !== 'needs_greenlight' || !gameState) return null;
    const projectContracts = contracts.filter(c => c.projectId === project.id);
    const attachedTalent = projectContracts.reduce((acc, c) => {
      const t = talentMap.get(c.talentId);
      if (t) acc.push(t);
      return acc;
    }, [] as Talent[]);
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
      <DialogContent className="max-w-4xl h-[85vh] bg-slate-950 border-slate-800 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col p-0">
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
            <div className="w-16 border-r border-slate-800 bg-black/60 flex flex-col items-center py-6 space-y-8">
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
                <TabsContent value="casting" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                     <div className="lg:col-span-12 xl:col-span-7 space-y-4">
                       <div className="flex items-center justify-between px-2">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                             <Users className="w-4 h-4 text-violet-400" /> Talent Roster
                          </h3>
                       </div>

                       <div className="space-y-3">
                          {Array.from(roleGroups.keys()).map(role => {
                            const group = roleGroups.get(role)!;
                            const isFilled = group.attached.length > 0;
                            return (
                              <div key={role} className={cn(
                                "p-5 rounded-2xl border transition-all relative overflow-hidden group",
                                isFilled ? "bg-slate-900/40 border-slate-800" : "bg-white/2 border-white/5 border-dashed"
                              )}>
                                <div className="flex items-center justify-between gap-6">
                                  <div className="flex items-center gap-4 flex-1">
                                     <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", isFilled ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/5 text-muted-foreground/30")}>
                                        <Users className="w-5 h-5" />
                                     </div>
                                     <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{role.replace('_', ' ')}</span>
                                        {isFilled ? (
                                           <div className="flex items-center gap-3 mt-0.5">
                                             <span className="font-black text-base text-white truncate">{group.attached[0].name}</span>
                                             <Badge variant="outline" className="text-[10px] font-bold bg-amber-500/10 text-amber-500 border-none shrink-0 h-5 px-1.5">★ {group.attached[0].prestige}</Badge>
                                           </div>
                                        ) : (
                                          <span className="text-slate-600 italic text-sm mt-0.5 font-medium">Unsigned Representative</span>
                                        )}
                                     </div>
                                  </div>
                                  
                                  {(project.state === 'development' || project.state === 'needs_greenlight') && (
                                    <Select onValueChange={(val) => val && gameState && gameState.finance.cash >= (talentMap.get(val)?.fee || 0) && signContract(val, project.id)}>
                                      <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 h-10 text-xs font-bold uppercase tracking-widest"><SelectValue placeholder="Cast Role..." /></SelectTrigger>
                                      <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                                        {group.available.map(t => (
                                          <SelectItem 
                                            key={t.id} 
                                            value={t.id} 
                                            className="focus:bg-primary/10"
                                            onMouseEnter={() => setHoveredTalentId(t.id)}
                                          >
                                            <div className="flex items-center justify-between w-full min-w-[200px] gap-4">
                                               <span className="font-black truncate">{t.name}</span>
                                               <span className="text-emerald-400 font-bold ml-auto">{formatMoney(t.fee)}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                       </div>
                     </div>

                     <div className="lg:col-span-12 xl:col-span-5 h-full">
                        <div className="sticky top-0 space-y-6">
                           <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-black/40 h-full min-h-[300px] flex flex-col">
                              {hoveredTalentId && talentMap.has(hoveredTalentId) ? (
                                 <CastingFeedback 
                                    talent={talentMap.get(hoveredTalentId)!} 
                                    project={project} 
                                 />
                              ) : (
                                 <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-20">
                                    <Brain className="w-12 h-12 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                                       Hover over available talent<br />to analyze psychological fit<br />and industry willingness
                                    </p>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
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
                        
                        <Button 
                          variant="outline" 
                          className="w-full h-12 border-amber-600/30 text-amber-500 hover:bg-amber-600/10 font-black uppercase text-[10px] tracking-widest" 
                          onClick={() => { launchAwardsCampaign(project.id, 500_000); selectProject(null); }}
                        >
                           Expand "For Your Consideration" Outreach ($500k)
                        </Button>
                      </div>
                      
                      {project.awardsProfile && (
                        <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-800">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                               <span className="text-slate-500">Academy Sentiment</span>
                               <span className="text-amber-500">{project.awardsProfile.academyAppeal}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                               <div className="h-full bg-amber-500" style={{ width: `${project.awardsProfile.academyAppeal}%` }} />
                            </div>
                          </div>
                   <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                               <span className="text-slate-500">Campaign Force</span>
                               <span className="text-white">{project.awardsProfile.campaignStrength}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                               <div className="h-full bg-white shadow-[0_0_10px_white]" style={{ width: `${project.awardsProfile.campaignStrength}%` }} />
                            </div>
                          </div>
                        </div>
                      )}
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
                               <Badge variant="outline" className="text-[10px] font-black uppercase border-slate-700 bg-slate-800">{project.ipRights?.rightsOwner || 'Internal Development'}</Badge>
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
                            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tighter tabular-nums">{formatMoney(project.ipRights?.catalogValue || project.budget * 0.15)}</div>
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

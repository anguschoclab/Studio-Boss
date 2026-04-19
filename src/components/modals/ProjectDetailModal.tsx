import { useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { evaluateGreenlight } from '@/engine/systems/greenlight';
import { RandomGenerator } from '@/engine/utils/rng';
import { Talent, ScriptedProject, SeriesProject } from '@/engine/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { ProjectOverviewTab } from './tabs/ProjectOverviewTab';
import { ProjectMarketingTab } from './tabs/ProjectMarketingTab';
import { ProjectCampaignsTab } from './tabs/ProjectCampaignsTab';

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

  const projects = useMemo(() => Object.values(gameState?.entities?.projects || {}), [gameState?.entities?.projects]);
  const project = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
  const talentPool = useMemo(() => Object.values(gameState?.entities?.talents || {}), [gameState?.entities?.talents]);
  const contracts = useMemo(() => Object.values(gameState?.entities?.contracts || {}), [gameState?.entities?.contracts]);
  const talentMap = useMemo(() => new Map(talentPool.map(t => [t.id, t])), [talentPool]);

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
                <ProjectOverviewTab project={project} scriptedProject={scriptedProject} />

                {/* OVERVIEW TAB — extracted to ProjectOverviewTab; marker kept for JSX tree */}

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
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

                <ProjectMarketingTab
                  project={project}
                  selectedTier={selectedTier}
                  onSelectTier={setSelectedTier}
                  projectionData={projectionData}
                  cash={gameState?.finance.cash ?? 0}
                  onLockCampaign={() => { lockMarketingCampaign(project.id, selectedTier); selectProject(null); }}
                />

                {/* MARKETING TAB — extracted to ProjectMarketingTab */}

                <ProjectCampaignsTab
                  project={project}
                  cash={gameState?.finance.cash ?? 0}
                  activeCampaign={gameState?.studio?.activeCampaigns?.[project.id]}
                  onSubmitToFestival={(v) => { submitToFestival(project.id, v); selectProject(null); }}
                  onLaunchAwardsCampaign={(tier) => { launchAwardsCampaign(project.id, tier); selectProject(null); }}
                />

                {/* CAMPAIGNS TAB — extracted to ProjectCampaignsTab */}
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

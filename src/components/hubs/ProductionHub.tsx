import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore, ProductionSubTab } from '@/store/uiStore';
import { useShallow } from 'zustand/react/shallow';
import { selectProjects } from '@/store/selectors';
import { SubNav } from '@/components/navigation/SubNav';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/layout/Section';
import { Stack } from '@/components/layout/Stack';
import {
  LayoutGrid,
  Film,
  Globe,
  Library,
  Plus,
  Search,
  AlertTriangle,
  Handshake,
  Tv,
  BarChart3,
  CheckCircle2,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StreamingPerformancePanel } from './production/StreamingPerformancePanel';
import { WriterStrikeImpact } from './production/WriterStrikeImpact';
import { LocationScoutPanel } from './production/LocationScoutPanel';

// Lazy load the heavy components
const PipelineBoard = React.lazy(() => import('@/components/pipeline/PipelineBoard').then(m => ({ default: m.PipelineBoard })));
const IPVault = React.lazy(() => import('@/components/ip/IPVault').then(m => ({ default: m.IPVault })));
const DealsDesk = React.lazy(() => import('@/components/deals/DealsDesk').then(m => ({ default: m.DealsDesk })));
const StreamingPanel = React.lazy(() => import('@/components/streaming/StreamingPanel').then(m => ({ default: m.StreamingPanel })));
const NielsenDashboard = React.lazy(() => import('@/components/television/NielsenDashboard').then(m => ({ default: m.NielsenDashboard })));
const ScriptList = React.lazy(() => import('@/components/development/ScriptList').then(m => ({ default: m.ScriptList })));
const GreenlightQueue = React.lazy(() => import('@/components/development/GreenlightQueue').then(m => ({ default: m.GreenlightQueue })));

// Development sub-panel for concepts and greenlight queue
const DevelopmentPanel = () => {
  const { openCreateProject, selectProject } = useUIStore();
  const greenlightProject = useGameStore(s => s.greenlightProject);
  const advanceProjectPhase = useGameStore(s => s.advanceProjectPhase);
  const projects = useGameStore(useShallow(s => s.gameState ? selectProjects(s.gameState) : []));

  const developmentProjects = useMemo(() =>
    projects.filter(p => p.state === 'development' || p.state === 'needs_greenlight'),
    [projects]
  );

  const needsGreenlight = developmentProjects.filter(p => p.state === 'needs_greenlight').length;

  const handleReview = (id: string) => {
    // Open ProjectDetailModal for project review with script details
    selectProject(id);
  };

  const handleApprove = (id: string) => {
    // Approve project for production using existing greenlightProject function
    void greenlightProject(id);
  };

  const handleReject = (id: string) => {
    // Reject project by archiving it
    advanceProjectPhase(id, 'archived');
  };

  return (
    <Stack direction="vertical" gap="xl" className="animate-in fade-in duration-700">
      <div className={cn(
        'flex items-center justify-between p-10 rounded-none border border-white/5 bg-white/[0.01] backdrop-blur-3xl shadow-2xl relative overflow-hidden',
      )}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16" />
        
        <Stack direction="vertical" gap="sm" className="relative z-10">
          <h3 className="text-xl font-display font-black uppercase italic tracking-tight text-foreground">DEVELOPMENT_QUEUE</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
            {developmentProjects.length} PROJECTS IN DEVELOPMENT • {needsGreenlight} AWAITING GREENLIGHT
          </p>
        </Stack>
        <Button
          onClick={openCreateProject}
          className="h-14 px-10 bg-primary text-black hover:bg-primary/90 font-black uppercase italic tracking-[0.2em] text-[10px] rounded-none shadow-[0_0_20px_rgba(var(--primary),0.2)] group transition-all duration-700"
        >
          <Plus className="h-4 w-4 mr-3 group-hover:rotate-90 transition-transform" strokeWidth={3} />
          NEW_IP_CONCEPT
        </Button>
      </div>

      {needsGreenlight > 0 && (
        <div className={cn(
          'flex items-center gap-6 p-8 rounded-none',
          'bg-amber-500/5 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)] relative overflow-hidden animate-pulse'
        )}>
           <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <AlertTriangle className="h-8 w-8 text-amber-500" strokeWidth={1} />
          <div className="space-y-1">
            <p className="text-sm font-black text-amber-500 uppercase tracking-[0.1em] italic leading-none">
              {needsGreenlight} PROJECT{needsGreenlight > 1 ? 'S' : ''} READY FOR GREENLIGHT
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500/40 italic leading-none">
              REVIEW IN SLATE TAB TO APPROVE
            </p>
          </div>
        </div>
      )}

      {/* Script Pipeline */}
      <Section
        title="SCRIPT_DEVELOPMENT_PIPELINE"
        subtitle="TRACK SCRIPTS FROM CONCEPT TO FINAL DRAFT"
        icon={Film}
      >
        <React.Suspense fallback={<div className="py-20 text-center font-display font-black text-muted-foreground/10 animate-pulse uppercase tracking-[0.5em] italic">INITIALIZING PIPELINE...</div>}>
          <ScriptList scripts={[]} />
        </React.Suspense>
      </Section>

      {/* Greenlight Queue */}
      <Section
        title="GREENLIGHT_QUEUE"
        subtitle={`${needsGreenlight} PROJECT${needsGreenlight > 1 ? 'S' : ''} AWAITING APPROVAL`}
        icon={CheckCircle2}
      >
        <React.Suspense fallback={<div className="py-20 text-center font-display font-black text-muted-foreground/10 animate-pulse uppercase tracking-[0.5em] italic">INITIALIZING QUEUE...</div>}>
          <GreenlightQueue
            projects={developmentProjects.filter(p => p.state === 'needs_greenlight')}
            onReview={handleReview}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </React.Suspense>
      </Section>
    </Stack>
  );
};

// Slate Panel — PipelineBoard + contextual tools
const SlatePanel = () => {
  const gameState = useGameStore(s => s.gameState);

  const strikeEvent = useMemo(() => (gameState?.market?.activeMarketEvents || []).find(
    e => e.type === 'writers_strike' || e.type === 'actors_strike'
  ), [gameState]);

  const productionProjects = useMemo(() => Object.values(gameState?.entities?.projects || {})
    .filter(p => p.state === 'production'), [gameState]);

  const affectedProjects = useMemo(() => productionProjects.map(p => ({
    projectId: p.id,
    projectTitle: p.title,
    status: 'at_risk' as const,
    weeksDelayed: 0,
    costImpact: Math.round((p.budget || 0) * 0.05),
    affectedWriters: [],
  })), [productionProjects]);

  const [showLocations, setShowLocations] = useState(false);

  return (
    <div className="h-full flex flex-col gap-10 overflow-y-auto custom-scrollbar pr-6 pb-20 animate-in fade-in duration-700">
      {strikeEvent && (
        <WriterStrikeImpact
          strike={{
            isActive: true,
            weekStarted: (gameState?.week || 1) - (20 - strikeEvent.weeksRemaining),
            estimatedDuration: 20,
            weeksElapsed: 20 - strikeEvent.weeksRemaining,
            industrySolidarity: 70,
          }}
          affectedProjects={affectedProjects}
          totalCostImpact={affectedProjects.reduce((sum, p) => sum + p.costImpact, 0)}
        />
      )}
      <div className="flex-1 min-h-0">
        <React.Suspense fallback={<div className="py-20 text-center font-display font-black text-muted-foreground/10 animate-pulse uppercase tracking-[0.5em] italic">INITIALIZING SLATE...</div>}>
          <PipelineBoard />
        </React.Suspense>
      </div>
      <div className="pt-10 border-t border-white/5">
        <button
          className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 hover:text-primary flex items-center gap-4 mb-6 italic transition-all duration-700"
          onClick={() => setShowLocations(v => !v)}
        >
          <Target className="h-4 w-4" strokeWidth={3} />
          {showLocations ? 'CLOSE' : 'OPEN'} LOCATION_SCOUT_MODULE
        </button>
        {showLocations && <LocationScoutPanel locations={[]} selectedLocations={[]} />}
      </div>
    </div>
  );
};

// Distribution sub-panel with tabs
const DistributionPanel = () => {
  const [distTab, setDistTab] = useState<'deals' | 'streaming' | 'nielsen' | 'performance'>('deals');
  const gameState = useGameStore(s => s.gameState);

  const streamingProjects = useMemo(() => {
    return Object.values(gameState?.entities?.projects || {})
      .filter(p => p.state === 'released' && p.format === 'tv')
      .map(p => ({
        projectId: p.id,
        projectTitle: p.title,
        platforms: [{
          platformName: 'Streaming',
          subscribers: 0,
          hoursWatched: Math.round((p.revenue || 0) / 1000),
          completionRate: Math.min(100, (p.buzz || 0) * 0.8),
          trending: ((p.momentum || 50) > 55 ? 'up' : (p.momentum || 50) < 45 ? 'down' : 'stable'),
          topTerritory: 'Domestic',
        }],
        totalHoursWatched: Math.round((p.revenue || 0) / 1000),
        avgCompletionRate: Math.min(100, (p.buzz || 0) * 0.8),
      }));
  }, [gameState]);
  
  const tabs = [
    { id: 'deals', label: 'DEALS DESK', icon: <Handshake className="h-3.5 w-3.5" /> },
    { id: 'streaming', label: 'STREAMING', icon: <Tv className="h-3.5 w-3.5" /> },
    { id: 'nielsen', label: 'TV RATINGS', icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { id: 'performance', label: 'PERFORMANCE', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  ];
  
  return (
    <div className="h-full flex flex-col space-y-10 animate-in fade-in duration-700">
      <SubNav 
        tabs={tabs}
        activeTab={distTab}
        onChange={(id) => setDistTab(id as typeof distTab)}
        variant="pills"
      />
      
      <div className="flex-1 min-h-0 overflow-hidden pr-6">
        <React.Suspense fallback={<div className="py-20 text-center font-display font-black text-muted-foreground/10 animate-pulse uppercase tracking-[0.5em] italic">INITIALIZING DISTRIBUTION...</div>}>
          {distTab === 'deals' && <DealsDesk />}
          {distTab === 'streaming' && <StreamingPanel />}
          {distTab === 'nielsen' && <NielsenDashboard />}
          {distTab === 'performance' && (
            <div className="h-full overflow-y-auto custom-scrollbar pb-20">
              <StreamingPerformancePanel
                projects={streamingProjects}
                totalSubscribers={0}
                growthRate={0}
              />
            </div>
          )}
        </React.Suspense>
      </div>
    </div>
  );
};

export const ProductionHub: React.FC = () => {
  const { activeSubTab, setActiveSubTab, openCreateProject } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  
  const projects = useGameStore(useShallow(s => s.gameState ? selectProjects(s.gameState) : []));
  
  // Calculate badge counts
  const badgeCounts = useMemo(() => {
    const needsAttention = projects.filter(p => {
      const isOverBudget = (p.accumulatedCost || 0) > (p.budget || 0) * 1.2;
      const isTroubled = p.state === 'turnaround' || p.state === 'needs_greenlight';
      const hasCrisis = p.activeCrisis && !p.activeCrisis.resolved;
      return (isOverBudget || isTroubled || hasCrisis) && 
             p.state !== 'released' && p.state !== 'archived';
    }).length;
    
    const needsGreenlight = projects.filter(p => p.state === 'needs_greenlight').length;
    const activeDeals = Object.values(gameState?.entities?.projects || {})
      .filter(p => p.state === 'pitching').length;
    const catalogSize = Object.values(gameState?.ip?.vault || {}).length;
    
    return {
      slate: needsAttention > 0 ? needsAttention : null,
      development: needsGreenlight > 0 ? needsGreenlight : null,
      distribution: activeDeals > 0 ? activeDeals : null,
      catalog: catalogSize > 0 ? catalogSize : null,
    };
  }, [projects, gameState]);
  
  const tabs = [
    { 
      id: 'slate', 
      label: 'SLATE', 
      badge: badgeCounts.slate,
      description: 'Active projects from development through release'
    },
    { 
      id: 'development', 
      label: 'DEVELOPMENT', 
      badge: badgeCounts.development,
      description: 'Script development and greenlight queue'
    },
    { 
      id: 'distribution', 
      label: 'DISTRIBUTION', 
      badge: badgeCounts.distribution,
      description: 'Active deals, streaming, and TV ratings'
    },
    { 
      id: 'catalog', 
      label: 'CATALOG', 
      badge: badgeCounts.catalog,
      description: 'Released projects, IP vault, and franchises'
    },
  ];
  
  const getHeaderContent = () => {
    switch (activeSubTab) {
      case 'slate':
        return {
          icon: <LayoutGrid className="h-8 w-8 text-primary" />,
          title: 'PRODUCTION SLATE',
          subtitle: 'ACTIVE PROJECTS FROM DEVELOPMENT THROUGH RELEASE',
          action: (
            <Button 
              onClick={openCreateProject}
              className="h-12 px-8 bg-primary text-black hover:bg-primary/90 font-display font-black uppercase italic tracking-[0.2em] text-[10px] rounded-none shadow-[0_0_30px_rgba(var(--primary),0.2)] group transition-all duration-700"
            >
              <Plus className="h-4 w-4 mr-3 group-hover:rotate-90 transition-transform" strokeWidth={3} />
              NEW_PROJECT
            </Button>
          )
        };
      case 'development':
        return {
          icon: <Film className="h-8 w-8 text-secondary" />,
          title: 'DEVELOPMENT QUEUE',
          subtitle: 'SCRIPT DEVELOPMENT AND GREENLIGHT REVIEW',
          action: null
        };
      case 'distribution':
        return {
          icon: <Globe className="h-8 w-8 text-primary" />,
          title: 'DISTRIBUTION HUB',
          subtitle: 'DEALS DESK, STREAMING PLATFORMS, AND NIELSEN RATINGS',
          action: null
        };
      case 'catalog':
        return {
          icon: <Library className="h-8 w-8 text-secondary" />,
          title: 'IP CATALOG & VAULT',
          subtitle: 'RELEASED PROJECTS, FRANCHISES, AND LIBRARY RIGHTS',
          action: null
        };
      default:
        return { icon: null, title: '', subtitle: '', action: null };
    }
  };
  
  const header = getHeaderContent();
  
  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/[0.02] p-10 rounded-none border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] -mr-32 -mt-32" />
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-16 h-16 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center shadow-2xl">
            {header.icon}
          </div>
          <div>
            <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none mb-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">{header.title}</h2>
            <p className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.4em] italic">
              {header.subtitle}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          {header.action}
          <div className="hidden lg:block relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20" />
            <input 
              type="text" 
              aria-label="Filter slate"
              placeholder="FILTER_SLATE..."
              className="w-full h-12 pl-12 pr-4 text-[10px] bg-black/40 border border-white/10 rounded-none uppercase font-black tracking-[0.2em] italic focus:outline-none focus:border-primary/50 transition-all duration-700 placeholder:text-muted-foreground/5"
            />
          </div>
        </div>
      </div>
      
      {/* Sub Navigation */}
      <div className="mb-10">
        <SubNav 
          tabs={tabs}
          activeTab={activeSubTab}
          onChange={(id) => setActiveSubTab(id as ProductionSubTab)}
          variant="pills"
        />
      </div>
      
      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <React.Suspense fallback={<div className="flex items-center justify-center h-64 font-display font-black text-muted-foreground/10 animate-pulse uppercase tracking-[0.5em] italic">INITIALIZING MODULE...</div>}>
          {activeSubTab === 'slate' && <SlatePanel />}
          {activeSubTab === 'development' && <DevelopmentPanel />}
          {activeSubTab === 'distribution' && <DistributionPanel />}
          {activeSubTab === 'catalog' && <IPVault />}
        </React.Suspense>
      </div>
    </div>
  );
};

export default ProductionHub;

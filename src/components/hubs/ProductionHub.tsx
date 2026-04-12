import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore, ProductionSubTab } from '@/store/uiStore';
import { useShallow } from 'zustand/react/shallow';
import { selectProjects, selectOpportunities, selectActiveProjects } from '@/store/selectors';
import { SubNav } from '@/components/navigation/SubNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Section } from '@/components/layout/Section';
import { Stack, HorizontalStack } from '@/components/layout/Stack';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonPage } from '@/components/shared/SkeletonCard';
import { tokens, patterns } from '@/lib/tokens';
import { 
  LayoutGrid, 
  Film, 
  Globe, 
  Library, 
  Plus, 
  Search,
  AlertTriangle,
  Package,
  Handshake,
  Tv,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy load the heavy components
const PipelineBoard = React.lazy(() => import('@/components/pipeline/PipelineBoard').then(m => ({ default: m.PipelineBoard })));
const IPVault = React.lazy(() => import('@/components/ip/IPVault').then(m => ({ default: m.IPVault })));
const DistributionHub = React.lazy(() => import('@/components/distribution/DistributionHub').then(m => ({ default: m.DistributionHub })));
const DealsDesk = React.lazy(() => import('@/components/deals/DealsDesk').then(m => ({ default: m.DealsDesk })));
const StreamingPanel = React.lazy(() => import('@/components/streaming/StreamingPanel').then(m => ({ default: m.StreamingPanel })));
const NielsenDashboard = React.lazy(() => import('@/components/television/NielsenDashboard').then(m => ({ default: m.NielsenDashboard })));
const ScriptList = React.lazy(() => import('@/components/development/ScriptList').then(m => ({ default: m.ScriptList })));
const GreenlightQueue = React.lazy(() => import('@/components/development/GreenlightQueue').then(m => ({ default: m.GreenlightQueue })));

// Development sub-panel for concepts and greenlight queue
const DevelopmentPanel = () => {
  const { openCreateProject } = useUIStore();
  const greenlightProject = useGameStore(s => s.greenlightProject);
  const advanceProjectPhase = useGameStore(s => s.advanceProjectPhase);
  const projects = useGameStore(useShallow(s => s.gameState ? selectProjects(s.gameState) : []));

  const developmentProjects = useMemo(() =>
    projects.filter(p => p.state === 'development' || p.state === 'needs_greenlight'),
    [projects]
  );

  const needsGreenlight = developmentProjects.filter(p => p.state === 'needs_greenlight').length;

  const handleReview = (id: string) => {
    // Navigate to project detail modal
    // For now, this could open a project review modal or navigate to project detail
    // TODO: Implement project review modal with script details
    console.log(`Review project ${id} - navigate to project detail`);
  };

  const handleApprove = async (id: string) => {
    // Approve project for production using existing greenlightProject function
    await greenlightProject(id);
  };

  const handleReject = (id: string) => {
    // Reject project by archiving it
    advanceProjectPhase(id, 'archived');
  };

  return (
    <Stack direction="vertical" gap="lg">
      <div className={cn(
        'flex items-center justify-between p-5 rounded-xl',
        tokens.bg.secondary,
        tokens.border.default
      )}>
        <Stack direction="vertical" gap="xs">
          <h3 className={tokens.text.title}>Development Queue</h3>
          <p className={tokens.text.caption}>
            {developmentProjects.length} projects in development • {needsGreenlight} awaiting greenlight
          </p>
        </Stack>
        <Button
          onClick={openCreateProject}
          className={cn('h-10 px-5 gap-2', patterns.button.primary)}
        >
          <Plus className="h-4 w-4" />
          <span className={tokens.text.label}>New IP Concept</span>
        </Button>
      </div>

      {needsGreenlight > 0 && (
        <div className={cn(
          'flex items-center gap-3 p-4 rounded-lg',
          'bg-amber-500/10 border border-amber-500/20'
        )}>
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div>
            <p className="text-sm font-bold text-amber-500">
              {needsGreenlight} project{needsGreenlight > 1 ? 's' : ''} ready for greenlight
            </p>
            <p className={cn(tokens.text.caption, 'text-amber-500/70')}>
              Review in Slate tab to approve
            </p>
          </div>
        </div>
      )}

      {/* Script Pipeline */}
      <Section
        title="Script Development Pipeline"
        subtitle="Track scripts from concept to final draft"
        icon={Film}
      >
        <React.Suspense fallback={<SkeletonPage contentCards={2} />}>
          <ScriptList scripts={[]} />
        </React.Suspense>
      </Section>

      {/* Greenlight Queue */}
      <Section
        title="Greenlight Queue"
        subtitle={`${needsGreenlight} project${needsGreenlight > 1 ? 's' : ''} awaiting approval`}
        icon={CheckCircle2}
      >
        <React.Suspense fallback={<SkeletonPage contentCards={2} />}>
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

// Distribution sub-panel with tabs
const DistributionPanel = () => {
  const [distTab, setDistTab] = useState<'deals' | 'streaming' | 'nielsen'>('deals');
  
  const tabs = [
    { id: 'deals', label: 'Deals Desk', icon: <Handshake className="h-3.5 w-3.5" /> },
    { id: 'streaming', label: 'Streaming', icon: <Tv className="h-3.5 w-3.5" /> },
    { id: 'nielsen', label: 'TV Ratings', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  ];
  
  return (
    <div className="h-full flex flex-col space-y-4">
      <SubNav 
        tabs={tabs.map(t => ({ ...t, id: t.id }))}
        activeTab={distTab}
        onChange={(id) => setDistTab(id as typeof distTab)}
        variant="pills"
      />
      
      <div className="flex-1 min-h-0 overflow-hidden">
        <React.Suspense fallback={<SkeletonPage contentCards={3} />}>
          {distTab === 'deals' && <DealsDesk />}
          {distTab === 'streaming' && <StreamingPanel />}
          {distTab === 'nielsen' && <NielsenDashboard />}
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
      label: 'Slate', 
      badge: badgeCounts.slate,
      description: 'Active projects from development through release'
    },
    { 
      id: 'development', 
      label: 'Development', 
      badge: badgeCounts.development,
      description: 'Script development and greenlight queue'
    },
    { 
      id: 'distribution', 
      label: 'Distribution', 
      badge: badgeCounts.distribution,
      description: 'Active deals, streaming, and TV ratings'
    },
    { 
      id: 'catalog', 
      label: 'Catalog', 
      badge: badgeCounts.catalog,
      description: 'Released projects, IP vault, and franchises'
    },
  ];
  
  const getHeaderContent = () => {
    switch (activeSubTab) {
      case 'slate':
        return {
          icon: <LayoutGrid className="h-6 w-6 text-primary" />,
          title: 'Production Slate',
          subtitle: 'Active projects from development through release',
          action: (
            <Button 
              onClick={openCreateProject}
              className="h-9 px-4 font-display font-black uppercase tracking-widest text-[10px] gap-2"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          )
        };
      case 'development':
        return {
          icon: <Film className="h-6 w-6 text-secondary" />,
          title: 'Development Queue',
          subtitle: 'Script development and greenlight review',
          action: null
        };
      case 'distribution':
        return {
          icon: <Globe className="h-6 w-6 text-primary" />,
          title: 'Distribution Hub',
          subtitle: 'Deals desk, streaming platforms, and Nielsen ratings',
          action: null
        };
      case 'catalog':
        return {
          icon: <Library className="h-6 w-6 text-secondary" />,
          title: 'IP Catalog & Vault',
          subtitle: 'Released projects, franchises, and library rights',
          action: null
        };
      default:
        return { icon: null, title: '', subtitle: '', action: null };
    }
  };
  
  const header = getHeaderContent();
  
  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Unified Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white/5 to-transparent p-5 rounded-xl border border-white/5 backdrop-blur-md mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
            {header.icon}
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">{header.title}</h2>
            <p className="text-[11px] font-black uppercase text-muted-foreground/60 tracking-[0.2em] mt-1">
              {header.subtitle}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {header.action}
          <div className="hidden lg:block relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Filter..."
              className="w-full h-9 pl-9 pr-3 text-[11px] bg-black/40 border border-white/10 rounded-md uppercase font-bold tracking-wider focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>
      </div>
      
      {/* Sub Navigation */}
      <div className="mb-4">
        <SubNav 
          tabs={tabs}
          activeTab={activeSubTab}
          onChange={(id) => setActiveSubTab(id as ProductionSubTab)}
          variant="pills"
        />
      </div>
      
      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <React.Suspense fallback={<SkeletonPage contentCards={3} />}>
          {activeSubTab === 'slate' && <PipelineBoard />}
          {activeSubTab === 'development' && <DevelopmentPanel />}
          {activeSubTab === 'distribution' && <DistributionPanel />}
          {activeSubTab === 'catalog' && <IPVault />}
        </React.Suspense>
      </div>
    </div>
  );
};

export default ProductionHub;

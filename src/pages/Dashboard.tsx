import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { TopBar } from '@/components/layout/TopBar';
import { StudioSidebar } from '@/components/layout/StudioSidebar';
import { QuickActionsDock } from '@/components/layout/QuickActionsDock';
import { CommandPalette, useCommandPalette } from '@/components/navigation/CommandPalette';
import { SkeletonPage } from '@/components/shared/SkeletonCard';
import { PageTransition } from '@/components/layout/PageTransition';
import { m, AnimatePresence } from 'framer-motion';

// New 4-Hub Architecture (Phase 1)
const StudioHQ = React.lazy(() => import('@/components/hubs/StudioHQ').then(m => ({ default: m.StudioHQ })));
const ProductionHub = React.lazy(() => import('@/components/hubs/ProductionHub').then(m => ({ default: m.ProductionHub })));
const TalentHub = React.lazy(() => import('@/components/hubs/TalentHub').then(m => ({ default: m.TalentHub })));
const IntelligenceHub = React.lazy(() => import('@/components/hubs/IntelligenceHub').then(m => ({ default: m.IntelligenceHub })));

// Legacy panels for backward compatibility during transition
const CommandCenter = React.lazy(() => import('@/components/dashboard/CommandCenter').then(m => ({ default: m.CommandCenter })));
const PipelineBoard = React.lazy(() => import('@/components/pipeline/PipelineBoard').then(m => ({ default: m.PipelineBoard })));
const FinancePanel = React.lazy(() => import('@/components/finance/FinancePanel').then(m => ({ default: m.FinancePanel })));
const DiscoveryBoard = React.lazy(() => import('@/components/discovery/DiscoveryBoard').then(m => ({ default: m.DiscoveryBoard })));
const IndustryPage = React.lazy(() => import('@/pages/IndustryPage').then(m => ({ default: m.IndustryPage })));
const IPVault = React.lazy(() => import('@/components/ip/IPVault').then(m => ({ default: m.IPVault })));
const DistributionHub = React.lazy(() => import('@/components/distribution/DistributionHub').then(m => ({ default: m.DistributionHub })));
const AwardsHQ = React.lazy(() => import('@/components/awards/AwardsHQ').then(m => ({ default: m.AwardsHQ })));

// Modals & Overlays
import { ModalManager } from '@/components/modals/ModalManager';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { PitchProjectModal } from '@/components/modals/PitchProjectModal';

const Dashboard: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);
  const { activeHub, activeTab } = useUIStore();
  const devAutoInit = useGameStore(s => s.devAutoInit);
  const searchParams = new URLSearchParams(window.location.search);
  const isAutoStarting = searchParams.get('autoStart') === 'true';

  React.useEffect(() => {
    if (!gameState && isAutoStarting) {
      devAutoInit();
    }
  }, [gameState, isAutoStarting, devAutoInit]);

  if (!gameState && !isAutoStarting) return <Navigate to="/" />;
  if (!gameState) return <div className="flex items-center justify-center h-screen font-sans">Initializing Studio...</div>;

  // New 4-Hub render system (Phase 1)
  const renderHubContent = () => {
    switch (activeHub) {
      case 'hq': return <StudioHQ key="hq" />;
      case 'production': return <ProductionHub key="production" />;
      case 'talent': return <TalentHub key="talent" />;
      case 'intelligence': return <IntelligenceHub key="intelligence" />;
      default: return <StudioHQ key="default" />;
    }
  };

  // Legacy render system for backward compatibility (fallback)
  const renderLegacyContent = () => {
    switch (activeTab) {
      case 'command': 
      case 'hq': return <CommandCenter key="command" />;
      case 'pipeline': 
      case 'production': return <PipelineBoard key="pipeline" />;
      case 'ip': return <IPVault key="ip" />;
      case 'distribution': return <DistributionHub key="distribution" />;
      case 'industry': 
      case 'intelligence': return <IndustryPage key="industry" />;
      case 'talent': return <TalentHub key="talent" />;
      case 'finance': return <FinancePanel key="finance" />;
      case 'trades': return <DiscoveryBoard key="trades" />;
      case 'awards': return <AwardsHQ key="awards" />;
      default: return <CommandCenter key="default" />;
    }
  };
  
  // Use new hub system when available, fallback to legacy for edge cases
  const renderContent = () => {
    // If activeHub is set to a new hub, use new system
    if (['hq', 'production', 'talent', 'intelligence'].includes(activeHub)) {
      return renderHubContent();
    }
    // Fallback to legacy for any edge cases during transition
    return renderLegacyContent();
  };

  return (
    <div className="flex bg-background min-h-screen text-foreground font-sans overflow-hidden">
      <StudioSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden overflow-y-auto relative custom-scrollbar">
        <TopBar />
        <main className="flex-1 w-full bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6 lg:p-8 relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
          <div className="container mx-auto max-w-[1600px] h-full flex flex-col">
            <AnimatePresence mode="wait">
              <m.div
                key={activeHub}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="h-full flex flex-col"
              >
                <React.Suspense fallback={<SkeletonPage headerRows={2} contentCards={4} />}>
                  {renderContent()}
                </React.Suspense>
              </m.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      
      <CreateProjectModal />
      <ProjectDetailModal />
      <PitchProjectModal />
      
      {/* Global UI Components */}
      <ModalManager />
      <CommandPaletteWrapper />
      <QuickActionsDock />
    </div>
  );
};

// CommandPalette wrapper with hook
const CommandPaletteWrapper: React.FC = () => {
  const { isOpen, close } = useCommandPalette();
  return <CommandPalette isOpen={isOpen} onClose={close} />;
};

export default Dashboard;

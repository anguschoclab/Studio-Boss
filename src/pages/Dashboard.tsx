import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { TopBar } from '@/components/layout/TopBar';
import { StudioSidebar } from '@/components/layout/StudioSidebar';
import { CommandCenter } from '@/components/dashboard/CommandCenter';
import { PipelineBoard } from '@/components/pipeline/PipelineBoard';
import { TalentHub } from '@/components/talent/TalentHub';
import { FinancePanel } from '@/components/finance/FinancePanel';
import { DiscoveryBoard } from '@/components/discovery/DiscoveryBoard';
import { RivalsPanel } from '@/components/rivals/RivalsPanel';
import { IPVault } from '@/components/ip/IPVault';
import { DistributionHub } from '@/components/distribution/DistributionHub';
import { AnimatePresence, motion } from 'framer-motion';

// Lazy Loaded Panels
const PipelineBoard = React.lazy(() => import('@/components/pipeline/PipelineBoard').then(m => ({ default: m.PipelineBoard })));
const TalentPanel = React.lazy(() => import('@/components/talent/TalentPanel').then(m => ({ default: m.TalentPanel })));
const FinancePanel = React.lazy(() => import('@/components/finance/FinancePanel').then(m => ({ default: m.FinancePanel })));
const DiscoveryBoard = React.lazy(() => import('@/components/discovery/DiscoveryBoard').then(m => ({ default: m.DiscoveryBoard })));
const RivalsPanel = React.lazy(() => import('@/components/rivals/RivalsPanel').then(m => ({ default: m.RivalsPanel })));
const IPVault = React.lazy(() => import('@/components/ip/IPVault').then(m => ({ default: m.IPVault })));
const DealsDesk = React.lazy(() => import('@/components/deals/DealsDesk').then(m => ({ default: m.DealsDesk })));
const SBDBView = React.lazy(() => import('@/components/sbdb/SBDBView').then(m => ({ default: m.SBDBView })));
const StreamingPanel = React.lazy(() => import('@/components/streaming/StreamingPanel').then(m => ({ default: m.StreamingPanel })));
const NielsenDashboard = React.lazy(() => import('@/components/television/NielsenDashboard').then(m => ({ default: m.NielsenDashboard })));
import { m, AnimatePresence } from 'framer-motion';

// Modals & Overlays
import { ModalManager } from '@/components/modals/ModalManager';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { PitchProjectModal } from '@/components/modals/PitchProjectModal';

const Dashboard: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);
  const { activeTab } = useUIStore();
  const devAutoInit = useGameStore(s => s.devAutoInit);
  const searchParams = new URLSearchParams(window.location.search);
  const isAutoStarting = searchParams.get('autoStart') === 'true';

  React.useEffect(() => {
    if (!gameState && isAutoStarting) {
      console.log('[Dashboard] Auto-starting game...');
      devAutoInit();
    }
  }, [gameState, isAutoStarting, devAutoInit]);

  if (!gameState && !isAutoStarting) return <Navigate to="/" />;
  if (!gameState) return <div className="flex items-center justify-center h-screen font-sans">Initializing Studio...</div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'command': return <CommandCenter key="command" />;
      case 'pipeline': return <PipelineBoard key="pipeline" />;
      case 'ip': return <IPVault key="ip" />;
      case 'distribution': return <DistributionHub key="distribution" />;
      case 'industry': return <RivalsPanel key="industry" />;
      case 'talent': return <TalentHub key="talent" />;
      case 'finance': return <FinancePanel key="finance" />;
      case 'trades': return <DiscoveryBoard key="trades" />;
      default: return <CommandCenter key="default" />;
    }
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
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="h-full flex flex-col"
              >
                <React.Suspense fallback={<div className="flex items-center justify-center h-64 opacity-50 font-display uppercase tracking-widest text-xs">Loading Sub-System...</div>}>
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
    </div>
  );
};

export default Dashboard;

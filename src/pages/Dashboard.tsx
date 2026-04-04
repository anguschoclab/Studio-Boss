import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { TopBar } from '@/components/layout/TopBar';
import { StudioSidebar } from '@/components/layout/StudioSidebar';
import { CommandCenter } from '@/components/dashboard/CommandCenter';
import { PipelineBoard } from '@/components/pipeline/PipelineBoard';
import { TalentPanel } from '@/components/talent/TalentPanel';
import { FinancePanel } from '@/components/finance/FinancePanel';
import { DiscoveryBoard } from '@/components/discovery/DiscoveryBoard';
import { RivalsPanel } from '@/components/rivals/RivalsPanel';
import { IPVault } from '@/components/ip/IPVault';
import { DealsDesk } from '@/components/deals/DealsDesk';
import { SBDBView } from '@/components/sbdb/SBDBView';
import { StreamingPanel } from '@/components/streaming/StreamingPanel';
import { NielsenDashboard } from '@/components/television/NielsenDashboard';
import { AnimatePresence, motion } from 'framer-motion';

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
      case 'deals': return <DealsDesk key="deals" />;
      case 'industry': return <RivalsPanel key="industry" />;
      case 'talent': return <TalentPanel key="talent" />;
      case 'finance': return <FinancePanel key="finance" />;
      case 'trades': return <DiscoveryBoard key="trades" />;
      case 'sbdb': return <SBDBView key="sbdb" />;
      case 'streaming': return <StreamingPanel key="streaming" />;
      case 'nielsen': return <NielsenDashboard key="nielsen" />;
      default: return <CommandCenter key="default" />;
    }
  };

  return (
    <div className="flex bg-background min-h-screen text-foreground font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <StudioSidebar />
      
      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden overflow-y-auto relative custom-scrollbar">
        {/* Condensed Status Bar */}
        <TopBar />
        
        {/* Central Component View Area */}
        <main className="flex-1 w-full bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6 lg:p-8 relative">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

          <div className="container mx-auto max-w-[1600px] h-full flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="h-full flex flex-col"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      
      {/* Modals & Overlays */}
      <ModalManager />
      <CreateProjectModal />
      <ProjectDetailModal />
      <PitchProjectModal />
    </div>
  );
};

export default Dashboard;

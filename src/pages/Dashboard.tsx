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
import { BookmarksBoard } from '@/components/bookmarks/BookmarksBoard';
import { AnimatePresence, motion } from 'framer-motion';

// Modals
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { WeekSummaryModal } from '@/components/modals/WeekSummaryModal';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { PitchProjectModal } from '@/components/modals/PitchProjectModal';
import { CrisisModal } from '@/components/modals/CrisisModal';
import { AwardsCeremonyModal } from '@/components/modals/AwardsCeremonyModal';
import { GreenlightDecisionModal } from '@/components/modals/GreenlightDecisionModal';
import { SettingsModal } from '@/components/modals/SettingsModal';

import { TabId } from '@/store/uiStore';
import { useSettingsStore } from '@/store/settingsStore';

const TAB_CONTENT: Record<TabId, React.ReactNode> = {
  command: <CommandCenter key="command" />,
  pipeline: <PipelineBoard key="pipeline" />,
  ip: <IPVault key="ip" />,
  distribution: <DistributionHub key="distribution" />,
  industry: <RivalsPanel key="industry" />,
  talent: <TalentHub key="talent" />,
  finance: <FinancePanel key="finance" />,
  trades: <DiscoveryBoard key="trades" />,
  bookmarks: <BookmarksBoard key="bookmarks" />,
};

const Dashboard: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);
  const { activeTab, showSettings, setShowSettings } = useUIStore();
  const reduceMotion = useSettingsStore(s => s.reduceMotion);
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

  const renderContent = () => TAB_CONTENT[activeTab] || <CommandCenter key="default" />;

  return (
    <div className="flex bg-background min-h-screen text-foreground font-sans overflow-hidden">
      <StudioSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden overflow-y-auto relative custom-scrollbar">
        <TopBar />
        <main className="flex-1 w-full bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6 lg:p-8 relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-none blur-[150px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-none blur-[120px] -z-10 pointer-events-none" />
          <div className="container mx-auto max-w-[1600px] h-full flex flex-col">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -20 }}
                transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeInOut" }}
                className="h-full flex flex-col"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      
      <CreateProjectModal />
      <WeekSummaryModal />
      <ProjectDetailModal />
      <PitchProjectModal />
      <CrisisModal />
      <AwardsCeremonyModal />
      <GreenlightDecisionModal />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default Dashboard;

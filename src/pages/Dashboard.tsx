import React, { Suspense, lazy } from "react";
import { Navigate } from "@tanstack/react-router";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { TopBar } from "@/components/layout/TopBar";
import { StudioSidebar } from "@/components/layout/StudioSidebar";
import { CommandCenter } from "@/components/dashboard/CommandCenter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnimatePresence, motion } from "framer-motion";

// Tab panels are lazy-loaded so the dashboard shell doesn't bundle every screen.
const PipelineBoard = lazy(() =>
  import("@/components/pipeline/PipelineBoard").then((m) => ({ default: m.PipelineBoard }))
);
const TalentHub = lazy(() =>
  import("@/components/talent/TalentHub").then((m) => ({ default: m.TalentHub }))
);
const FinancePanel = lazy(() =>
  import("@/components/finance/FinancePanel").then((m) => ({ default: m.FinancePanel }))
);
const DiscoveryBoard = lazy(() =>
  import("@/components/discovery/DiscoveryBoard").then((m) => ({ default: m.DiscoveryBoard }))
);
const RivalsPanel = lazy(() =>
  import("@/components/rivals/RivalsPanel").then((m) => ({ default: m.RivalsPanel }))
);
const IPVault = lazy(() => import("@/components/ip/IPVault").then((m) => ({ default: m.IPVault })));
const DistributionHub = lazy(() =>
  import("@/components/distribution/DistributionHub").then((m) => ({ default: m.DistributionHub }))
);
const BookmarksBoard = lazy(() =>
  import("@/components/bookmarks/BookmarksBoard").then((m) => ({ default: m.BookmarksBoard }))
);
const AwardsHQ = lazy(() =>
  import("@/components/awards/AwardsHQ").then((m) => ({ default: m.AwardsHQ }))
);

// Modals
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { ProjectDetailModal } from "@/components/modals/ProjectDetailModal";
import { PitchProjectModal } from "@/components/modals/PitchProjectModal";
import { ModalManager } from "@/components/modals/ModalManager";
import { SettingsModal } from "@/components/modals/SettingsModal";

import { TabId } from "@/store/uiStore";
import { useSettingsStore } from "@/store/settingsStore";

const TAB_CONTENT: Record<TabId, React.ReactNode> = {
  command: <CommandCenter key="command" />,
  pipeline: <PipelineBoard key="pipeline" />,
  ip: <IPVault key="ip" />,
  distribution: <DistributionHub key="distribution" />,
  industry: <RivalsPanel key="industry" />,
  talent: <TalentHub key="talent" />,
  finance: <FinancePanel key="finance" />,
  trades: <DiscoveryBoard key="trades" />,
  awards: <AwardsHQ key="awards" />,
  bookmarks: <BookmarksBoard key="bookmarks" />,
};

const Dashboard: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const { activeTab, showSettings, setShowSettings } = useUIStore();
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const devAutoInit = useGameStore((s) => s.devAutoInit);
  const searchParams = new URLSearchParams(window.location.search);
  const isAutoStarting = searchParams.get("autoStart") === "true";

  React.useEffect(() => {
    if (!gameState && isAutoStarting) {
      devAutoInit();
    }
  }, [gameState, isAutoStarting, devAutoInit]);

  if (!gameState && !isAutoStarting) return <Navigate to="/" />;
  if (!gameState)
    return (
      <div className="flex items-center justify-center h-screen font-sans">
        Initializing Studio...
      </div>
    );

  const renderContent = () => (
    <Suspense fallback={null}>{TAB_CONTENT[activeTab] || <CommandCenter key="default" />}</Suspense>
  );

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
                <ErrorBoundary key={activeTab}>{renderContent()}</ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <CreateProjectModal />
      <ProjectDetailModal />
      <PitchProjectModal />
      <ModalManager />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default Dashboard;

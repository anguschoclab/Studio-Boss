import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { TopBar } from '@/components/layout/TopBar';
import { StudioSidebar } from '@/components/layout/StudioSidebar';
import { QuickActionsDock } from '@/components/layout/QuickActionsDock';
import { CommandPalette, useCommandPalette } from '@/components/navigation/CommandPalette';
import { SkeletonPage } from '@/components/shared/SkeletonCard';
import { m, AnimatePresence } from 'framer-motion';

// New 4-Hub Architecture (Phase 1)
const StudioHQ = React.lazy(() => import('@/components/hubs/StudioHQ').then(m => ({ default: m.StudioHQ })));
const ProductionHub = React.lazy(() => import('@/components/hubs/ProductionHub').then(m => ({ default: m.ProductionHub })));
const TalentHub = React.lazy(() => import('@/components/hubs/TalentHub').then(m => ({ default: m.TalentHub })));
const IntelligenceHub = React.lazy(() => import('@/components/hubs/IntelligenceHub').then(m => ({ default: m.IntelligenceHub })));


// Modals & Overlays
import { ModalManager } from '@/components/modals/ModalManager';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { PitchProjectModal } from '@/components/modals/PitchProjectModal';
import { AttachTalentModal } from '@/components/_unconnected/AttachTalentModal';

const Dashboard: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);
  const { activeHub } = useUIStore();
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

  const renderContent = () => {
    switch (activeHub) {
      case 'hq': return <StudioHQ key="hq" />;
      case 'production': return <ProductionHub key="production" />;
      case 'talent': return <TalentHub key="talent" />;
      case 'intelligence': return <IntelligenceHub key="intelligence" />;
      default: return <StudioHQ key="default" />;
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
      <AttachTalentModal />
      
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

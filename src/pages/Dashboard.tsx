import { Navigate } from '@tanstack/react-router';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { TopBar } from '@/components/layout/TopBar';
import { PipelineBoard } from '@/components/pipeline/PipelineBoard';
import { DiscoveryBoard } from '@/components/discovery/DiscoveryBoard';
import { FinancePanel } from '@/components/finance/FinancePanel';
import { TalentPanel } from '@/components/talent/TalentPanel';
import { NewsFeed } from '@/components/news/NewsFeed';
import { MediaPage } from '@/components/news/MediaPage';
import { RivalsPanel } from '@/components/rivals/RivalsPanel';
import { TrendBoard } from '@/components/trends/TrendBoard';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { WeekSummaryModal } from '@/components/modals/WeekSummaryModal';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { PitchProjectModal } from '@/components/modals/PitchProjectModal';
import { CrisisModal } from '@/components/modals/CrisisModal';
import { AwardsCeremonyModal } from '@/components/modals/AwardsCeremonyModal';

const Dashboard = () => {
  const gameState = useGameStore(s => s.gameState);
  const { activeTab, setActiveTab } = useUIStore();

  if (!gameState) return <Navigate to="/" replace />;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      <TopBar />
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Tab bar */}
          <div className="border-b border-border/60 px-8 flex gap-2 bg-background/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
            {(['discovery', 'pipeline', 'finance', 'talent', 'media'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-xs font-display font-black tracking-widest uppercase transition-all relative ${
                  activeTab === tab
                    ? 'text-primary text-shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                {tab === 'discovery' ? 'Discovery' : tab === 'pipeline' ? 'Project Slate' : tab === 'finance' ? 'Finances' : tab === 'talent' ? 'Talent Roster' : 'The Trades'}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(234,179,8,0.5)]" />
                )}
              </button>
            ))}
          </div>

          <div className="p-8 pb-16">
            {activeTab === 'discovery' ? <DiscoveryBoard /> : activeTab === 'pipeline' ? <PipelineBoard /> : activeTab === 'finance' ? <FinancePanel /> : activeTab === 'talent' ? <TalentPanel /> : <MediaPage />}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 2xl:w-96 border-l border-border/50 bg-background/40 backdrop-blur-md overflow-y-auto flex flex-col custom-scrollbar shadow-[-4px_0_24px_-8px_rgba(0,0,0,0.2)]">
          <div className="flex-1 overflow-y-auto pb-8">
            <NewsFeed />
            <div className="p-5 grid gap-5">
              <TrendBoard />
              <RivalsPanel />
            </div>
          </div>
        </aside>
      </div>

      {/* Modals */}
      <CreateProjectModal />
      <WeekSummaryModal />
      <ProjectDetailModal />
      <PitchProjectModal />
      <CrisisModal />
      <AwardsCeremonyModal />
    </div>
  );
};

export default Dashboard;

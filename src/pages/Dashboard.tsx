import { Navigate } from '@tanstack/react-router';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { TopBar } from '@/components/layout/TopBar';
import { PipelineBoard } from '@/components/pipeline/PipelineBoard';
import { DiscoveryBoard } from '@/components/discovery/DiscoveryBoard';
import { FinancePanel } from '@/components/finance/FinancePanel';
import { TalentPanel } from '@/components/talent/TalentPanel';
import { NewsFeed } from '@/components/news/NewsFeed';
import { RivalsPanel } from '@/components/rivals/RivalsPanel';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { WeekSummaryModal } from '@/components/modals/WeekSummaryModal';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { PitchProjectModal } from '@/components/modals/PitchProjectModal';

const Dashboard = () => {
  const gameState = useGameStore(s => s.gameState);
  const { activeTab, setActiveTab } = useUIStore();

  if (!gameState) return <Navigate to="/" replace />;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Tab bar */}
          <div className="border-b border-border px-6 flex gap-1 bg-card/50">
            {(['discovery', 'pipeline', 'finance', 'talent'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-display font-semibold tracking-wide uppercase transition-colors relative ${
                  activeTab === tab
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'discovery' ? 'Discovery' : tab === 'pipeline' ? 'Project Slate' : tab === 'finance' ? 'Finances' : 'Talent Roster'}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'discovery' ? <DiscoveryBoard /> : activeTab === 'pipeline' ? <PipelineBoard /> : activeTab === 'finance' ? <FinancePanel /> : <TalentPanel />}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 border-l border-border bg-card/30 overflow-y-auto flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <NewsFeed />
            <RivalsPanel />
          </div>
        </aside>
      </div>

      {/* Modals */}
      <CreateProjectModal />
      <WeekSummaryModal />
      <ProjectDetailModal />
      <PitchProjectModal />
    </div>
  );
};

export default Dashboard;

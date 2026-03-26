import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { TopBar } from '@/components/layout/TopBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommandCenter } from '@/components/dashboard/CommandCenter';
import { PipelineBoard } from '@/components/pipeline/PipelineBoard';
import { TalentPanel } from '@/components/talent/TalentPanel';
import { FinancePanel } from '@/components/finance/FinancePanel';
import { DiscoveryBoard } from '@/components/discovery/DiscoveryBoard';
import { Card } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Film, 
  Library, 
  Handshake, 
  Users, 
  Briefcase, 
  Newspaper 
} from 'lucide-react';

// Modals
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { WeekSummaryModal } from '@/components/modals/WeekSummaryModal';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { PitchProjectModal } from '@/components/modals/PitchProjectModal';
import { CrisisModal } from '@/components/modals/CrisisModal';
import { AwardsCeremonyModal } from '@/components/modals/AwardsCeremonyModal';

const Dashboard: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);
  const { activeTab, setActiveTab } = useUIStore();

  if (!gameState) return <Navigate to="/" replace />;

  const { studio } = gameState;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      <TopBar />
      
      <main className="flex-1 overflow-auto bg-gradient-to-b from-background to-muted/20 custom-scrollbar">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-[1600px] h-full flex flex-col">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl text-foreground">
                {studio.name}
              </h1>
              <p className="text-muted-foreground mt-1">Executive Dashboard</p>
            </div>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as any)}
            className="flex-1 flex flex-col"
          >
            {/* The Widget-y Tab List */}
            <div className="overflow-x-auto pb-2 mb-4 scrollbar-none">
              <TabsList className="bg-card/50 border border-muted p-1 h-auto rounded-lg inline-flex shadow-sm">
                <TabsTrigger value="command" className="py-2.5 px-4 data-[state=active]:shadow-sm rounded-md flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" /> <span className="hidden sm:inline">Command Center</span>
                </TabsTrigger>
                <TabsTrigger value="pipeline" className="py-2.5 px-4 data-[state=active]:shadow-sm rounded-md flex items-center gap-2">
                  <Film className="h-4 w-4" /> <span className="hidden sm:inline">Pipeline</span>
                </TabsTrigger>
                <TabsTrigger value="ip" className="py-2.5 px-4 data-[state=active]:shadow-sm rounded-md flex items-center gap-2">
                  <Library className="h-4 w-4" /> <span className="hidden sm:inline">IP Vault</span>
                </TabsTrigger>
                <TabsTrigger value="deals" className="py-2.5 px-4 data-[state=active]:shadow-sm rounded-md flex items-center gap-2">
                  <Handshake className="h-4 w-4" /> <span className="hidden sm:inline">Deals Desk</span>
                </TabsTrigger>
                <TabsTrigger value="talent" className="py-2.5 px-4 data-[state=active]:shadow-sm rounded-md flex items-center gap-2">
                  <Users className="h-4 w-4" /> <span className="hidden sm:inline">Talent</span>
                </TabsTrigger>
                <TabsTrigger value="finance" className="py-2.5 px-4 data-[state=active]:shadow-sm rounded-md flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> <span className="hidden sm:inline">Finance</span>
                </TabsTrigger>
                <TabsTrigger value="trades" className="py-2.5 px-4 data-[state=active]:shadow-sm rounded-md flex items-center gap-2">
                  <Newspaper className="h-4 w-4" /> <span className="hidden sm:inline">The Trades</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 relative">
              <TabsContent value="command" className="m-0 h-full focus-visible:outline-none focus-visible:ring-0">
                <CommandCenter />
              </TabsContent>

              <TabsContent value="pipeline" className="m-0 h-full focus-visible:outline-none focus-visible:ring-0">
                 <PipelineBoard />
              </TabsContent>

              <TabsContent value="ip" className="m-0 h-full focus-visible:outline-none focus-visible:ring-0">
                 <Card className="h-full border-dashed border-2 bg-muted/10 flex items-center justify-center">
                   <div className="text-center p-12">
                     <Library className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                     <h3 className="text-lg font-medium">IP Vault (In Construction)</h3>
                     <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">Manage your franchises, spinoffs, and merchandising rights here.</p>
                   </div>
                 </Card>
              </TabsContent>

              <TabsContent value="deals" className="m-0 h-full focus-visible:outline-none focus-visible:ring-0">
                <Card className="h-full border-dashed border-2 bg-muted/10 flex items-center justify-center">
                   <div className="text-center p-12">
                     <Handshake className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                     <h3 className="text-lg font-medium">Deals Desk (In Construction)</h3>
                     <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">Negotiate distribution, handle bidding wars, and submit to festivals.</p>
                   </div>
                 </Card>
              </TabsContent>

              <TabsContent value="talent" className="m-0 h-full focus-visible:outline-none focus-visible:ring-0">
                <TalentPanel />
              </TabsContent>

              <TabsContent value="finance" className="m-0 h-full focus-visible:outline-none focus-visible:ring-0">
                 <FinancePanel />
              </TabsContent>

              <TabsContent value="trades" className="m-0 h-full focus-visible:outline-none focus-visible:ring-0">
                 <DiscoveryBoard />
              </TabsContent>
            </div>
          </Tabs>

        </div>
      </main>
      
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

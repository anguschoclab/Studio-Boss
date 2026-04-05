import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DealsDesk } from '@/components/deals/DealsDesk';
import { StreamingPanel } from '@/components/streaming/StreamingPanel';
import { NielsenDashboard } from '@/components/television/NielsenDashboard';
import { Handshake, Tv, BarChart3, Globe } from 'lucide-react';

export const DistributionHub: React.FC = () => {
  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Globe className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Distribution</h2>
          <p className="text-[11px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">Deals • Streaming Platforms • TV Ratings</p>
        </div>
      </div>

      <Tabs defaultValue="deals" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-fit bg-muted/30 border border-border/40 mb-4">
          <TabsTrigger value="deals" className="gap-2 text-xs font-bold uppercase tracking-wider">
            <Handshake className="h-3.5 w-3.5" /> Deals Desk
          </TabsTrigger>
          <TabsTrigger value="streaming" className="gap-2 text-xs font-bold uppercase tracking-wider">
            <Tv className="h-3.5 w-3.5" /> Streaming
          </TabsTrigger>
          <TabsTrigger value="nielsen" className="gap-2 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="h-3.5 w-3.5" /> Nielsen Ratings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="flex-1 overflow-hidden mt-0">
          <DealsDesk />
        </TabsContent>

        <TabsContent value="streaming" className="flex-1 overflow-hidden mt-0">
          <StreamingPanel />
        </TabsContent>

        <TabsContent value="nielsen" className="flex-1 overflow-hidden mt-0">
          <NielsenDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

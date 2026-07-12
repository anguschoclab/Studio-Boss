import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DealsDesk } from "@/components/deals/DealsDesk";
import { StreamingPanel } from "@/components/streaming/StreamingPanel";
import { NielsenDashboard } from "@/components/television/NielsenDashboard";
import { Handshake, Tv, BarChart3, Globe } from "lucide-react";

export const DistributionHub: React.FC = () => {
  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12 pb-20">
      {/* Executive Distribution Header */}
      <div className="flex items-center gap-10 border-b border-white/5 pb-12">
        <div className="w-20 h-20 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.15)]">
          <Globe className="h-10 w-10 text-primary" strokeWidth={1} />
        </div>
        <div className="space-y-3">
          <h2 className="text-7xl font-display font-black tracking-tighter uppercase italic leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            DISTRIBUTION
          </h2>
          <p className="text-[10px] font-black uppercase text-muted-foreground/20 tracking-[0.5em] italic flex items-center gap-4">
            DEALS
            <span className="w-1.5 h-1.5 bg-white/10" />
            STREAMING PLATFORMS
            <span className="w-1.5 h-1.5 bg-white/10" />
            TV RATINGS
          </p>
        </div>
      </div>

      <Tabs defaultValue="deals" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-fit bg-white/[0.02] border border-white/5 mb-12 p-1 h-16 rounded-none">
          <TabsTrigger
            value="deals"
            className="gap-6 h-14 px-12 font-display font-black uppercase tracking-[0.3em] text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-700 rounded-none italic"
          >
            <Handshake className="h-4 w-4" /> DEALS DESK
          </TabsTrigger>
          <TabsTrigger
            value="streaming"
            className="gap-6 h-14 px-12 font-display font-black uppercase tracking-[0.3em] text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-700 rounded-none italic"
          >
            <Tv className="h-4 w-4" /> STREAMING
          </TabsTrigger>
          <TabsTrigger
            value="nielsen"
            className="gap-6 h-14 px-12 font-display font-black uppercase tracking-[0.3em] text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-700 rounded-none italic"
          >
            <BarChart3 className="h-4 w-4" /> NIELSEN RATINGS
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="deals"
          className="flex-1 overflow-hidden mt-0 outline-none animate-in fade-in duration-1000"
        >
          <DealsDesk />
        </TabsContent>

        <TabsContent
          value="streaming"
          className="flex-1 overflow-hidden mt-0 outline-none animate-in fade-in duration-1000"
        >
          <StreamingPanel />
        </TabsContent>

        <TabsContent
          value="nielsen"
          className="flex-1 overflow-hidden mt-0 outline-none animate-in fade-in duration-1000"
        >
          <NielsenDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

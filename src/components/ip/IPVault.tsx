import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Library, Archive, ShieldCheck, Target, Zap } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { FranchiseHub } from './FranchiseHub';
import { IPAssetCard } from './IPAssetCard';

export const IPVault = () => {
  const rawIpState = useGameStore(useShallow(s => s.gameState?.ip));
  const ipState = React.useMemo(() => rawIpState || { vault: [], franchises: {} }, [rawIpState]);
  const franchises = Object.values(ipState.franchises);
  
  const { ownedIP, syndicatedIP, marketIP } = React.useMemo(() => {
    const vault = ipState.vault || [];
    const owned = vault.filter(a => a.rightsOwner === 'STUDIO');
    const syndicated = vault.filter(a => a.syndicationStatus === 'SYNDICATED' && a.rightsOwner === 'STUDIO');
    const market = vault.filter(a => a.rightsOwner === 'MARKET');
    
    return {
      ownedIP: owned,
      syndicatedIP: syndicated,
      marketIP: market
    };
  }, [ipState]);

  return (
    <div className="h-full flex flex-col space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      {/* Vault Command Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 bg-white/[0.02] p-10 rounded-none border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[120px] -mr-32 -mt-32" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 rounded-none bg-secondary/5 border border-secondary/20 flex items-center justify-center shadow-[0_0_30px_rgba(var(--secondary),0.1)]">
              <Archive className="h-8 w-8 text-secondary" strokeWidth={1} />
            </div>
            <div>
              <h2 className="text-6xl font-display font-black tracking-tighter uppercase italic leading-none mb-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">IP VAULT & CATALOG</h2>
              <p className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-[0.5em] italic flex items-center gap-4">
                INTELLECTUAL PROPERTY SURVEILLANCE
                <span className="w-1.5 h-1.5 bg-white/10" />
                {ipState.vault.length} ASSETS REGISTERED
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 relative z-10">
          <div className="bg-primary/5 border border-primary/20 text-primary px-8 py-4 rounded-none flex flex-col gap-1 shadow-[0_0_20px_rgba(var(--primary),0.05)] min-w-[200px]">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">UNIVERSES</span>
            <span className="text-2xl font-display font-black italic leading-none">{franchises.length} SHARED</span>
          </div>
          <div className="bg-secondary/5 border border-secondary/20 text-secondary px-8 py-4 rounded-none flex flex-col gap-1 shadow-[0_0_20px_rgba(var(--secondary),0.05)] min-w-[200px]">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">INVENTORY</span>
            <span className="text-2xl font-display font-black italic leading-none">{ownedIP.length} OWNED</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="franchises" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-white/[0.02] border border-white/10 p-1 self-start mb-10 rounded-none h-14">
          <TabsTrigger value="franchises" className="text-[10px] uppercase font-black tracking-[0.3em] italic px-10 h-12 rounded-none data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-700">
            FRANCHISE HUB
          </TabsTrigger>
          <TabsTrigger value="owned" className="text-[10px] uppercase font-black tracking-[0.3em] italic px-10 h-12 rounded-none data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all duration-700">
            OWNED INVENTORY
          </TabsTrigger>
          <TabsTrigger value="market" className="text-[10px] uppercase font-black tracking-[0.3em] italic px-10 h-12 rounded-none data-[state=active]:bg-secondary data-[state=active]:text-black transition-all duration-700">
            MARKET RIGHTS
          </TabsTrigger>
          <TabsTrigger value="syndicated" className="text-[10px] uppercase font-black tracking-[0.3em] italic px-10 h-12 rounded-none data-[state=active]:bg-primary data-[state=active]:text-black transition-all duration-700">
            SYNDICATION
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 pr-6 custom-scrollbar">
          <TabsContent value="franchises" className="mt-0 outline-none animate-in fade-in duration-1000">
             <FranchiseHub />
          </TabsContent>

          <TabsContent value="owned" className="mt-0 space-y-12 pb-20 outline-none animate-in fade-in duration-1000">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {ownedIP.length === 0 ? (
                <EmptyVault message="THE VAULT IS CURRENTLY EMPTY. ASSETS ENTER HERE AFTER THEIR RELEASE WINDOWS CLOSE." />
              ) : (
                ownedIP.map(asset => <IPAssetCard key={asset.id} asset={asset} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="market" className="mt-0 outline-none animate-in fade-in duration-1000">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
              {marketIP.length === 0 ? (
                 <EmptyVault message="NO EXTERNAL IP RIGHTS ARE CURRENTLY AVAILABLE FOR ACQUISITION." />
              ) : (
                marketIP.map(asset => <IPAssetCard key={asset.id} asset={asset} isMarket />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="syndicated" className="mt-0 outline-none animate-in fade-in duration-1000">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
              {syndicatedIP.length === 0 ? (
                <EmptyVault message="NO TITLES HAVE REACHED THE HISTORICAL SYNDICATION MILESTONES." />
              ) : (
                syndicatedIP.map(asset => <IPAssetCard key={asset.id} asset={asset} />)
              )}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

const EmptyVault = ({ message }: { message: string }) => (
  <div className="col-span-full py-48 text-center glass-card border-none shadow-none bg-transparent opacity-20 flex flex-col items-center space-y-10">
    <div className="w-24 h-24 rounded-none border border-white/10 flex items-center justify-center">
      <Library className="w-12 h-12 text-muted-foreground" strokeWidth={1} />
    </div>
    <div className="space-y-4 px-12">
      <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.6em] italic">SECURE VAULT EMPTY</p>
      <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] max-w-[400px] mx-auto leading-relaxed italic">{message}</p>
    </div>
  </div>
);

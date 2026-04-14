import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Library, Archive } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { FranchiseHub } from './FranchiseHub';
import { IPAssetCard } from './IPAssetCard';

export const IPVault = () => {
  const gameState = useGameStore(useShallow(s => s.gameState));
  const ipState = React.useMemo(() => gameState?.ip || { vault: [], franchises: {} }, [gameState?.ip]);
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
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
      {/* Vault Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/5 p-5 rounded-xl border border-white/5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center">
              <Archive className="h-5 w-5 text-secondary" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Property Vault & Catalog</h2>
          </div>
          <p className="text-[11px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">Intellectual Property Protection • {ipState.vault.length} Total Assets</p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary uppercase font-black tracking-widest text-[9px] py-1">
            {franchises.length} Shared Universes
          </Badge>
          <Badge variant="outline" className="bg-secondary/5 border-secondary/20 text-secondary uppercase font-black tracking-widest text-[9px] py-1">
            {ownedIP.length} Owned Titles
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="franchises" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-white/5 border border-white/10 p-1 self-start mb-6">
          <TabsTrigger value="franchises" className="text-[10px] uppercase font-black tracking-widest px-6 h-8 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Franchise Hub ({franchises.length})
          </TabsTrigger>
          <TabsTrigger value="owned" className="text-[10px] uppercase font-black tracking-widest px-6 h-8 data-[state=active]:bg-white/10 data-[state=active]:text-white">
            Owned Inventory ({ownedIP.length})
          </TabsTrigger>
          <TabsTrigger value="market" className="text-[10px] uppercase font-black tracking-widest px-6 h-8 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500">
            Market Rights ({marketIP.length})
          </TabsTrigger>
          <TabsTrigger value="syndicated" className="text-[10px] uppercase font-black tracking-widest px-6 h-8 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-500">
            Syndication ({syndicatedIP.length})
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 pr-4">
          <TabsContent value="franchises" className="mt-0">
             <FranchiseHub />
          </TabsContent>

          <TabsContent value="owned" className="mt-0 space-y-10 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedIP.length === 0 ? (
                <EmptyVault message="The vault is currently empty. Assets enter here after their release windows close." />
              ) : (
                ownedIP.map(asset => <IPAssetCard key={asset.id} asset={asset} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="market" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketIP.length === 0 ? (
                 <EmptyVault message="No external IP rights are currently available for acquisition." />
              ) : (
                marketIP.map(asset => <IPAssetCard key={asset.id} asset={asset} isMarket />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="syndicated" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {syndicatedIP.length === 0 ? (
                <EmptyVault message="No titles have reached the historical syndication milestones." />
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
  <div className="col-span-full py-32 text-center glass-card border-none">
    <Library className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
    <p className="text-sm font-bold text-muted-foreground/30 uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">{message}</p>
  </div>
);

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Library, Star, TrendingUp, DollarSign, Award, Archive, Zap, History, Globe, Lock } from 'lucide-react';
import { formatMoney } from '@/engine/utils';
import { cn } from '@/lib/utils';
import { IPAsset } from '@/engine/types';
import { useShallow } from 'zustand/react/shallow';
import { FranchiseHub } from './FranchiseHub';

import { SYNDICATION_TIERS } from '@/engine/data/syndicationConfig';

export const IPVault = () => {
  const ipState = useGameStore(useShallow(s => s.gameState?.ip)) || { vault: [], franchises: {} };
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

const IPAssetCard = ({ asset, isMarket = false }: { asset: IPAsset, isMarket?: boolean }) => {
  const relevancePercent = asset.decayRate * 100;
  const tier = SYNDICATION_TIERS[asset.syndicationTier || 'NONE'];
  
  return (
    <Card className="glass-card border-none hover-glow group transition-all duration-300 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardContent className="p-6 flex flex-col h-full space-y-5 relative z-10">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
             <div className="flex items-center gap-2 mb-1">
               {asset.syndicationTier !== 'NONE' && (
                 <Badge 
                   style={{ backgroundColor: `${tier.color}20`, color: tier.color, borderColor: `${tier.color}30` }}
                   className="text-[8px] font-black uppercase tracking-widest px-1.5 h-4 border"
                 >
                    {tier.label}
                 </Badge>
               )}
               {isMarket && (
                 <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">
                    Open Rights
                 </Badge>
               )}
               {asset.syndicationTier === 'NONE' && asset.totalEpisodes > 40 && (
                 <Badge variant="outline" className="border-pink-500/30 text-pink-400 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">
                    Reboot Potential
                 </Badge>
               )}
             </div>
             <h4 className="text-lg font-black uppercase tracking-tighter truncate group-hover:text-primary transition-colors">{asset.title}</h4>
             <div className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest flex items-center gap-1.5 mt-0.5">
               <History className="h-2.5 w-2.5" /> {asset.totalEpisodes || 0} Episodes • Est. Catalog
             </div>
          </div>
          <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center">
            {isMarket ? <Globe className="h-5 w-5 text-amber-500/40" /> : <Lock className="h-5 w-5 text-primary/40" />}
          </div>
        </div>

        {/* Decay/Relevance Indicator */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
            <span>Cultural Relevance</span>
            <span className={relevancePercent < 20 ? 'text-red-500' : 'text-primary'}>{relevancePercent.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className={cn(
                "h-full transition-all duration-1000 rounded-full",
                relevancePercent < 20 ? 'bg-red-500' : (asset.syndicationTier !== 'NONE' ? 'bg-purple-500' : 'bg-primary')
              )} 
              style={{ width: `${relevancePercent}%` }}
            />
          </div>
        </div>


        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
           <div className="space-y-1">
             <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
               <DollarSign className="h-2.5 w-2.5 text-emerald-500" /> Weekly Revenue
             </div>
             <div className="text-sm font-black tracking-tight text-emerald-400">
               {formatMoney(Math.floor((asset.baseValue * asset.merchandisingMultiplier) * asset.decayRate))}
             </div>
           </div>
           <div className="space-y-1">
             <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
               <TrendingUp className="h-2.5 w-2.5 text-secondary" /> Equity Value
             </div>
             <div className="text-sm font-black tracking-tight">
               {formatMoney(asset.baseValue)}
             </div>
           </div>
        </div>

        {/* Interaction Footer */}
        <div className="pt-4 mt-auto border-t border-white/5 flex justify-between items-center">
           <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none">
             Rights expire week {asset.rightsExpirationWeek}
           </div>
           {isMarket && (
             <Button className="text-[9px] font-black bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-amber-950 border border-amber-500/20 h-7 rounded transition-all uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.1)] hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:-translate-y-0.5">
               Acquire & Reboot
             </Button>
           )}
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyVault = ({ message }: { message: string }) => (
  <div className="col-span-full py-32 text-center glass-card border-none">
    <Library className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
    <p className="text-sm font-bold text-muted-foreground/30 uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">{message}</p>
  </div>
);


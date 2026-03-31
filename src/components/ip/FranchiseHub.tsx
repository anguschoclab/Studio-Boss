import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Network, Zap, AlertTriangle, TrendingUp, Layers, Film, Tv, Play } from 'lucide-react';
import { formatMoney } from '@/engine/utils';
import { Franchise, IPAsset } from '@/engine/types';
import { useShallow } from 'zustand/react/shallow';

export const FranchiseHub = () => {
  const ipState = useGameStore(useShallow(s => s.gameState?.ip)) || { franchises: {}, vault: [] };
  const franchises = Object.values(ipState.franchises);

  if (franchises.length === 0) {
    return (
      <div className="py-24 text-center glass-card border-none">
        <Network className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
        <p className="text-sm font-bold text-muted-foreground/30 uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
          No Shared Universes established. Franchises are born when you sequelise or spinoff a successful IP.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
      {franchises.map(franchise => (
        <FranchiseCard 
          key={franchise.id} 
          franchise={franchise} 
          assets={ipState.vault.filter(a => a.franchiseId === franchise.id)} 
        />
      ))}
    </div>
  );
};

const FranchiseCard = ({ franchise, assets }: { franchise: Franchise, assets: IPAsset[] }) => {
  const fatiguePercent = (franchise.fatigueLevel || 0) * 100;
  const isFatigued = fatiguePercent > 40;
  const isDanger = fatiguePercent > 70;

  return (
    <Card className="glass-card border-none overflow-hidden group hover-glow transition-all duration-500">
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-b border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">
                  Shared Universe
                </Badge>
                {franchise.activeProjectIds.length > 0 && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">
                    {franchise.activeProjectIds.length} Active Productions
                  </Badge>
                )}
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter group-hover:text-primary transition-colors">
                {franchise.name}
              </h3>
              <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest mt-1">
                Founded Week {franchise.creationWeek} • {assets.length} Persistent Assets
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Layers className="h-6 w-6 text-primary" />
            </div>
          </div>

          {/* Equity & Revenue Stats */}
          <div className="grid grid-cols-2 gap-4 pb-2">
            <div className="space-y-1">
              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp className="h-2.5 w-2.5 text-secondary" /> Enterprise Value
              </div>
              <div className="text-xl font-black tracking-tighter text-white">
                {formatMoney(franchise.totalEquity)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="h-2.5 w-2.5 text-primary" /> Global Synergy
              </div>
              <div className="text-xl font-black tracking-tighter text-primary">
                x{franchise.synergyMultiplier.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Fatigue Meter */}
        <div className="p-6 border-b border-white/5 space-y-3">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-3 w-3 ${isFatigued ? 'text-amber-500' : 'text-muted-foreground/40'}`} />
              <span>Audience Fatigue</span>
            </div>
            <span className={isDanger ? 'text-red-500' : (isFatigued ? 'text-amber-500' : 'text-primary')}>
              {fatiguePercent.toFixed(0)}%
            </span>
          </div>
          <Progress 
            value={fatiguePercent} 
            className={`h-2 border border-white/5 ${isDanger ? 'bg-red-500' : (isFatigued ? 'bg-amber-500' : 'bg-primary')}`} 
          />
          <p className="text-[9px] font-medium text-muted-foreground/60 leading-relaxed italic">
            {isDanger 
              ? "CRITICAL: The audience is rejecting this brand. Market saturation is absolute. Reboot recommended."
              : isFatigued 
                ? "WARNING: Audience interest is waning. Consider diverse formats (TV/Animation) to pivot." 
                : "HEALTHY: The brand is thriving. Synergy from cross-format releases is high."
            }
          </p>
        </div>

        {/* Universe Assets Preview */}
        <div className="p-6 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Component Properties</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assets.slice(0, 4).map(asset => (
              <div key={asset.id} className="flex items-center gap-3 p-2 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center shrink-0">
                  {asset.totalEpisodes > 0 ? <Tv className="h-4 w-4 text-purple-400" /> : <Film className="h-4 w-4 text-blue-400" />}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-white truncate">{asset.title}</div>
                  <div className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">
                    {asset.syndicationTier !== 'NONE' ? asset.syndicationTier : 'Standard Catalog'}
                  </div>
                </div>
              </div>
            ))}
            {assets.length > 4 && (
              <div className="flex items-center justify-center p-2 rounded bg-white/5 border border-dashed border-white/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                + {assets.length - 4} more properties
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white/5 flex gap-3">
           <button className="flex-1 text-[10px] font-black bg-primary/20 hover:bg-primary text-primary hover:text-black border border-primary/20 p-2 rounded transition-all uppercase tracking-widest flex items-center justify-center gap-2 group">
             <Play className="h-3 w-3 fill-current" /> Exploit IP
           </button>
           <button className="flex-1 text-[10px] font-black bg-white/5 hover:bg-white/20 text-white border border-white/10 p-2 rounded transition-all uppercase tracking-widest">
             Deep Analytics
           </button>
        </div>
      </CardContent>
    </Card>
  );
};

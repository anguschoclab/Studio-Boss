import React, { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Buyer, StreamerPlatform, NetworkPlatform, PremiumPlatform } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tv, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertTriangle, 
  Building2, 
  ArrowRightLeft,
  Crown,
  Wifi,
  Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';

function formatSubscribers(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

const ARCHETYPE_CONFIG = {
  streamer: { icon: Wifi, label: 'Streamer', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  network: { icon: Radio, label: 'Network', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  premium: { icon: Crown, label: 'Premium', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
} as const;

const BuyerCard: React.FC<{ buyer: Buyer; allBuyers: Buyer[] }> = ({ buyer, allBuyers }) => {
  const config = ARCHETYPE_CONFIG[buyer.archetype];
  const Icon = config.icon;
  const isAcquired = !!buyer.acquiredBy;
  const acquirer = isAcquired ? allBuyers.find(b => b.id === buyer.acquiredBy) : null;
  const ownedPlatforms = (buyer.ownedPlatforms || []).map(id => allBuyers.find(b => b.id === id)).filter(Boolean);
  const strength = buyer.strength ?? 60;
  const cash = buyer.cash ?? 50_000_000;

  return (
    <div className={cn(
      "p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 space-y-4 group relative overflow-hidden",
      isAcquired 
        ? "border-muted/30 bg-muted/10 opacity-60" 
        : buyer.isAcquirable 
          ? "border-destructive/30 bg-destructive/5" 
          : strength > 75 
            ? "border-primary/30 bg-card/80 shadow-[0_0_20px_rgba(var(--primary),0.08)]" 
            : "border-border/40 bg-card/60",
      "hover:shadow-lg hover:-translate-y-0.5"
    )}>
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", config.bg, config.border)}>
            <Icon className={cn("w-5 h-5", config.color)} />
          </div>
          <div>
            <h3 className="font-display font-black text-[15px] tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors">
              {buyer.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="outline" className={cn("text-[8px] font-black tracking-widest uppercase px-1.5 py-0 h-4", config.border, config.color)}>
                {config.label}
              </Badge>
              {isAcquired && acquirer && (
                <Badge variant="outline" className="text-[8px] font-black tracking-widest uppercase px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground">
                  Owned by {acquirer.name}
                </Badge>
              )}
              {buyer.isAcquirable && !isAcquired && (
                <Badge variant="destructive" className="text-[8px] font-black tracking-widest uppercase px-1.5 py-0 h-4 bg-destructive/20 text-destructive border-destructive/30">
                  <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Vulnerable
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Mandate */}
        {buyer.currentMandate && (
          <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-widest bg-secondary/20 text-secondary-foreground/80 border border-secondary/20 shrink-0">
            {buyer.currentMandate.type.replace('_', ' ')}
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className={cn(
        "grid gap-3 text-xs pt-3 border-t border-border/30 relative z-10",
        buyer.archetype === 'streamer' ? 'grid-cols-4' : 'grid-cols-3'
      )}>
        {buyer.archetype === 'streamer' && (
          <div className="space-y-0.5">
            <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Subscribers</div>
            <div className="font-black text-foreground flex items-center gap-1">
              <Users className="w-3 h-3 text-violet-400" />
              {formatSubscribers((buyer as StreamerPlatform).subscribers)}
            </div>
          </div>
        )}
        {buyer.archetype === 'network' && (
          <div className="space-y-0.5">
            <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Reach</div>
            <div className="font-black text-foreground">{(buyer as NetworkPlatform).reach}</div>
          </div>
        )}
        {buyer.archetype === 'premium' && (
          <div className="space-y-0.5">
            <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Prestige Bonus</div>
            <div className="font-black text-foreground">+{(buyer as PremiumPlatform).prestigeBonus}</div>
          </div>
        )}
        <div className="space-y-0.5">
          <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Strength</div>
          <div className={cn("font-bold", strength > 70 ? 'text-success' : strength > 40 ? 'text-foreground' : 'text-destructive')}>
            {strength}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Treasury</div>
          <div className={cn("font-bold", cash > 30_000_000 ? 'text-success' : 'text-destructive')}>
            {formatMoney(cash)}
          </div>
        </div>
      </div>

      {/* Strength Bar */}
      <div className="relative z-10">
        <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-700",
              strength > 70 ? 'bg-success' : strength > 40 ? 'bg-primary' : 'bg-destructive'
            )} 
            style={{ width: `${strength}%` }} 
          />
        </div>
      </div>

      {/* Owned Platforms */}
      {ownedPlatforms.length > 0 && (
        <div className="relative z-10 pt-2 border-t border-border/20">
          <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Subsidiaries
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ownedPlatforms.map(p => p && (
              <Badge key={p.id} variant="outline" className="text-[9px] font-bold bg-muted/10 border-muted/20 text-muted-foreground">
                {p.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const StreamingPanel: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);
  const buyers = useMemo(() => gameState?.market.buyers || [], [gameState?.market.buyers]);

  const stats = useMemo(() => {
    const active = buyers.filter(b => !b.acquiredBy);
    const streamers = active.filter(b => b.archetype === 'streamer') as StreamerPlatform[];
    const totalSubs = streamers.reduce((sum, s) => sum + s.subscribers, 0);
    const mergers = buyers.filter(b => !!b.acquiredBy).length;
    const vulnerable = active.filter(b => b.isAcquirable).length;
    return { activeCount: active.length, totalSubs, mergers, vulnerable, total: buyers.length };
  }, [buyers]);

  const activeBuyers = useMemo(() => buyers.filter(b => !b.acquiredBy).sort((a, b) => (b.strength ?? 60) - (a.strength ?? 60)), [buyers]);
  const acquiredBuyers = useMemo(() => buyers.filter(b => !!b.acquiredBy), [buyers]);

  if (!gameState) return null;

  return (
    <div className="flex flex-col h-full space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Streaming &amp; Distribution</h1>
        </div>
        <p className="text-muted-foreground text-sm font-medium">
          Track streaming platforms, networks, and media conglomerates across the industry.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Platforms', value: stats.activeCount, icon: Tv, accent: 'text-primary' },
          { label: 'Total Subscribers', value: formatSubscribers(stats.totalSubs), icon: Users, accent: 'text-violet-400' },
          { label: 'Mergers', value: stats.mergers, icon: ArrowRightLeft, accent: 'text-amber-400' },
          { label: 'Vulnerable', value: stats.vulnerable, icon: AlertTriangle, accent: stats.vulnerable > 0 ? 'text-destructive' : 'text-muted-foreground' },
        ].map(stat => (
          <div key={stat.label} className="glass-panel p-4 rounded-2xl flex items-center gap-3 border border-border/30">
            <stat.icon className={cn("w-5 h-5", stat.accent)} />
            <div>
              <div className="text-lg font-black text-foreground leading-none">{stat.value}</div>
              <div className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Grid */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 pb-8">
          {/* Active */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeBuyers.map(buyer => (
              <BuyerCard key={buyer.id} buyer={buyer} allBuyers={buyers} />
            ))}
          </div>

          {/* Acquired */}
          {acquiredBuyers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Acquired Platforms
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {acquiredBuyers.map(buyer => (
                  <BuyerCard key={buyer.id} buyer={buyer} allBuyers={buyers} />
                ))}
              </div>
            </div>
          )}

          {buyers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Tv className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">No platforms in the market yet.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

import React from 'react';
import { Buyer, StreamerPlatform, NetworkPlatform, PremiumPlatform } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  Radio, 
  Crown, 
  Users, 
  AlertTriangle, 
  Building2, 
  Handshake, 
  TrendingUp, 
  TrendingDown,
  Globe,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriberTrendChart } from './SubscriberTrendChart';

const ARCHETYPE_CONFIG = {
  streamer: { icon: Wifi, label: 'Streamer', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  network: { icon: Radio, label: 'Network', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  premium: { icon: Crown, label: 'Premium', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
} as const;

function formatSubscribers(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

interface PlatformCardProps {
  buyer: Buyer;
  allBuyers: Buyer[];
  onDeal: (buyer: Buyer) => void;
  onViewHistory: (buyer: Buyer) => void;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({ buyer, allBuyers, onDeal, onViewHistory }) => {
  const config = ARCHETYPE_CONFIG[buyer.archetype];
  const Icon = config.icon;
  const isAcquired = !!buyer.acquiredBy;
  const acquirer = isAcquired ? allBuyers.find(b => b.id === buyer.acquiredBy) : null;
  const ownedPlatforms = (buyer.ownedPlatforms || []).map(id => allBuyers.find(b => b.id === id)).filter(Boolean);
  const strength = buyer.strength ?? 60;
  const cash = buyer.cash ?? 50_000_000;

  // Trend Calculation
  const isStreamer = buyer.archetype === 'streamer';
  const streamer = buyer as StreamerPlatform;
  const history = streamer.subscriberHistory || [];
  const lastSubCount = history.length > 1 ? history[history.length - 2].count : streamer.subscribers;
  const trend = streamer.subscribers - lastSubCount;
  const isTrendingUp = trend >= 0;

  return (
    <div className={cn(
      "p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 space-y-4 group relative overflow-hidden flex flex-col justify-between",
      isAcquired 
        ? "border-muted/30 bg-muted/5 opacity-60 grayscale-[0.5]" 
        : buyer.isAcquirable 
          ? "border-destructive/30 bg-destructive/5 animate-pulse-slow" 
          : strength > 75 
            ? "border-primary/20 bg-card/80 shadow-[0_0_20px_rgba(var(--primary),0.05)]" 
            : "border-border/30 bg-card/60",
      "hover:shadow-xl hover:-translate-y-1 hover:border-primary/30"
    )}>
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner", config.bg, config.border)}>
            <Icon className={cn("w-5 h-5", config.color)} />
          </div>
          <div>
            <h3 
              className="font-display font-black text-[15px] tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors cursor-pointer"
              onClick={() => onViewHistory(buyer)}
            >
              {buyer.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="outline" className={cn("text-[9px] font-black tracking-widest uppercase px-1.5 py-0 h-4 border-none", config.bg, config.color)}>
                {config.label}
              </Badge>
              {isAcquired && (
                <Badge variant="outline" className="text-[8px] font-black tracking-widest uppercase px-1.5 py-0 h-4 bg-white/5 border-white/5 text-muted-foreground/60 leading-none">
                  <Globe className="w-2.5 h-2.5 mr-0.5" /> Subsidiary
                </Badge>
              )}
            </div>
          </div>
        </div>

        {buyer.currentMandate && (
          <div className="flex flex-col items-end">
            <span className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-1">Active Mandate</span>
            <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2">
              {buyer.currentMandate.type.replace('_', ' ')}
            </Badge>
          </div>
        )}
      </div>

      {/* Chart Section (Streamer Only) */}
      {isStreamer && (
        <div className="h-20 w-full relative z-10 my-1 overflow-hidden rounded-lg bg-black/20 border border-white/5 p-1 group/chart">
           <SubscriberTrendChart platform={streamer} />
           <div className="absolute top-1 right-2 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest">
              {isTrendingUp ? (
                <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-2.5 h-2.5 text-rose-400" />
              )}
              <span className={isTrendingUp ? 'text-emerald-400' : 'text-rose-400'}>
                {Math.abs(trend) > 0 ? formatSubscribers(Math.abs(trend)) : 'Steady'}
              </span>
           </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className={cn(
        "grid gap-3 text-xs pt-3 border-t border-white/5 relative z-10",
        buyer.archetype === 'streamer' ? 'grid-cols-2' : 'grid-cols-2'
      )}>
        {buyer.archetype === 'streamer' && (
          <div className="space-y-1">
            <div className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/40 leading-none">Global Subs</div>
            <div className="font-black text-foreground flex items-center gap-1.5 text-sm">
              <Users className="w-3.5 h-3.5 text-violet-400" />
              {formatSubscribers((buyer as StreamerPlatform).subscribers)}
            </div>
          </div>
        )}
        {buyer.archetype === 'network' && (
          <div className="space-y-1">
            <div className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/40 leading-none">Domestic Reach</div>
            <div className="font-black text-foreground text-sm flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              {(buyer as NetworkPlatform).reach}/100
            </div>
          </div>
        )}
        <div className="space-y-1">
          <div className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/40 leading-none">Market Strength</div>
          <div className={cn("font-black text-sm flex items-center gap-1.5", strength > 70 ? 'text-emerald-400' : strength > 40 ? 'text-foreground' : 'text-rose-400')}>
            <TrendingUp className="w-3.5 h-3.5" />
            {strength.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-white/5 flex gap-2 relative z-10">
        {!isAcquired ? (
           <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-[9px] uppercase font-black tracking-[0.2em] bg-white/5 border-white/5 hover:bg-primary hover:text-black hover:border-primary transition-all group scale-100 active:scale-95"
              onClick={() => onDeal(buyer)}
            >
              <Handshake className="w-3.5 h-3.5 mr-2 group-hover:rotate-12 transition-transform" />
              Pitch Deal
            </Button>
        ) : (
          <div className="flex-1 h-8 flex items-center justify-center text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground/40 bg-white/2 bg-dotted border border-white/5 rounded-md">
            Controlled by {acquirer?.name}
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="w-8 h-8 p-0 bg-white/5 border-white/5 hover:border-primary/40 hover:text-primary transition-all"
          onClick={() => onViewHistory(buyer)}
          title="Industry Intelligence"
        >
          <Star className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Vulnerability Alert */}
      {buyer.isAcquirable && !isAcquired && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full animate-pulse">
           <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
           <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">M&A Target</span>
        </div>
      )}
    </div>
  );
};

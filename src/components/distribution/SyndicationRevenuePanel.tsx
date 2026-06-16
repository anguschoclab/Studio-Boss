import React from 'react';
import { cn, formatCompactCurrency } from '@/lib/utils';
import { Globe, TrendingUp, Tv, ChevronRight, Zap } from 'lucide-react';

interface SyndicationMarket {
  region: string;
  revenue: number;
  deals: number;
  trend: 'up' | 'down' | 'stable';
  growth: number; // percentage
}

interface SyndicationRevenuePanelProps {
  syndicationData: {
    byRegion: SyndicationMarket[];
    totalRevenue: number;
    totalDeals: number;
    topPerformingRegion: string;
  };
}

export const SyndicationRevenuePanel: React.FC<SyndicationRevenuePanelProps> = ({
  syndicationData,
}) => {
  const { byRegion, totalRevenue, totalDeals, topPerformingRegion } = syndicationData;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/[0.01] border border-white/5 p-6 rounded-none backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-none group-hover:bg-primary transition-colors duration-700">
              <Globe className="h-6 w-6 text-primary group-hover:text-black transition-colors" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic mb-2">TOTAL REVENUE</p>
              <p className="text-3xl font-display font-black italic tracking-tighter text-foreground group-hover:text-primary transition-colors">{formatCompactCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.01] border border-white/5 p-6 rounded-none backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-none group-hover:bg-emerald-500 transition-colors duration-700">
              <Tv className="h-6 w-6 text-emerald-500 group-hover:text-black transition-colors" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic mb-2">ACTIVE DEALS</p>
              <p className="text-3xl font-display font-black italic tracking-tighter text-foreground group-hover:text-emerald-500 transition-colors">{totalDeals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.01] border border-white/5 p-6 rounded-none backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-none group-hover:bg-amber-500 transition-colors duration-700">
              <TrendingUp className="h-6 w-6 text-amber-500 group-hover:text-black transition-colors" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic mb-2">TOP PERFORMING REGION</p>
              <p className="text-3xl font-display font-black italic tracking-tighter text-foreground group-hover:text-amber-500 transition-colors">{topPerformingRegion.toUpperCase() || 'NULL'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-l-4 border-primary pl-6 py-2">
          <Globe className="h-6 w-6 text-primary" strokeWidth={2} />
          <div>
            <h3 className="text-xl font-display font-black uppercase italic tracking-tighter text-foreground leading-none mb-2">REGIONAL SYNDICATION ARRAYS</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
              GLOBAL REVENUE DISTRIBUTION BY MARKET NODE
            </p>
          </div>
        </div>

        {byRegion.length === 0 ? (
          <div className={cn('text-center py-20 bg-white/[0.01] border border-white/5 border-dashed rounded-none')}>
            <Globe className="h-16 w-16 mx-auto mb-6 text-primary/20" strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic">
              NO SYNDICATION DEALS ACTIVE IN BUFFER
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {byRegion.map((market) => (
              <div
                key={market.region}
                className="bg-white/[0.02] border border-white/5 p-6 rounded-none backdrop-blur-3xl shadow-2xl hover:bg-white/[0.04] transition-all duration-700 group/row"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <div className="w-12 h-12 rounded-none bg-white/5 border border-white/10 flex items-center justify-center group-hover/row:border-primary/40 transition-colors duration-700">
                      <Globe className="h-6 w-6 text-primary/40 group-hover/row:text-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-lg uppercase italic tracking-tight text-foreground group-hover/row:text-primary transition-colors leading-none mb-2">{market.region}</h4>
                      <div className="flex items-center gap-6">
                        <div className="px-2 py-0.5 border border-white/10 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
                          {market.deals}_ACTIVE_UNITS
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic">
                          {market.growth > 0 ? '+' : ''}{market.growth}%_DELTA_VS_PERIOD_PREV
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <p className="text-2xl font-display font-black italic tracking-tighter text-foreground leading-none">{formatCompactCurrency(market.revenue)}</p>
                    <p className={cn(
                      'text-[9px] font-black uppercase tracking-[0.2em] italic flex items-center justify-end gap-2',
                      market.trend === 'up' ? 'text-emerald-500' :
                      market.trend === 'down' ? 'text-rose-500' : 'text-muted-foreground/30'
                    )}>
                      {market.trend === 'up' && <Zap className="h-3 w-3 fill-current" />}
                      {market.trend === 'up' ? 'STATUS GROWING' :
                       market.trend === 'down' ? 'STATUS DECLINING' : 'STATUS STABLE'}
                      <ChevronRight className="h-3 w-3" />
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SyndicationRevenuePanel;

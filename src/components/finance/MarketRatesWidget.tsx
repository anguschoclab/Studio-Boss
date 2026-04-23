import React from 'react';
import { TrendingUp, TrendingDown, Percent, Landmark, Wallet, AlertCircle } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';

export const MarketRatesWidget: React.FC = () => {
  const finance = useGameStore(state => state.finance);
  const market = finance.marketState;

  if (!market) return null;

  const isRising = market.rateHistory.length > 1 && 
    market.baseRate > market.rateHistory[market.rateHistory.length - 2].rate;

  const formatRate = (rate: number) => (rate * 100).toFixed(2) + '%';

  return (
    <div className="glass-card p-8 group relative overflow-hidden transition-all duration-700 hover:bg-white/[0.03] hover:border-primary/20 rounded-none">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-none blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-none group-hover:bg-primary/20 transition-all duration-700">
            <Landmark className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic leading-none mb-3">EXCHANGE PROTOCOL // MARKET</h3>
            <p className="text-4xl font-display font-black text-foreground flex items-center gap-4 tracking-tighter italic leading-none">
              {formatRate(market.baseRate)}
              {isRising ? (
                <TrendingUp className="w-6 h-6 text-red-400 animate-pulse" />
              ) : (
                <TrendingDown className="w-6 h-6 text-emerald-400 animate-bounce" />
              )}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <span className={cn(
            "text-[9px] px-4 py-1.5 font-black uppercase tracking-[0.2em] italic rounded-none border leading-none transition-all duration-700",
            isRising ? 'bg-red-400/10 text-red-400 border-red-400/20' : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
          )}>
            {isRising ? 'HAWKISH' : 'DOVISH'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 relative z-10">
        <div className="bg-white/[0.01] p-6 border border-white/5 rounded-none group-hover:bg-white/[0.02] transition-all duration-700">
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] italic leading-none">SAVINGS APY</span>
          </div>
          <p className="text-2xl font-display font-black text-emerald-400 italic leading-none tracking-tighter">{formatRate(market.savingsYield)}</p>
        </div>

        <div className="bg-white/[0.01] p-6 border border-white/5 rounded-none group-hover:bg-white/[0.02] transition-all duration-700">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] italic leading-none">DEBT PENALTY</span>
          </div>
          <p className="text-2xl font-display font-black text-red-400 italic leading-none tracking-tighter">{formatRate(market.debtRate)}</p>
        </div>
      </div>

      {/* Mini Trend Sparkline */}
      <div className="mt-8 flex items-end gap-1.5 h-10 relative z-10">
        {market.rateHistory.slice(-12).map((h, i) => {
          const max = Math.max(...market.rateHistory.slice(-12).map(rh => rh.rate));
          const min = Math.min(...market.rateHistory.slice(-12).map(rh => rh.rate));
          const height = ((h.rate - min) / (max - min || 1)) * 100;
          return (
            <div 
              key={i} 
              className="flex-1 bg-white/5 rounded-none hover:bg-primary/40 transition-all duration-300"
              style={{ height: `${Math.max(10, height)}%` }}
              title={`Week ${h.week}: ${formatRate(h.rate)}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-3 text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.4em] px-0.5 relative z-10 italic">
        <span>12W HISTORY audit</span>
        <Percent className="w-2.5 h-2.5 text-primary/40" />
      </div>
    </div>
  );
};

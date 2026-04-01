import React from 'react';
import { TrendingUp, TrendingDown, Percent, Landmark, Wallet, AlertCircle } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export const MarketRatesWidget: React.FC = () => {
  const finance = useGameStore(state => state.finance);
  const market = finance.marketState;

  if (!market) return null;

  const isRising = market.rateHistory.length > 1 && 
    market.baseRate > market.rateHistory[market.rateHistory.length - 2].rate;

  const formatRate = (rate: number) => (rate * 100).toFixed(2) + '%';

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-md shadow-xl overflow-hidden relative group transition-all hover:bg-slate-900/80 hover:border-blue-500/30">
      {/* Background Decor */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Landmark className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Global Market</h3>
            <p className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {formatRate(market.baseRate)}
              {isRising ? (
                <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-400 animate-bounce" />
              )}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isRising ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {isRising ? 'Hawkish' : 'Dovish'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/30">
          <div className="flex items-center gap-1.5 mb-1">
            <Wallet className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-medium text-slate-400">Savings APY</span>
          </div>
          <p className="text-sm font-bold text-emerald-400">{formatRate(market.savingsYield)}</p>
        </div>

        <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/30">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span className="text-[10px] font-medium text-slate-400">Debt Penalty</span>
          </div>
          <p className="text-sm font-bold text-rose-400">{formatRate(market.debtRate)}</p>
        </div>
      </div>

      {/* Mini Trend Sparkline Hint */}
      <div className="mt-4 flex items-end gap-1 h-6">
        {market.rateHistory.slice(-12).map((h, i) => {
          const max = Math.max(...market.rateHistory.slice(-12).map(rh => rh.rate));
          const min = Math.min(...market.rateHistory.slice(-12).map(rh => rh.rate));
          const height = ((h.rate - min) / (max - min || 1)) * 100;
          return (
            <div 
              key={i} 
              className="flex-1 bg-slate-700/50 rounded-t-sm hover:bg-blue-400/50 transition-colors"
              style={{ height: `${Math.max(20, height)}%` }}
              title={`Week ${h.week}: ${formatRate(h.rate)}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1 text-[8px] text-slate-500 px-0.5">
        <span>12W HISTORY</span>
        <Percent className="w-2 h-2" />
      </div>
    </div>
  );
};

import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { BarChartIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const YearInReviewChart = () => {
  const ledger = useGameStore(s => s.finance.ledger);

  const chartData = useMemo(() => {
    return ledger.slice(-52).map(entry => ({
      name: `W${entry.week}`,
      cash: entry.endingCash,
      profit: entry.netProfit,
      revenue: entry.revenue.boxOffice + entry.revenue.distribution + entry.revenue.other,
      expenses: entry.expenses.production + entry.expenses.marketing + entry.expenses.overhead
    }));
  }, [ledger]);

  if (ledger.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[450px] border border-white/5 rounded-none opacity-50 bg-white/[0.01] backdrop-blur-3xl space-y-8">
        <div className="bg-primary/10 p-6 rounded-none mb-4 animate-pulse border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
           <BarChartIcon className="w-10 h-10 text-primary/60" />
        </div>
        <div className="text-center space-y-4">
          <p className="text-xl font-display font-black uppercase tracking-tighter text-muted-foreground/40 italic">Initializing Financial Ledger...</p>
          <p className="text-[10px] text-muted-foreground/10 uppercase font-black tracking-[0.3em] italic">Simulate one week to generate predictive fiscal data</p>
        </div>
      </div>
    );
  }

  const lastEntry = ledger[ledger.length - 1];
  const isProfitable = lastEntry.netProfit >= 0;

  return (
    <Card className="glass-card overflow-hidden group rounded-none p-4">
      <CardHeader className="p-10 flex flex-row items-center justify-between space-y-0 border-b border-white/5">
        <div>
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 mb-4 italic">
            EXECUTIVE PERFORMANCE AUDIT // ROLLING 52-WEEK DATA
          </CardTitle>
          <div className="flex items-center gap-8">
            <span className="text-5xl font-black tracking-tighter font-display italic leading-none">
              {formatMoney(lastEntry.endingCash)}
            </span>
            <div className={cn(
              "flex items-center gap-3 text-[10px] font-black px-4 py-2 rounded-none border italic",
              isProfitable ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-red-400/10 text-red-400 border-red-400/20'
            )}>
              {isProfitable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {formatMoney(Math.abs(lastEntry.netProfit))}
            </div>
          </div>
        </div>
        <div className="text-right space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic leading-none">WEEK {lastEntry.week}</p>
          <p className="text-[9px] font-black text-primary italic tracking-[0.2em] uppercase leading-none">FISCAL BENCHMARK ACTIVE</p>
        </div>
      </CardHeader>

      <CardContent className="h-[400px] p-10 pt-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(var(--primary), 1)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="rgba(var(--primary), 1)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isProfitable ? "#10b981" : "#f43f5e"} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={isProfitable ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="rgba(255,255,255,0.02)" />
            <XAxis 
              dataKey="name" 
              hide={chartData.length > 20}
              stroke="rgba(255,255,255,0.2)" 
              fontSize={9} 
              fontWeight={900}
              tickLine={false} 
              axisLine={false}
              tick={{ fill: 'rgba(255,255,255,0.2)' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)" 
              fontSize={9} 
              fontWeight={900}
              tickFormatter={v => `$${(v / 1e6).toFixed(0)}M`}
              tickLine={false} 
              axisLine={false}
              tick={{ fill: 'rgba(255,255,255,0.2)' }}
            />
            <Tooltip
              contentStyle={{ 
                background: 'rgba(0, 0, 0, 0.95)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '0px',
                backdropFilter: 'blur(32px)',
                padding: '16px'
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.2)', fontWeight: 900, fontSize: '9px', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.2em', fontStyle: 'italic' }}
              itemStyle={{ fontSize: '11px', fontWeight: 900, padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              formatter={(value: number) => [formatMoney(value as number), '']}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.05)" strokeWidth={1} strokeDasharray="8 8" />
            <Area 
              type="monotone" 
              dataKey="cash" 
              stroke="rgba(var(--primary), 1)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCash)" 
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke={isProfitable ? "#10b981" : "#f43f5e"} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorProfit)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

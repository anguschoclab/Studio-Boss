import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { BarChartIcon, TrendingUp, TrendingDown } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center h-[350px] border border-dashed rounded-xl opacity-50 bg-muted/20 backdrop-blur-sm">
        <div className="bg-primary/10 p-4 rounded-full mb-4 animate-pulse">
           <BarChartIcon className="w-8 h-8 text-primary/60" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Initializing Financial Ledger...</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase">Simulate one week to generate data</p>
      </div>
    );
  }

  const lastEntry = ledger[ledger.length - 1];
  const isProfitable = lastEntry.netProfit >= 0;

  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
      {/* Decorative Gradient Overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors duration-500 group-hover:bg-primary/10" />
      
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Studio Financial Performance
          </CardTitle>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight font-display italic">
              {formatMoney(lastEntry.endingCash)}
            </span>
            <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isProfitable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {isProfitable ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {formatMoney(Math.abs(lastEntry.netProfit))}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Week {lastEntry.week}</p>
          <p className="text-[10px] font-mono font-bold text-primary italic">ROLLING 52-WEEK VIEW</p>
        </div>
      </CardHeader>

      <CardContent className="h-[300px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isProfitable ? "#10b981" : "#f43f5e"} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={isProfitable ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis 
              dataKey="name" 
              hide={chartData.length > 20}
              stroke="rgba(255,255,255,0.2)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)" 
              fontSize={10} 
              tickFormatter={v => `$${(v / 1e6).toFixed(0)}M`}
              tickLine={false} 
              axisLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }}
            />
            <Tooltip
              contentStyle={{ 
                background: 'rgba(2, 6, 23, 0.95)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
                padding: '12px'
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}
              itemStyle={{ fontSize: '12px', fontWeight: 700, padding: '2px 0' }}
              formatter={(value: number) => [formatMoney(value), '']}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
            <Area 
              type="monotone" 
              dataKey="cash" 
              stroke="hsl(var(--primary))" 
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

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useGameStore } from '@/store/gameStore';
import { formatCurrency } from '@/lib/utils';

export const FinancialOverviewWidget: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  if (!gameState) return null;
  
  const { finance, history } = gameState;

  // Build history data from snapshots. If we don't have enough history, pad it.
  const historyData = history.slice(-12).map((snap) => ({
    week: `WK ${snap.week}`,
    balance: snap.funds / 1000000, // In millions for chart readability
  }));

  // Add current week
  historyData.push({
    week: 'NOW',
    balance: finance.cash / 1000000,
  });

  const chartConfig = {
    balance: {
      label: "VALUATION ($M)",
      color: "rgba(var(--primary), 1)",
    },
  };

  return (
    <Card className="col-span-1 lg:col-span-2 border-white/5 bg-white/[0.01] backdrop-blur-3xl transition-all duration-700 overflow-hidden group rounded-none">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-none blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />
      <CardHeader className="pb-8 border-b border-white/5 relative z-10 p-8">
        <CardTitle className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] flex items-center justify-between italic leading-none">
          <span className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-none bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)] animate-pulse" />
            <span className="group-hover:text-primary transition-colors">Studio Valuation Analytics</span>
          </span>
          <span className="text-[9px] px-4 py-1.5 rounded-none bg-primary/10 border border-primary/20 font-display font-black tracking-widest text-primary">LIVE</span>
        </CardTitle>
        <div className="text-5xl font-display font-black tracking-tighter mt-6 text-foreground italic leading-none">
          {formatCurrency(finance.cash)}
        </div>
        <CardDescription className="text-[9px] uppercase tracking-[0.4em] font-black text-muted-foreground/20 mt-4 italic">
          12-WEEK FISCAL VECTOR ANALYSIS
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 p-8">
        <div className="h-[220px] w-full mt-4">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(var(--primary), 1)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="rgba(var(--primary), 1)" stopOpacity={0.0} />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.1)', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em' }}
                  dy={15}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <ChartTooltip
                  cursor={{ stroke: 'rgba(var(--primary), 0.2)', strokeWidth: 1 }}
                  content={<ChartTooltipContent className="bg-black/90 border-white/10 backdrop-blur-3xl text-[9px] font-display font-black uppercase tracking-widest shadow-2xl rounded-none p-4" />}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="rgba(var(--primary), 1)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#fillBalance)" 
                  style={{ filter: 'url(#glow)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

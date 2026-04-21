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
    week: `Wk ${snap.week}`,
    balance: snap.funds / 1000000, // In millions for chart readability
  }));

  // Add current week
  historyData.push({
    week: 'Current',
    balance: finance.cash / 1000000,
  });

  const chartConfig = {
    balance: {
      label: "Bank Balance ($M)",
      color: "hsl(var(--chart-2))", // Using a green-ish chart color
    },
  };

  return (
    <Card className="col-span-1 lg:col-span-2 border-white/5 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md shadow-xl hover:border-white/10 transition-colors duration-500 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--chart-2))]/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-[hsl(var(--chart-2))]/10 transition-colors duration-700" />
      <CardHeader className="pb-2 border-b border-white/5 relative z-10">
        <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--chart-2))] shadow-[0_0_8px_hsl(var(--chart-2))] animate-pulse" />
            <span className="group-hover:text-foreground transition-colors">Studio Valuation</span>
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 font-mono">LIVE</span>
        </CardTitle>
        <div className="text-4xl font-black tracking-tighter mt-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          {formatCurrency(finance.cash)}
        </div>
        <CardDescription className="text-[10px] uppercase tracking-widest font-medium mt-1">
          12-Week Cash Flow Trend
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="h-[200px] w-full mt-4">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.0} />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <ChartTooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={<ChartTooltipContent className="bg-card/90 border-white/10 backdrop-blur-md text-xs font-mono uppercase shadow-2xl" />}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={3}
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

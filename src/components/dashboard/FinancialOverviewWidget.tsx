import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useGameStore } from '@/store/gameStore';
import { formatCurrency } from '@/lib/utils';

import { useShallow } from 'zustand/react/shallow';

export const FinancialOverviewWidget: React.FC = () => {
  // ⚡ Bolt: Destructured with useShallow to prevent unnecessary re-renders on minor state ticks
  const finance = useGameStore(useShallow((state) => state.gameState?.finance));
  const history = useGameStore(useShallow((state) => state.gameState?.history));
  if (!finance || !history) return null;

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
    <Card className="col-span-1 lg:col-span-2 border border-white/10 bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-xl shadow-2xl hover:border-white/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 relative overflow-hidden group">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[hsl(var(--chart-2))]/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-[hsl(var(--chart-2))]/10 transition-colors duration-700" />
      <CardHeader className="pb-4 border-b border-white/10 relative z-10 bg-white/5">
        <CardTitle className="text-xs font-black text-muted-foreground/80 uppercase tracking-[0.2em] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-2))] shadow-[0_0_10px_hsl(var(--chart-2))] animate-pulse" />
            <span className="group-hover:text-foreground/90 transition-colors tracking-widest drop-shadow-sm">Studio Valuation</span>
          </span>
          <span className="text-[9px] px-2.5 py-1 rounded-full bg-white/10 font-mono tracking-widest border border-white/5 shadow-inner">LIVE</span>
        </CardTitle>
        <div className="text-5xl font-extrabold tracking-tighter mt-3 bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-500">
          {formatCurrency(finance.cash)}
        </div>
        <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-bold mt-2 text-muted-foreground/60">
          12-Week Cash Flow Trend
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 pt-6">
        <div className="h-[220px] w-full mt-2">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.0} />
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
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <ChartTooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={<ChartTooltipContent className="bg-card/95 border-white/20 backdrop-blur-xl text-xs font-mono uppercase shadow-2xl rounded-xl px-4 py-3" />}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#fillBalance)" 
                  style={{ filter: 'url(#glow)' }}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

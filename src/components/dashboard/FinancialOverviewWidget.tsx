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
    <Card className="col-span-1 lg:col-span-2 border border-white/10 bg-gradient-to-br from-card/60 via-card/40 to-card/20 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-white/30 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] transition-all duration-500 relative overflow-hidden group">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[hsl(var(--chart-2))]/10 rounded-full blur-[140px] pointer-events-none group-hover:bg-[hsl(var(--chart-2))]/20 transition-colors duration-700" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
      <CardHeader className="pb-5 border-b border-white/10 relative z-10 bg-gradient-to-b from-white/10 to-transparent">
        <CardTitle className="text-sm font-black text-white/90 uppercase tracking-[0.25em] flex items-center justify-between">
          <span className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[hsl(var(--chart-2))]/40 rounded-full blur-sm animate-pulse" />
              <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--chart-2))] relative z-10 shadow-[0_0_12px_hsl(var(--chart-2))]" />
            </div>
            <span className="group-hover:text-white transition-colors tracking-widest drop-shadow-md">Studio Valuation</span>
          </span>
          <span className="text-[10px] px-3 py-1.5 rounded-md bg-black/40 font-mono tracking-widest border border-white/10 shadow-inner text-white/70">LIVE</span>
        </CardTitle>
        <div className="text-6xl font-display font-black tracking-tighter mt-4 bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] group-hover:drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-500">
          {formatCurrency(finance.cash)}
        </div>
        <CardDescription className="text-[11px] uppercase tracking-[0.25em] font-bold mt-2 text-muted-foreground/70 group-hover:text-muted-foreground/90 transition-colors">
          12-Week Cash Flow Trend
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 pt-8 pb-6 px-6">
        <div className="h-[240px] w-full mt-2">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.9} />
                    <stop offset="40%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.0} />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 800 }}
                  dy={12}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <ChartTooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                  content={<ChartTooltipContent className="bg-black/90 border-white/20 backdrop-blur-2xl text-xs font-mono uppercase shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-xl px-4 py-3" />}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={5}
                  fillOpacity={1} 
                  fill="url(#fillBalance)" 
                  style={{ filter: 'url(#glow)' }}
                  animationDuration={2000}
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

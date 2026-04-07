import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useGameStore } from '@/store/gameStore';
import { formatCurrency } from '@/lib/utils';

import { useShallow } from 'zustand/react/shallow';

export const FinancialOverviewWidget: React.FC = () => {
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
    <Card aria-label="Financial Overview Chart" className="col-span-1 animate-in fade-in zoom-in-95 duration-700 lg:col-span-2 border border-white/10 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] hover:border-white/30 hover:shadow-[0_24px_64px_rgba(0,0,0,0.6)] transition-all duration-700 relative overflow-hidden group h-full">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
      <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-[hsl(var(--chart-2))]/10 rounded-full blur-[160px] pointer-events-none group-hover:bg-[hsl(var(--chart-2))]/20 transition-colors duration-1000 group-hover:scale-110" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      <CardHeader className="pb-6 border-b border-white/10 relative z-10 bg-gradient-to-b from-white/5 to-transparent p-6">
        <CardTitle className="text-sm font-black text-white/90 uppercase tracking-[0.25em] flex items-center justify-between">
          <span className="flex items-center gap-3">
            <div className="relative flex items-center justify-center p-1.5 rounded-lg bg-[hsl(var(--chart-2))]/20 border border-[hsl(var(--chart-2))]/30 shadow-[0_0_15px_hsl(var(--chart-2)_/_0.3)]">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-2))] relative z-10 shadow-[0_0_12px_hsl(var(--chart-2))] animate-pulse" />
            </div>
            <span className="group-hover:text-white transition-colors tracking-widest drop-shadow-md">Studio Valuation</span>
          </span>
          <span className="text-[10px] px-3 py-1.5 rounded-md bg-black/60 font-mono tracking-[0.2em] border border-white/10 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] text-foreground/90 backdrop-blur-md">LIVE</span>
        </CardTitle>
        <div className="text-7xl font-display font-black tracking-tighter mt-6 mb-2 bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-700">
          {formatCurrency(finance.cash)}
        </div>
        <CardDescription className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground/80 group-hover:text-muted-foreground/90 transition-colors duration-500">
          12-Week Cash Flow Trend
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 pt-8 pb-8 px-8">
        <div className="h-[280px] w-full mt-2 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none z-10" />
          <ChartContainer config={chartConfig} className="h-full w-full relative z-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.0} />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="12" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 800 }}
                  dy={16}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <ChartTooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.3)', strokeWidth: 2, strokeDasharray: '4 4' }}
                  content={<ChartTooltipContent className="bg-black/90 border-white/20 backdrop-blur-3xl text-xs font-mono uppercase shadow-[0_16px_48px_rgba(0,0,0,0.6)] rounded-xl px-5 py-4" />}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={6}
                  fillOpacity={1} 
                  fill="url(#fillBalance)" 
                  style={{ filter: 'url(#glow)' }}
                  animationDuration={2500}
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

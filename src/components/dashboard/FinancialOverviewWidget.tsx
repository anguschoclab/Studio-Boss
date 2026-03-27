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
    balance: finance.bankBalance / 1000000,
  });

  const chartConfig = {
    balance: {
      label: "Bank Balance ($M)",
      color: "hsl(var(--chart-2))", // Using a green-ish chart color
    },
  };

  return (
    <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-2/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors duration-300">
          Studio Valuation
        </CardTitle>
        <div className="text-4xl font-black tracking-tighter mt-1 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
          {formatCurrency(finance.bankBalance)}
        </div>
        <CardDescription className="text-[11px] font-medium tracking-wide mt-1">
          12-Week Cash Flow Trend
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="h-[220px] w-full mt-4">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600, textAnchor: 'middle' }}
                  dy={10}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <ChartTooltip cursor={{ stroke: 'hsl(var(--chart-2))', strokeWidth: 1, strokeDasharray: '4 4' }} content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#fillBalance)" 
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

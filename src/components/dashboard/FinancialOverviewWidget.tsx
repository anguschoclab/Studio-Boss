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
    <Card className="col-span-1 lg:col-span-2 border-muted bg-card/50 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Studio Valuation
        </CardTitle>
        <div className="text-3xl font-bold tracking-tight mt-1">
          {formatCurrency(finance.bankBalance)}
        </div>
        <CardDescription>
          12-Week Cash Flow Trend
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full mt-2">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  dy={10}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <ChartTooltip cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 2 }} content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#fillBalance)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

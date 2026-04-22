import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatMoney } from '@/engine/utils';
import { FinancialSnapshot } from '@/engine/types';

interface RevenueStreamChartProps {
  data: FinancialSnapshot[];
}

export const RevenueStreamChart: React.FC<RevenueStreamChartProps> = ({ data }) => {
  const chartData = data.slice(-12).map(h => ({
    week: `W${h.week}`,
    theatrical: h.revenue.theatrical,
    streaming: h.revenue.streaming,
    merch: h.revenue.merch,
    passive: h.revenue.passive,
  }));

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTheo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorStream" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorMerch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="week" fontSize={10} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
          <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v/1000}k`} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
            itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
            formatter={(value: number) => formatMoney(value)}
          />
          <Area type="monotone" dataKey="theatrical" stackId="1" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTheo)" />
          <Area type="monotone" dataKey="streaming" stackId="1" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorStream)" />
          <Area type="monotone" dataKey="merch" stackId="1" stroke="#a78bfa" fillOpacity={1} fill="url(#colorMerch)" />
          <Area type="monotone" dataKey="passive" stackId="1" stroke="#34d399" fillOpacity={1} fill="#34d399" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

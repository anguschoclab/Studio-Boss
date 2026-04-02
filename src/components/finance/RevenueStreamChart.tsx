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
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorStream" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorMerch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="week" fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" />
          <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" tickFormatter={(v) => `$${v/1000}k`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
            itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
            formatter={(value: number) => formatMoney(value)}
          />
          <Area type="monotone" dataKey="theatrical" stackId="1" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTheo)" />
          <Area type="monotone" dataKey="streaming" stackId="1" stroke="#6366f1" fillOpacity={1} fill="url(#colorStream)" />
          <Area type="monotone" dataKey="merch" stackId="1" stroke="#10b981" fillOpacity={1} fill="url(#colorMerch)" />
          <Area type="monotone" dataKey="passive" stackId="1" stroke="#94a3b8" fillOpacity={1} fill="#94a3b8" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

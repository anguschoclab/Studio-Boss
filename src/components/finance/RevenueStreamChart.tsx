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
              <stop offset="5%" stopColor="rgba(var(--primary), 1)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="rgba(var(--primary), 0)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorStream" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorMerch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="8 8" stroke="rgba(255,255,255,0.02)" vertical={false} />
          <XAxis 
            dataKey="week" 
            fontSize={9} 
            fontWeight={900} 
            tickLine={false} 
            axisLine={false} 
            stroke="rgba(255,255,255,0.2)" 
          />
          <YAxis 
            fontSize={9} 
            fontWeight={900} 
            tickLine={false} 
            axisLine={false} 
            stroke="rgba(255,255,255,0.2)" 
            tickFormatter={(v) => `$${v/1000}K`} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.95)', 
              border: '1px solid rgba(255,255,255,0.05)', 
              borderRadius: '0px',
              backdropFilter: 'blur(32px)',
              padding: '12px'
            }}
            itemStyle={{ 
              fontSize: '9px', 
              fontWeight: 900, 
              textTransform: 'uppercase', 
              letterSpacing: '0.2em' 
            }}
            formatter={(value: number) => formatMoney(value)}
          />
          <Area type="monotone" dataKey="theatrical" stackId="1" stroke="rgba(var(--primary), 1)" fillOpacity={1} fill="url(#colorTheo)" />
          <Area type="monotone" dataKey="streaming" stackId="1" stroke="#38bdf8" fillOpacity={1} fill="url(#colorStream)" />
          <Area type="monotone" dataKey="merch" stackId="1" stroke="#a78bfa" fillOpacity={1} fill="url(#colorMerch)" />
          <Area type="monotone" dataKey="passive" stackId="1" stroke="#34d399" fillOpacity={0.1} fill="#34d399" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

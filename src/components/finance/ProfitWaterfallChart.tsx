import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatMoney } from '@/engine/utils';
import { FinancialSnapshot } from '@/engine/types';

interface ProfitWaterfallChartProps {
  snapshot?: FinancialSnapshot;
}

export const ProfitWaterfallChart: React.FC<ProfitWaterfallChartProps> = ({ snapshot }) => {
  if (!snapshot) return null;

  const data = [
    { name: 'Theatrical', value: snapshot.revenue.theatrical, type: 'rev' },
    { name: 'Streaming', value: snapshot.revenue.streaming, type: 'rev' },
    { name: 'Merch', value: snapshot.revenue.merch, type: 'rev' },
    { name: 'Production', value: -snapshot.expenses.production, type: 'exp' },
    { name: 'Marketing', value: -snapshot.expenses.marketing, type: 'exp' },
    { name: 'Overhead', value: -snapshot.expenses.burn, type: 'exp' },
    { name: 'Net Profit', value: snapshot.net, type: 'net' },
  ];

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} stroke="#64748b" interval={0} />
          <YAxis fontSize={9} tickLine={false} axisLine={false} stroke="#64748b" tickFormatter={(v) => `$${v/1000}k`} />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
            itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
            formatter={(value: number) => formatMoney(value)}
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.05)" />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.type === 'rev' ? '#10b981' : entry.type === 'exp' ? '#ef4444' : entry.value >= 0 ? '#10b981' : '#ef4444'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

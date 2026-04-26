import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatMoney } from '@/engine/utils';
import { FinancialSnapshot } from '@/engine/types';

interface ProfitWaterfallChartProps {
  snapshot?: FinancialSnapshot;
}

export const ProfitWaterfallChart: React.FC<ProfitWaterfallChartProps> = ({ snapshot }) => {
  if (!snapshot) return null;

  const data = [
    { name: 'THEATRICAL', value: snapshot.revenue.theatrical, type: 'rev' },
    { name: 'STREAMING', value: snapshot.revenue.streaming, type: 'rev' },
    { name: 'MERCH', value: snapshot.revenue.merch, type: 'rev' },
    { name: 'PRODUCTION', value: -snapshot.expenses.production, type: 'exp' },
    { name: 'MARKETING', value: -snapshot.expenses.marketing, type: 'exp' },
    { name: 'OVERHEAD', value: -snapshot.expenses.burn, type: 'exp' },
    { name: 'NET PROFIT', value: snapshot.net, type: 'net' },
  ];

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <XAxis 
            dataKey="name" 
            fontSize={8} 
            fontWeight={900} 
            tickLine={false} 
            axisLine={false} 
            stroke="rgba(255,255,255,0.2)" 
            interval={0} 
          />
          <YAxis 
            fontSize={8} 
            fontWeight={900} 
            tickLine={false} 
            axisLine={false} 
            stroke="rgba(255,255,255,0.2)" 
            tickFormatter={(v) => `$${v/1000}K`} 
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
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
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
          <Bar dataKey="value" radius={[0, 0, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.type === 'rev' ? '#10b981' : entry.type === 'exp' ? '#ef4444' : entry.value >= 0 ? '#10b981' : '#ef4444'} 
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

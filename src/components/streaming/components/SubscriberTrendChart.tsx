import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { StreamerPlatform } from '@/engine/types';

interface SubscriberTrendChartProps {
  platform: StreamerPlatform;
}

export const SubscriberTrendChart: React.FC<SubscriberTrendChartProps> = ({ platform }) => {
  const data = platform.subscriberHistory || [];

  if (data.length < 2) {
    return (
      <div className="h-full flex items-center justify-center text-[10px] uppercase font-bold text-muted-foreground/40 bg-black/20 rounded-xl border border-white/5 border-dashed">
        Insufficient data for trend analysis
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="week" 
            hide 
          />
          <YAxis 
            hide 
            domain={['dataMin - 100000', 'dataMax + 100000']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase'
            }}
            itemStyle={{ color: 'hsl(var(--primary))' }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
            labelFormatter={(week) => `Week ${week}`}
            formatter={(value: number) => [value.toLocaleString(), 'Subscribers']}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorSubs)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

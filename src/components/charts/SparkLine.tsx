import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

interface SparkLineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  className?: string;
}

export const SparkLine: React.FC<SparkLineProps> = ({
  data,
  width = 120,
  height = 30,
  color = '#3b82f6',
  showDots = false,
  className,
}) => {
  if (!data || data.length === 0) return null;

  const chartData = data.map((value, index) => ({ index, value }));
  const trend = data[data.length - 1] > data[0] ? 'up' : 'down';
  const trendColor = trend === 'up' ? '#10b981' : '#ef4444';
  const finalColor = color === 'trend' ? trendColor : color;

  return (
    <div className={cn('inline-block', className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke={finalColor}
            strokeWidth={2}
            dot={showDots ? { r: 2, fill: finalColor } : false}
            activeDot={showDots ? { r: 4 } : false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparkLine;

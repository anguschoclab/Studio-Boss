import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  color?: string;
  className?: string;
  valueFormatter?: (value: number) => string;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  height = 200,
  showGrid = true,
  showTooltip = true,
  color = '#3b82f6',
  className,
  valueFormatter = (v) => v.toString(),
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-[200px] text-muted-foreground', className)}>
        No data available
      </div>
    );
  }

  const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={valueFormatter}
          />
          {showTooltip && (
            <Tooltip
              formatter={(value: number) => [valueFormatter(value), 'Value']}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#fff',
              }}
            />
          )}
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || defaultColors[index % defaultColors.length]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimpleBarChart;

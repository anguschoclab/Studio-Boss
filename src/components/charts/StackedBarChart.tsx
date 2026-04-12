import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

interface StackedDataPoint {
  label: string;
  [key: string]: string | number;
}

interface SeriesConfig {
  key: string;
  name: string;
  color: string;
}

interface StackedBarChartProps {
  data: StackedDataPoint[];
  series: SeriesConfig[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
  valueFormatter?: (value: number) => string;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  series,
  height = 250,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  className,
  valueFormatter = (v) => v.toString(),
}) => {
  if (!data || data.length === 0 || series.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-[250px] text-muted-foreground', className)}>
        No data available
      </div>
    );
  }

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
              formatter={(value: number, name: string) => [valueFormatter(value), name]}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#fff',
              }}
            />
          )}
          {showLegend && (
            <Legend 
              verticalAlign="bottom" 
              height={24}
              wrapperStyle={{ fontSize: '11px' }}
            />
          )}
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              stackId="total"
              fill={s.color}
              radius={[0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StackedBarChart;

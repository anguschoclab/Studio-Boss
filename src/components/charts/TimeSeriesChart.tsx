import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { cn } from '@/lib/utils';

interface TimePoint {
  date: string | number;
  value: number;
  secondaryValue?: number;
}

interface TimeSeriesChartProps {
  data: TimePoint[];
  height?: number;
  showGrid?: boolean;
  showArea?: boolean;
  lineColor?: string;
  secondaryLineColor?: string;
  className?: string;
  valueFormatter?: (value: number) => string;
  yAxisLabel?: string;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  height = 250,
  showGrid = true,
  showArea = false,
  lineColor = '#3b82f6',
  secondaryLineColor = '#10b981',
  className,
  valueFormatter = (v) => v.toString(),
  yAxisLabel,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-[250px] text-muted-foreground', className)}>
        No data available
      </div>
    );
  }

  const ChartComponent = showArea ? ComposedChart : LineChart;

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={valueFormatter}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fontSize: 10 } : undefined}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              valueFormatter(value), 
              name === 'value' ? 'Primary' : 'Secondary'
            ]}
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#fff',
            }}
          />
          {showArea && (
            <Area
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              fill={lineColor}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: lineColor }}
          />
          {data[0]?.secondaryValue !== undefined && (
            <Line
              type="monotone"
              dataKey="secondaryValue"
              stroke={secondaryLineColor}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeSeriesChart;

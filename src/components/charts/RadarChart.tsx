import React from 'react';
import {
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

interface RadarDataPoint {
  metric: string;
  value: number;
  fullMark?: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  height?: number;
  color?: string;
  secondaryData?: RadarDataPoint[];
  secondaryColor?: string;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
  valueFormatter?: (value: number) => string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  height = 250,
  color = '#3b82f6',
  secondaryData,
  secondaryColor = '#10b981',
  showTooltip = true,
  showLegend = false,
  className,
  valueFormatter = (v) => v.toString(),
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-[250px] text-muted-foreground', className)}>
        No data available
      </div>
    );
  }

  // Transform data for recharts
  const chartData = data.map(d => ({
    metric: d.metric,
    primary: d.value,
    secondary: secondaryData?.find(s => s.metric === d.metric)?.value,
    fullMark: d.fullMark || 100,
  }));

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReRadarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fontSize: 10, fill: '#6b7280' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 'auto']}
            tick={{ fontSize: 8, fill: '#9ca3af' }}
            tickCount={5}
          />
          <Radar
            name="Primary"
            dataKey="primary"
            stroke={color}
            fill={color}
            fillOpacity={0.3}
            strokeWidth={2}
          />
          {secondaryData && (
            <Radar
              name="Secondary"
              dataKey="secondary"
              stroke={secondaryColor}
              fill={secondaryColor}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          )}
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
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;

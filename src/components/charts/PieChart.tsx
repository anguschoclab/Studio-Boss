import React from 'react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

interface PieDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieDataPoint[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
  valueFormatter?: (value: number) => string;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 250,
  innerRadius = 0,
  outerRadius = 80,
  showTooltip = true,
  showLegend = true,
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

  const defaultColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || defaultColors[index % defaultColors.length]} 
              />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              formatter={(value: number, name: string) => {
                const percentage = ((value / total) * 100).toFixed(1);
                return [`${valueFormatter(value)} (${percentage}%)`, name];
              }}
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
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px' }}
            />
          )}
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;

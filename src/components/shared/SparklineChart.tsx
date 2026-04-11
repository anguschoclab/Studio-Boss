import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, Area, AreaChart } from 'recharts';
import { cn } from '@/lib/utils';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
  showArea?: boolean;
  strokeWidth?: number;
  className?: string;
  animate?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  width = 120,
  height = 40,
  color,
  fillOpacity = 0.2,
  showArea = true,
  strokeWidth = 2,
  className,
  animate = true,
  trend,
}) => {
  // Auto-detect trend if not provided
  const detectedTrend = trend || (() => {
    if (data.length < 2) return 'neutral';
    const first = data[0];
    const last = data[data.length - 1];
    if (last > first * 1.05) return 'up';
    if (last < first * 0.95) return 'down';
    return 'neutral';
  })();

  const trendColor = color || (() => {
    switch (detectedTrend) {
      case 'up': return '#22c55e';
      case 'down': return '#ef4444';
      default: return 'hsl(var(--primary))';
    }
  })();

  const chartData = data.map((value, index) => ({ value, index }));

  if (showArea) {
    return (
      <div className={cn('inline-block', className)} style={{ width, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`sparklineGradient-${trendColor.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={fillOpacity} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Area
              type="monotone"
              dataKey="value"
              stroke={trendColor}
              strokeWidth={strokeWidth}
              fill={`url(#sparklineGradient-${trendColor.replace(/[^a-zA-Z0-9]/g, '')})`}
              animationDuration={animate ? 1000 : 0}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className={cn('inline-block', className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke={trendColor}
            strokeWidth={strokeWidth}
            animationDuration={animate ? 1000 : 0}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Multi-series sparkline for comparison
interface MultiSparklineProps {
  data: { label: string; values: number[]; color: string }[];
  width?: number;
  height?: number;
  className?: string;
}

export const MultiSparkline: React.FC<MultiSparklineProps> = ({
  data,
  width = 200,
  height = 60,
  className,
}) => {
  // Combine all series into chart data format
  const maxLength = Math.max(...data.map(d => d.values.length));
  const chartData = Array.from({ length: maxLength }, (_, i) => {
    const point: Record<string, number | string> = { index: i };
    data.forEach(series => {
      point[series.label] = series.values[i] ?? null;
    });
    return point;
  });

  return (
    <div className={cn('space-y-2', className)}>
      <div style={{ width, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            {data.map((series, i) => (
              <Line
                key={series.label}
                type="monotone"
                dataKey={series.label}
                stroke={series.color}
                strokeWidth={2}
                dot={false}
                animationDuration={800 + i * 200}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {data.map(series => (
          <div key={series.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: series.color }} />
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              {series.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Bar sparkline (mini bar chart)
interface BarSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  barColor?: string;
  className?: string;
  maxBarWidth?: number;
}

export const BarSparkline: React.FC<BarSparklineProps> = ({
  data,
  width = 100,
  height = 30,
  barColor = 'hsl(var(--primary))',
  className,
  maxBarWidth = 8,
}) => {
  const maxValue = Math.max(...data, 1);
  const barWidth = Math.min(maxBarWidth, width / data.length - 2);
  const gap = 2;

  return (
    <div 
      className={cn('flex items-end gap-0.5', className)} 
      style={{ width, height }}
    >
      {data.map((value, i) => {
        const barHeight = (value / maxValue) * height;
        return (
          <div
            key={i}
            className="rounded-t-sm transition-all duration-500"
            style={{
              width: barWidth,
              height: barHeight,
              backgroundColor: barColor,
              opacity: 0.6 + (i / data.length) * 0.4,
            }}
          />
        );
      })}
    </div>
  );
};

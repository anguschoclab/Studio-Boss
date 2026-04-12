import React from 'react';
import { cn } from '@/lib/utils';

interface GaugeChartProps {
  value: number; // 0-100
  min?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  sublabel?: string;
  valueFormatter?: (value: number) => string;
  className?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 0,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color,
  backgroundColor = '#e5e7eb',
  label,
  sublabel,
  valueFormatter = (v) => `${Math.round(v)}%`,
  className,
}) => {
  const normalizedValue = Math.max(min, Math.min(max, value));
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  
  // Calculate color based on value if not provided
  const gaugeColor = color || (
    percentage >= 80 ? '#10b981' :
    percentage >= 60 ? '#3b82f6' :
    percentage >= 40 ? '#f59e0b' :
    '#ef4444'
  );

  // SVG parameters
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div style={{ width: size, height: size / 2 + 10 }}>
        <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
            fill="none"
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Value arc */}
          <path
            d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
          
          {/* Min/Max labels */}
          <text x={strokeWidth} y={center + 15} fontSize="8" fill="#6b7280" textAnchor="middle">
            {min}
          </text>
          <text x={size - strokeWidth} y={center + 15} fontSize="8" fill="#6b7280" textAnchor="middle">
            {max}
          </text>
        </svg>
      </div>
      
      {/* Value display */}
      <div className="text-center -mt-2">
        <p className={cn('text-2xl font-bold', className)} style={{ color: gaugeColor }}>
          {valueFormatter(normalizedValue)}
        </p>
        {label && (
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        )}
        {sublabel && (
          <p className="text-[10px] text-muted-foreground">{sublabel}</p>
        )}
      </div>
    </div>
  );
};

export default GaugeChart;

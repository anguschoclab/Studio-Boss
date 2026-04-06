import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export interface SidebarCashChartProps {
  data: { cash: number }[];
  isNegative: boolean;
}

export default function SidebarCashChart({ data, isNegative }: SidebarCashChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="cash"
          stroke={isNegative ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

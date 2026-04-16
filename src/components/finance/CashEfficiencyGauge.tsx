import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface CashEfficiencyGaugeProps {
  score: number; // 0 to 100
}

export const CashEfficiencyGauge: React.FC<CashEfficiencyGaugeProps> = ({ score }) => {
  const data = [
    { name: 'Efficiency', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  const COLORS = ['#f59e0b', '#1e293b'];

  return (
    <div className="h-full w-full relative group">
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="85%"
            startAngle={180}
            endAngle={0}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <Label 
              value={`${Math.round(score)}%`} 
              position="center" 
              className="fill-foreground font-display font-black text-2xl"
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

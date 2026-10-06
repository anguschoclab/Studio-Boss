import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

interface CashEfficiencyGaugeProps {
  score: number; // 0 to 100
}

export const CashEfficiencyGauge: React.FC<CashEfficiencyGaugeProps> = ({ score }) => {
  const data = [
    { name: "Efficiency", value: score },
    { name: "Remaining", value: 100 - score },
  ];

  const COLORS = ["rgba(var(--primary), 1)", "rgba(255,255,255,0.02)"];

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="90%"
            startAngle={180}
            endAngle={0}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                className={index === 0 ? "drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]" : ""}
              />
            ))}
            <Label
              content={({ viewBox }) => {
                const { cx, cy } = viewBox as { cx: number; cy: number };
                return (
                  <g>
                    <text
                      x={cx}
                      y={cy - 10}
                      className="fill-foreground font-display font-black text-4xl italic"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {Math.round(score)}%
                    </text>
                    <text
                      x={cx}
                      y={cy + 25}
                      className="fill-muted-foreground/20 font-black text-[8px] uppercase tracking-[0.3em] italic"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      EFFICIENCY
                    </text>
                  </g>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

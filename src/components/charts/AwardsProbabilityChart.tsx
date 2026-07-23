/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { AwardProbability } from "@/store/chartSelectors";

interface AwardsProbabilityChartProps {
  data: AwardProbability[];
  height?: number;
}

export const AwardsProbabilityChart: React.FC<AwardsProbabilityChartProps> = ({
  data,
  height = 300,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        No awards data available
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        >
          <XAxis
            type="number"
            dataKey="probability"
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="projectTitle"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <Tooltip
            content={({ active, payload }: import("recharts").TooltipProps<any, any>) => {
              if (!active || !payload || !payload.length) return null;
              const entry = payload[0].payload as AwardProbability;
              return (
                <div
                  style={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    fontSize: "11px",
                    color: "#e2e8f0",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>
                    {entry.projectTitle}
                  </div>
                  <div style={{ color: "#94a3b8" }}>
                    {entry.category} — {entry.awardBody}
                  </div>
                  <div style={{ color: "#f59e0b", fontWeight: 700 }}>
                    {entry.probability}%
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill="#f59e0b" />
            ))}
            <LabelList
              dataKey="probability"
              position="right"
              formatter={(value: number) => `${value}%`}
              style={{ fontSize: 10, fill: "#f59e0b", fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AwardsProbabilityChart;

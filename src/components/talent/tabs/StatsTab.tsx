import { Talent } from "@/engine/types/talent.types";
import { TabsContent } from "@/components/ui/tabs";
import { Star, DollarSign, TrendingUp } from "lucide-react";
import { formatMoney } from "@/engine/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from "recharts";

interface StatsTabProps {
  talent: Talent;
  statData: { name: string; value: number; color: string }[];
}

export const StatsTab = ({ talent, statData }: StatsTabProps) => {
  return (
    <TabsContent
      value="stats"
      className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 focus-visible:outline-none"
    >
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-black/40 p-8 rounded-none border border-white/5 shadow-2xl h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">
              Market Metric Distribution
            </h4>
            <Star className="w-4 h-4 text-primary opacity-30" />
          </div>
          <div className="flex-1 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statData} layout="vertical" margin={{ left: -10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" horizontal={false} />
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 10,
                    fontWeight: 900,
                    textTransform: "uppercase",
                  }}
                  width={90}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
                  {statData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black/40 p-8 rounded-none border border-white/5 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Career Momentum
                </p>
                <h4 className="text-3xl font-black text-white italic">
                  {talent.momentum || 0}
                  <span className="text-lg text-slate-500">/100</span>
                </h4>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 rounded-full border-4 border-primary"
                  style={{
                    clipPath: `polygon(0 0, 100% 0, 100% ${talent.momentum}%, 0 ${talent.momentum}%)`,
                    opacity: 0.8,
                  }}
                />
                <TrendingUp className="w-4 h-4 text-primary z-10" />
              </div>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-primary to-emerald-400"
                style={{ width: `${talent.momentum}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-none border border-slate-800 flex items-start gap-4">
            <div className="w-10 h-10 rounded-none bg-blue-500/10 flex items-center justify-center shrink-0">
              <div className="text-lg font-black text-blue-500">
                {talent.draw >= 70 ? "A+" : talent.draw >= 50 ? "B" : "C"}
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Box Office Leverage
              </h4>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-tight">
                Currently commands a baseline{" "}
                {talent.draw >= 70 ? "Blockbuster" : talent.draw >= 40 ? "Moderate" : "Niche"}{" "}
                theatrical draw momentum.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-500/5 p-6 border border-emerald-500/10 rounded-none text-center">
              <DollarSign className="w-5 h-5 text-emerald-500 mx-auto mb-2 opacity-50" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Total Career Gross
              </p>
              <p className="text-xl font-black text-emerald-400 mt-1">
                {formatMoney(talent.careerGross || 0)}
              </p>
            </div>
            <div className="bg-indigo-500/5 p-6 border border-indigo-500/10 rounded-none text-center">
              <TrendingUp className="w-5 h-5 text-indigo-500 mx-auto mb-2 opacity-50" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Star Meter
              </p>
              <p className="text-xl font-black text-indigo-400 mt-1">{talent.starMeter || 50}</p>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
};

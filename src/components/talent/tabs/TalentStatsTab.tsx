import { TabsContent } from '@/components/ui/tabs';
import { DollarSign, Star, TrendingUp } from 'lucide-react';
import { Talent } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface StatEntry { name: string; value: number; color: string; }

interface TalentStatsTabProps {
  talent: Talent;
  statData: StatEntry[];
}

export const TalentStatsTab: React.FC<TalentStatsTabProps> = ({ talent, statData }) => (
  <TabsContent value="stats" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 focus-visible:outline-none">
    <div className="grid grid-cols-2 gap-8">
      <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 shadow-2xl h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Market Metric Distribution</h4>
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
                tick={{ fontSize: 11, fontWeight: '900', fill: '#94a3b8', textAnchor: 'start', dx: 10 }}
                width={100}
              />
              <Tooltip
                cursor={{ fill: '#ffffff05' }}
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', fontWeight: '900' }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={26}>
                {statData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 shadow-xl flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-white/10 flex items-center justify-center font-black text-4xl text-white shadow-[0_0_30px_rgba(var(--primary),0.2)]">
              {talent.draw}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-black text-[10px] font-black px-2 py-1 rounded-lg border-2 border-slate-950">
              DRAW
            </div>
          </div>
          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Box Office Leverage</h4>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-tight">
            Currently commands a baseline {talent.draw >= 70 ? 'Blockbuster' : talent.draw >= 40 ? 'Moderate' : 'Niche'} theatrical draw momentum.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-500/5 p-6 border border-emerald-500/10 rounded-2xl text-center">
            <DollarSign className="w-5 h-5 text-emerald-500 mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Career Gross</p>
            <p className="text-xl font-black text-emerald-400 mt-1">{formatMoney(talent.careerGross || 0)}</p>
          </div>
          <div className="bg-indigo-500/5 p-6 border border-indigo-500/10 rounded-2xl text-center">
            <TrendingUp className="w-5 h-5 text-indigo-500 mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Star Meter</p>
            <p className="text-xl font-black text-indigo-400 mt-1">{talent.starMeter || 50}</p>
          </div>
        </div>
      </div>
    </div>
  </TabsContent>
);

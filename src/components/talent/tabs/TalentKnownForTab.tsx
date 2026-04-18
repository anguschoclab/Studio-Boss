import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { Talent } from '@/engine/types';
import { formatMoney } from '@/engine/utils';

interface TalentKnownForTabProps {
  talent: Talent;
}

export const TalentKnownForTab: React.FC<TalentKnownForTabProps> = ({ talent }) => (
  <TabsContent value="knownFor" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 focus-visible:outline-none">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {talent.knownFor?.map((title, i) => (
        <div key={i} className="group relative glass-panel p-8 rounded-3xl hover:border-primary/40 transition-all duration-500 text-center overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
            <Star className="w-20 h-20" />
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-black transition-all duration-300">
            <span className="font-black italic text-xl">#</span>
          </div>
          <h4 className="text-2xl font-black tracking-tighter text-white uppercase italic truncate mb-2">{title}</h4>
          <Badge className="bg-slate-800 text-slate-400 border-slate-700 uppercase text-[10px] font-black">LEGACY HIT</Badge>
        </div>
      ))}
      {(!talent.knownFor || talent.knownFor.length === 0) && (
        <div className="col-span-3 py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
          <p className="text-slate-500 font-black uppercase tracking-widest italic opacity-40">No Significant Hits Recorded</p>
        </div>
      )}
    </div>

    <div className="grid grid-cols-2 gap-6 mt-4">
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Highest Movie Payday</h5>
        {talent.highestSalaryMovie ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-white italic">{talent.highestSalaryMovie.project}</p>
              <p className="text-[10px] text-slate-500 font-bold">{talent.highestSalaryMovie.year}</p>
            </div>
            <p className="text-2xl font-black text-emerald-400">{formatMoney(talent.highestSalaryMovie.amount)}</p>
          </div>
        ) : (
          <p className="text-xs italic text-slate-600">No data recorded</p>
        )}
      </div>
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Highest TV Payday</h5>
        {talent.highestSalaryTv ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-white italic">{talent.highestSalaryTv.project}</p>
              <p className="text-[10px] text-slate-500 font-bold">{talent.highestSalaryTv.year}</p>
            </div>
            <p className="text-2xl font-black text-indigo-400">{formatMoney(talent.highestSalaryTv.amount)}</p>
          </div>
        ) : (
          <p className="text-xs italic text-slate-600">No data recorded</p>
        )}
      </div>
    </div>
  </TabsContent>
);

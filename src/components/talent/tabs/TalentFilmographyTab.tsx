import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Talent } from '@/engine/types';
import { formatMoney } from '@/engine/utils';

interface TalentFilmographyTabProps {
  talent: Talent;
}

export const TalentFilmographyTab: React.FC<TalentFilmographyTabProps> = ({ talent }) => (
  <TabsContent value="filmography" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 focus-visible:outline-none">
    <div className="bg-slate-950/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-slate-900/50 border-b border-slate-800">
            <th className="px-8 py-5 font-black uppercase tracking-widest text-slate-500 text-[10px]">Year</th>
            <th className="px-8 py-5 font-black uppercase tracking-widest text-slate-500 text-[10px]">Title</th>
            <th className="px-8 py-5 font-black uppercase tracking-widest text-slate-500 text-[10px]">Format</th>
            <th className="px-8 py-5 font-black uppercase tracking-widest text-slate-500 text-[10px]">Role</th>
            <th className="px-8 py-5 font-black uppercase tracking-widest text-slate-500 text-[10px] text-right">Performance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/30">
          {talent.filmography?.map((f, i) => (
            <tr key={i} className="hover:bg-primary/5 transition-colors group">
              <td className="px-8 py-5 text-slate-500 font-mono text-xs">{f.year}</td>
              <td className="px-8 py-5">
                <p className="font-black text-white uppercase italic tracking-tight text-base group-hover:text-primary transition-colors">{f.title}</p>
              </td>
              <td className="px-8 py-5">
                <Badge variant="outline" className="text-[9px] border-slate-800 bg-slate-900 text-slate-400 font-black uppercase tracking-widest px-2 py-0.5">
                  {f.type === 'movie' ? 'Film' : 'TV'}
                </Badge>
              </td>
              <td className="px-8 py-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{f.role}</span>
              </td>
              <td className="px-8 py-5 text-right">
                <div className="flex flex-col">
                  <span className="font-black text-emerald-500 italic text-sm">{f.type === 'movie' ? formatMoney(f.gross) : 'N/A'}</span>
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Pay: {formatMoney(f.salary)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </TabsContent>
);

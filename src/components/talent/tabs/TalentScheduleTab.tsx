import { TabsContent } from '@/components/ui/tabs';
import { Talent } from '@/engine/types';
import { TalentGanttChart } from '../TalentGanttChart';

interface TalentScheduleTabProps {
  talent: Talent;
  currentWeek: number;
}

export const TalentScheduleTab: React.FC<TalentScheduleTabProps> = ({ talent, currentWeek }) => (
  <TabsContent value="schedule" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 focus-visible:outline-none">
    <div className="bg-slate-900/40 p-1 rounded-3xl border border-white/5 shadow-2xl overflow-hidden min-h-[500px]">
      <TalentGanttChart talent={talent} currentWeek={currentWeek} />
    </div>
  </TabsContent>
);

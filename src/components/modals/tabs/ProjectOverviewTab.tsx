import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, Brain, Calendar, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Project, ScriptedProject } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { calculateAudienceIndex } from '@/engine/systems/demographics';
import { cn } from '@/lib/utils';

interface ProjectOverviewTabProps {
  project: Project;
  scriptedProject: ScriptedProject | null;
}

export const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({ project, scriptedProject }) => (
  <TabsContent value="overview" className="mt-0 space-y-6">
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Package Analysis</span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Town Heat</span>
            <span className="text-sm font-black text-primary">{scriptedProject?.scriptHeat || 50}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${scriptedProject?.scriptHeat || 50}%` }} />
          </div>
          {project.flavor && (
            <div className="relative p-4 rounded-xl bg-black/40 border-l-4 border-primary/40 italic text-sm text-slate-300">
              "{project.flavor}"
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">P&L Forecast</span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">Accumulated Cost</span>
            <span className="text-sm font-black text-rose-400">-{formatMoney(project.accumulatedCost || 0)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Weekly Burn</span>
            <span className="text-rose-400/60 font-bold">-{formatMoney(project.weeklyCost)}</span>
          </div>
          <div className="pt-3 border-t border-slate-800/50 flex justify-between items-center">
            <span className="text-xs font-black uppercase text-slate-400">Current Yield</span>
            <span className="text-xl font-black text-emerald-500">{formatMoney(project.revenue)}</span>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      {[
        { label: 'Buzz', val: `${project.buzz.toFixed(0)}%`, icon: TrendingUp, color: 'text-violet-400' },
        { label: 'Complexity', val: project.budgetTier.toUpperCase(), icon: Brain, color: 'text-emerald-400' },
        { label: 'Week', val: project.weeksInPhase, icon: Calendar, color: 'text-amber-400' }
      ].map(card => (
        <div key={card.label} className="p-4 rounded-xl bg-slate-900/20 border border-slate-800/50 flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/5", card.color)}>
            <card.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{card.label}</div>
            <div className="text-lg font-black text-foreground leading-none">{card.val}</div>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Audience Resonance Breakdown</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {['male_under_25', 'female_under_25', 'male_over_25', 'female_over_25'].map(q => {
          const score = calculateAudienceIndex(project, q as import('@/engine/types').AudienceQuadrant);
          return (
            <div key={q} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{q.replace(/_/g, ' ')}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-white">{score.toFixed(2)}x</span>
                <div className={cn("w-1.5 h-1.5 rounded-full", score > 1.2 ? "bg-emerald-500" : score > 0.8 ? "bg-amber-500" : "bg-rose-500")} />
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {project.reception && (
      <div className="mt-8 p-6 bg-black/60 border border-slate-800 rounded-3xl space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3">
          {project.reception.isCultPotential && (
            <Badge className="bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-600/50 animate-pulse font-black uppercase tracking-tighter">Cult Potential</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Critic & Audience Reception</span>
        </div>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-4xl font-black italic tracking-tighter text-white">{project.reception.metaScore}</span>
              <span className="text-[10px] font-black uppercase text-slate-500 mb-1">MetaScore</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className={cn(
                "h-full transition-all duration-1000",
                project.reception.metaScore >= 75 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' :
                project.reception.metaScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
              )} style={{ width: `${project.reception.metaScore}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-4xl font-black italic tracking-tighter text-white">{project.reception.audienceScore}</span>
              <span className="text-[10px] font-black uppercase text-slate-500 mb-1">Audience</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className={cn(
                "h-full bg-primary transition-all duration-1000",
                project.reception.audienceScore >= 75 ? 'shadow-[0_0_15px_rgba(var(--primary),0.5)]' : ''
              )} style={{ width: `${project.reception.audienceScore}%` }} />
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-800/50">
          <p className="text-xs font-bold text-slate-400">
            Status: <span className={cn(
              "uppercase font-black tracking-widest ml-1",
              project.reception.status === 'Acclaimed' ? 'text-emerald-400' :
              project.reception.status === 'Mixed' ? 'text-amber-400' : 'text-rose-400'
            )}>{project.reception.status}</span>
          </p>
        </div>
      </div>
    )}
  </TabsContent>
);

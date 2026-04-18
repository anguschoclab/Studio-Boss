import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, CheckCircle2, Megaphone, TrendingUp } from 'lucide-react';
import { Project } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { cn } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface ProjectionPoint { week: string; revenue: number; }

interface ProjectMarketingTabProps {
  project: Project;
  selectedTier: 'none' | 'basic' | 'blockbuster';
  onSelectTier: (tier: 'none' | 'basic' | 'blockbuster') => void;
  projectionData: ProjectionPoint[];
  cash: number;
  onLockCampaign: () => void;
}

export const ProjectMarketingTab: React.FC<ProjectMarketingTabProps> = ({
  project, selectedTier, onSelectTier, projectionData, cash, onLockCampaign
}) => (
  <TabsContent value="marketing" className="mt-0 space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { id: 'none', name: 'Word of Mouth', cost: 0, buzz: 0, desc: 'Rely on natural cultural momentum.' },
        { id: 'basic', name: 'Targeted Digital', cost: project.budget * 0.1, buzz: 15, desc: 'Coordinated social campaign.' },
        { id: 'blockbuster', name: 'Global Blitz', cost: project.budget * 0.5, buzz: 40, desc: 'Omnichannel market saturation.' }
      ].map(tier => (
        <button
          aria-pressed={project.marketingLevel === tier.id || selectedTier === tier.id}
          key={tier.id}
          disabled={!!project.marketingLevel || cash < tier.cost}
          onClick={() => onSelectTier(tier.id as 'none' | 'basic' | 'blockbuster')}
          className={cn(
            "p-6 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between group h-52",
            project.marketingLevel === tier.id || selectedTier === tier.id
              ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.1)]'
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
          )}
        >
          {selectedTier === tier.id && (
            <div className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-bl-2xl flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-black" />
            </div>
          )}
          <div>
            <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">{tier.name}</p>
            <p className="text-2xl font-black text-white mb-2 tabular-nums">{formatMoney(tier.cost)}</p>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">{tier.desc}</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
            <TrendingUp className="w-4 h-4" /> +{tier.buzz} Project Momentum
          </div>
        </button>
      ))}
    </div>

    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-5 border-b border-white/5 bg-white/3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Yield Simulation (8-Week Lifecycle)</p>
        </div>
        <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground border-white/5">Algorithm V3.1</Badge>
      </div>
      <div className="h-[240px] w-full p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projectionData}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="week" hide />
            <YAxis hide />
            <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} animationDuration={2000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    {!project.marketingLevel ? (
      <Button
        className="w-full h-16 bg-primary text-black hover:bg-primary/90 font-black text-sm uppercase tracking-[0.3em] rounded-xl shadow-2xl transition-all active:scale-[0.98]"
        disabled={!selectedTier || cash < (selectedTier === 'basic' ? project.budget * 0.1 : selectedTier === 'blockbuster' ? project.budget * 0.5 : 0)}
        onClick={onLockCampaign}
      >
        Authorize Global Release & Dedicate Reserves
      </Button>
    ) : (
      <div className="p-6 bg-slate-900/80 border border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-primary animate-pulse" />
          <span className="text-base font-black uppercase text-white tracking-widest">Deployment: {project.marketingLevel} Initiative</span>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Box office data will populate in the week summary</p>
      </div>
    )}
  </TabsContent>
);

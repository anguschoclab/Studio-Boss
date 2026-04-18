import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Trophy } from 'lucide-react';
import { AwardBody, Project } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { FESTIVALS } from '@/engine/systems/festivals';

interface ProjectCampaignsTabProps {
  project: Project;
  cash: number;
  activeCampaign: { buzzBonus: number } | undefined;
  onSubmitToFestival: (festivalId: AwardBody) => void;
  onLaunchAwardsCampaign: (tier: 'Grassroots' | 'Trade' | 'Blitz') => void;
}

export const ProjectCampaignsTab: React.FC<ProjectCampaignsTabProps> = ({
  project, cash, activeCampaign, onSubmitToFestival, onLaunchAwardsCampaign
}) => (
  <TabsContent value="campaigns" className="mt-0 space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Awards & Festivals Pipeline</span>
        </div>

        <div className="space-y-4">
          <Select onValueChange={(v) => onSubmitToFestival(v as AwardBody)}>
            <SelectTrigger className="h-12 bg-slate-950 border-slate-800 text-xs font-black uppercase tracking-widest">
              <SelectValue placeholder="Festival Submission..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
              {FESTIVALS.map(f => (
                <SelectItem key={f.body} value={f.body} className="font-bold flex items-center">
                  {f.name} <span className="ml-2 text-emerald-400">({formatMoney(f.cost)})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Active FYC Campaign</p>
          {activeCampaign ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-amber-500 uppercase italic">Active Outreach</span>
                <Badge className="bg-amber-500 text-black font-black">+{activeCampaign.buzzBonus} BUZZ</Badge>
              </div>
              <p className="text-[10px] text-slate-300 font-medium leading-relaxed italic border-l border-amber-500/30 pl-3">
                "Direct studio outreach with Academy voters is amplifying {project.title}'s prestige profile."
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {[
                { k: 'Grassroots', c: 250000 },
                { k: 'Trade', c: 1000000 },
                { k: 'Blitz', c: 5000000 }
              ].map(tier => (
                <Button
                  key={tier.k}
                  variant="outline"
                  className="h-14 flex flex-col items-center justify-center border-slate-800 hover:border-amber-500/50 bg-black/40 group"
                  onClick={() => onLaunchAwardsCampaign(tier.k as 'Grassroots' | 'Trade' | 'Blitz')}
                  disabled={cash < tier.c}
                >
                  <span className="text-[8px] font-black text-slate-500 uppercase group-hover:text-amber-500">{tier.k}</span>
                  <span className="text-[10px] font-mono font-black text-white">{formatMoney(tier.c)}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-6 flex flex-col justify-between">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-violet-400" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IP Vault & Catalog Properties</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-xs font-bold text-slate-400">Governance</span>
              <Badge variant="outline" className="text-[10px] font-black uppercase border-slate-700 bg-slate-800">Internal Development</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-xs font-bold text-slate-400">Franchise Asset ID</span>
              <span className="text-xs font-mono text-slate-500 uppercase">{project.franchiseId || 'New/Standalone'}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/50 flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Library Residual Valuation</span>
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tighter tabular-nums">{formatMoney(project.budget * 0.15)}</div>
          </div>
        </div>
      </div>
    </div>
  </TabsContent>
);

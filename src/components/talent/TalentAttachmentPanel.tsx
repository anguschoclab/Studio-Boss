import React, { useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Project, Talent, TalentTier, TalentRole } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { getRecommendedTalentForProject } from '@/engine/utils/projectUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  CheckCircle2, 
  X,
  Target,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TalentAvatar } from './TalentAvatar';
import { CastingFeedback } from './CastingFeedback';

interface TalentAttachmentPanelProps {
  project: Project;
  onClose?: () => void;
}

export const TalentAttachmentPanel: React.FC<TalentAttachmentPanelProps> = ({ project, onClose }) => {
  const gameState = useGameStore(s => s.gameState);
  const signContract = useGameStore(s => s.signContract);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<TalentTier | 'ALL'>('ALL');
  const [selectedRole, setSelectedRole] = useState<TalentRole | 'ALL'>('ALL');
  const [showMatchesOnly, setShowMatchesOnly] = useState(false);
  const [hoveredTalentId, setHoveredTalentId] = useState<string | null>(null);

  const talentPool = useMemo(() => Object.values(gameState?.industry?.talentPool || {}), [gameState?.industry?.talentPool]);
  const contracts = useMemo(() => gameState?.studio?.internal?.contracts || [], [gameState?.studio?.internal?.contracts]);
  
  const attachedTalentIds = useMemo(() => {
    return new Set(contracts.filter(c => c.projectId === project.id).map(c => c.talentId));
  }, [contracts, project.id]);

  const attachedTalent = useMemo(() => {
    return talentPool.filter(t => attachedTalentIds.has(t.id));
  }, [talentPool, attachedTalentIds]);

  const filteredTalent = useMemo(() => {
    const pool = talentPool.filter(t => !attachedTalentIds.has(t.id));
    const recommendations = getRecommendedTalentForProject(
      pool,
      project,
      selectedRole === 'ALL' ? undefined : selectedRole,
      attachedTalent
    );

    return recommendations.filter(rec => {
      const t = rec.talent;
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = selectedTier === 'ALL' || t.tier === selectedTier;
      const matchesRole = selectedRole === 'ALL' || t.roles.includes(selectedRole);
      const matchesScore = !showMatchesOnly || rec.score >= 70;

      return matchesSearch && matchesTier && matchesRole && matchesScore;
    });
  }, [talentPool, attachedTalentIds, project, searchQuery, selectedTier, selectedRole, showMatchesOnly, attachedTalent]);

  const talentMap = useMemo(() => new Map(talentPool.map(t => [t.id, t])), [talentPool]);
  const hoveredTalent = hoveredTalentId ? talentMap.get(hoveredTalentId) : null;

  return (
    <div className="flex flex-col h-full bg-slate-950/50 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header / Active Casting */}
      <div className="p-4 border-b border-slate-800 bg-black/40 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Active Production Slate
          </h3>
          {onClose && (
            <Button variant="ghost" size="icon" aria-label="Close panel" onClick={onClose} className="h-8 w-8 text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {attachedTalent.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachedTalent.map(t => (
              <Badge key={t.id} variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-1 pl-1 pr-2 gap-2 flex items-center h-8">
                <TalentAvatar talent={t} size="xs" />
                <span className="text-[10px] font-black">{t.name}</span>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Filters & List */}
        <div className="w-full lg:w-3/5 flex flex-col border-r border-slate-800">
          <div className="p-4 space-y-4 bg-black/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                placeholder="Search industry database..." 
                className="pl-10 bg-slate-900/50 border-slate-700 text-xs" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={selectedTier} onValueChange={(v: any) => setSelectedTier(v)}>
                <SelectTrigger className="flex-1 bg-slate-900 border-slate-700 h-9 text-[10px] font-bold uppercase">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800">
                  <SelectItem value="ALL">All Tiers</SelectItem>
                  <SelectItem value="S_LIST">S-List</SelectItem>
                  <SelectItem value="A_LIST">A-List</SelectItem>
                  <SelectItem value="B_LIST">B-List</SelectItem>
                  <SelectItem value="C_LIST">C-List</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
                <SelectTrigger className="flex-1 bg-slate-900 border-slate-700 h-9 text-[10px] font-bold uppercase">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800">
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="actor">Actors</SelectItem>
                  <SelectItem value="director">Directors</SelectItem>
                  <SelectItem value="writer">Writers</SelectItem>
                  <SelectItem value="producer">Producers</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant={showMatchesOnly ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowMatchesOnly(!showMatchesOnly)}
                className={cn(
                  "h-9 text-[10px] font-black uppercase tracking-tighter",
                  showMatchesOnly ? "bg-primary text-black" : "border-slate-700 text-slate-400"
                )}
              >
                <Star className="w-3 h-3 mr-1" /> Perfect Fits
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredTalent.map(({ talent: t, score, tags }) => (
                <div 
                  key={t.id}
                  onMouseEnter={() => setHoveredTalentId(t.id)}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer"
                >
                  <TalentAvatar talent={t} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-sm text-white truncate">{t.name}</span>
                       <Badge variant="outline" className="text-[8px] h-4 px-1 border-slate-700 text-slate-400">{t.tier.replace('_', '-')}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {tags.map(tag => (
                        <span key={tag} className="text-[8px] font-bold text-primary/60 uppercase tracking-tighter">{tag}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs font-black text-white">{formatMoney(t.fee)}</div>
                    <div className={cn(
                      "text-[10px] font-bold flex items-center justify-end gap-1",
                      score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-slate-500"
                    )}>
                      {score}% Match
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 h-8 font-black text-[10px] uppercase bg-primary text-black"
                    onClick={() => {
                        signContract(t.id, project.id);
                        setHoveredTalentId(null);
                    }}
                    disabled={gameState && gameState.finance.cash < t.fee ? true : false}
                  >
                    Attach
                  </Button>
                </div>
              ))}
              {filteredTalent.length === 0 && (
                <div className="py-20 text-center space-y-4 opacity-30">
                  <Users className="w-12 h-12 mx-auto" />
                  <p className="text-xs font-black uppercase tracking-widest leading-relaxed">
                    No matching talent found<br />Adjust filters or check industry availability
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right: Feedback & Analysis */}
        <div className="hidden lg:block lg:w-2/5 bg-slate-900/30 p-6">
          {hoveredTalent ? (
            <div className="h-full flex flex-col space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                 <TalentAvatar talent={hoveredTalent} size="xl" className="ring-4 ring-primary/20 shadow-2xl" />
                 <div>
                    <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">{hoveredTalent.name}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{hoveredTalent.roles.join(' / ')} • {hoveredTalent.tier}</p>
                 </div>
              </div>

              <CastingFeedback talent={hoveredTalent} project={project} />
              
              <div className="mt-auto space-y-4">
                 <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                       <span>Market Draw</span>
                       <span className="text-emerald-400">{hoveredTalent.draw}%</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${hoveredTalent.draw}%` }} />
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
               <TrendingUp className="w-12 h-12" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                  Hover over talent in the roster<br />to perform high-fidelity<br />econometric casting analysis
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

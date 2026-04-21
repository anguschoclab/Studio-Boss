import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Project, Talent, TalentRole } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TalentAvatar } from '@/components/talent/TalentAvatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clapperboard, PenTool, Megaphone, Film, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type AttachmentPhase = 'producers_writers' | 'cast_directors';

const PHASE_CONFIG: Record<AttachmentPhase, { 
  title: string; 
  description: string; 
  roles: TalentRole[];
  icon: any;
}> = {
  producers_writers: {
    title: 'Attach Producers & Writers',
    description: 'In real Hollywood, a producer and writer are the first creative attachments after a project is greenlit. They shape the creative vision before any cast is considered.',
    roles: ['producer', 'writer'],
    icon: PenTool,
  },
  cast_directors: {
    title: 'Cast Talent & Director',
    description: 'With the script and creative vision in place, attach a director and cast acting talent to bring the project to life.',
    roles: ['actor', 'director'],
    icon: Clapperboard,
  }
};

export const AttachTalentModal = () => {
  const gameState = useGameStore(s => s.gameState);
  const updateProject = useGameStore(s => s.updateProject);
  const { selectedProjectId, selectProject } = useUIStore();
  
  const [selectedTalent, setSelectedTalent] = useState<string[]>([]);
  const [phase, setPhase] = useState<AttachmentPhase>('producers_writers');

  const project = useMemo(() => {
    if (!selectedProjectId || !gameState) return null;
    return gameState.studio.internal.projects[selectedProjectId];
  }, [selectedProjectId, gameState]);
  
  // Only show for projects in development or production that could use talent
  const shouldShow = project && (project.state === 'development' || project.state === 'production' || project.state === 'needs_greenlight');
  
  const talentPool = useMemo(() => Object.values(gameState?.industry?.talentPool || {}), [gameState?.industry?.talentPool]);
  const contracts = useMemo(() => gameState?.studio.internal.contracts || [], [gameState?.studio.internal.contracts]);
  
  // Get already attached talent for this project
  const attachedTalentIds = useMemo(() => {
    if (!project) return new Set<string>();
    return new Set(contracts.filter(c => c.projectId === project.id).map(c => c.talentId));
  }, [contracts, project]);

  const phaseConfig = PHASE_CONFIG[phase];
  
  const availableTalent = useMemo(() => {
    return talentPool
      .filter(t => 
        phaseConfig.roles.some(r => t.roles.includes(r)) &&
        !attachedTalentIds.has(t.id)
      )
      .sort((a, b) => b.prestige - a.prestige);
  }, [talentPool, phaseConfig.roles, attachedTalentIds]);

  const talentMap = useMemo(() => new Map(talentPool.map(t => [t.id, t])), [talentPool]);
  
  const totalFees = selectedTalent.reduce((sum, id) => {
    const t = talentMap.get(id);
    return sum + (t?.fee || 0);
  }, 0);

  if (!shouldShow || !project) return null;

  const handleAttach = () => {
    // In a full implementation, this would create contracts
    // For now we attach via the existing system
    selectedTalent.forEach(talentId => {
      const t = talentMap.get(talentId);
      if (!t) return;
      // Add contract
      const newContract = {
        id: `contract-${crypto.randomUUID()}`,
        talentId,
        projectId: project.id,
        fee: t.fee,
        backendPercent: 0,
      };
      // We'll update via store
      gameState && useGameStore.setState((s) => {
        if (!s.gameState) return s;
        return {
          gameState: {
            ...s.gameState,
            studio: {
              ...s.gameState.studio,
              internal: {
                ...s.gameState.studio.internal,
                contracts: [...s.gameState.studio.internal.contracts, newContract]
              }
            },
            finance: {
              ...s.gameState.finance,
              cash: s.gameState.finance.cash - t.fee
            }
          }
        };
      });
    });
    
    setSelectedTalent([]);
  };

  const PhaseIcon = phaseConfig.icon;

  // This is rendered inside the ProjectDetailModal, not as a standalone
  return null;
};

/**
 * Inline talent attachment panel to embed in ProjectDetailModal
 */
export const TalentAttachmentPanel: React.FC<{ project: Project }> = ({ project }) => {
  const gameState = useGameStore(s => s.gameState);
  const [selectedTalent, setSelectedTalent] = useState<string[]>([]);
  const [phase, setPhase] = useState<AttachmentPhase>('producers_writers');

  const talentPool = useMemo(() => Object.values(gameState?.industry?.talentPool || {}), [gameState?.industry?.talentPool]);
  const contracts = useMemo(() => gameState?.studio.internal.contracts || [], [gameState?.studio.internal.contracts]);
  
  const attachedTalentIds = useMemo(() => {
    return new Set(contracts.filter(c => c.projectId === project.id).map(c => c.talentId));
  }, [contracts, project.id]);

  const attachedTalent = useMemo(() => {
    return talentPool.filter(t => attachedTalentIds.has(t.id));
  }, [talentPool, attachedTalentIds]);

  const phaseConfig = PHASE_CONFIG[phase];
  
  const availableTalent = useMemo(() => {
    return talentPool
      .filter(t => 
        phaseConfig.roles.some(r => t.roles.includes(r)) &&
        !attachedTalentIds.has(t.id)
      )
      .sort((a, b) => b.prestige - a.prestige);
  }, [talentPool, phaseConfig.roles, attachedTalentIds]);

  const talentMap = useMemo(() => new Map(talentPool.map(t => [t.id, t])), [talentPool]);
  
  const totalFees = selectedTalent.reduce((sum, id) => {
    const t = talentMap.get(id);
    return sum + (t?.fee || 0);
  }, 0);

  const handleAttach = () => {
    selectedTalent.forEach(talentId => {
      const t = talentMap.get(talentId);
      if (!t) return;
      const newContract = {
        id: `contract-${crypto.randomUUID()}`,
        talentId,
        projectId: project.id,
        fee: t.fee,
        backendPercent: 0,
      };
      useGameStore.setState((s) => {
        if (!s.gameState) return s;
        return {
          gameState: {
            ...s.gameState,
            studio: {
              ...s.gameState.studio,
              internal: {
                ...s.gameState.studio.internal,
                contracts: [...s.gameState.studio.internal.contracts, newContract]
              }
            },
            finance: {
              ...s.gameState.finance,
              cash: s.gameState.finance.cash - t.fee
            }
          }
        };
      });
    });
    setSelectedTalent([]);
  };

  const isScripted = project.format === 'film' || project.format === 'tv';
  const showPhaseSelector = isScripted;

  return (
    <div className="space-y-4">
      {/* Currently Attached */}
      {attachedTalent.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Attached Talent
          </h4>
          <div className="flex flex-wrap gap-2">
            {attachedTalent.map(t => (
              <div key={t.id} className="flex items-center gap-2 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                <TalentAvatar talent={t} size="xs" />
                <div>
                  <span className="text-[10px] font-bold text-foreground">{t.name}</span>
                  <span className="text-[8px] font-bold text-muted-foreground ml-1.5 uppercase">{t.roles[0]}</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400">{formatMoney(t.fee)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase Selector for scripted content */}
      {showPhaseSelector && (
        <div className="flex gap-2 p-1 bg-muted/30 rounded-lg border border-border/40">
          <Button
            type="button"
            variant={phase === 'producers_writers' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setPhase('producers_writers'); setSelectedTalent([]); }}
            className={`flex-1 text-[10px] font-bold ${phase !== 'producers_writers' ? 'text-muted-foreground' : ''}`}
          >
            <PenTool className="w-3 h-3 mr-1.5" />
            Producers & Writers
          </Button>
          <Button
            type="button"
            variant={phase === 'cast_directors' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setPhase('cast_directors'); setSelectedTalent([]); }}
            className={`flex-1 text-[10px] font-bold ${phase !== 'cast_directors' ? 'text-muted-foreground' : ''}`}
          >
            <Clapperboard className="w-3 h-3 mr-1.5" />
            Cast & Directors
          </Button>
        </div>
      )}

      {/* Guidance */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
        <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
        <p className="text-[9px] text-muted-foreground leading-relaxed">{phaseConfig.description}</p>
      </div>

      {/* Available Talent */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Available {phaseConfig.roles.map(r => r.charAt(0).toUpperCase() + r.slice(1) + 's').join(' & ')}
          </h4>
          {totalFees > 0 && (
            <span className="text-[10px] font-bold text-destructive">Fees: {formatMoney(totalFees)}</span>
          )}
        </div>
        <ScrollArea className="max-h-48">
          <div className="space-y-1.5 pr-2">
            {availableTalent.slice(0, 20).map(t => (
              <label key={t.id} htmlFor={`attach-${t.id}`} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group">
                <input
                  type="checkbox"
                  id={`attach-${t.id}`}
                  checked={selectedTalent.includes(t.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedTalent([...selectedTalent, t.id]);
                    else setSelectedTalent(selectedTalent.filter(id => id !== t.id));
                  }}
                  className="rounded border-border/50 text-primary focus:ring-primary/50"
                />
                <TalentAvatar talent={t} size="xs" />
                <div className="flex-1 flex justify-between items-center text-sm">
                  <span className="font-semibold text-xs group-hover:text-primary transition-colors">
                    {t.name}
                    <span className="text-[9px] text-muted-foreground font-normal ml-1.5">({t.roles.join(', ')})</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground">P:{t.prestige}</span>
                    <span className="font-mono text-xs text-foreground/70">{formatMoney(t.fee)}</span>
                  </div>
                </div>
              </label>
            ))}
            {availableTalent.length === 0 && (
              <div className="text-xs text-center text-muted-foreground py-4">No talent available for this role.</div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Attach Button */}
      {selectedTalent.length > 0 && (
        <Button 
          onClick={handleAttach}
          className="w-full h-9 text-[10px] font-black uppercase tracking-widest"
        >
          <Users className="w-3.5 h-3.5 mr-2" />
          Attach {selectedTalent.length} Talent ({formatMoney(totalFees)})
        </Button>
      )}
    </div>
  );
};

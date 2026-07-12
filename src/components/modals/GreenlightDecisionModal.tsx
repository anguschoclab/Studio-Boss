import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { evaluateGreenlight } from '@/engine/systems/greenlight';
import { getContractsByProjectId } from '@/engine/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, UserCheck, ShieldAlert } from 'lucide-react';

/**
 * GreenlightDecisionModal — surfaces the engine's GreenlightReport for a
 * project that has reached the greenlight-ready state, and lets the player
 * Approve / Reject / Defer. This is the player-agency hook for the weekly tick
 * (Plan 2): the engine emits MODAL_TRIGGERED → GREENLIGHT_DECISION, the store
 * enqueues it, and this modal renders the decision.
 */
export const GreenlightDecisionModal = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const gameState = useGameStore((s) => s.gameState);
  const greenlightProject = useGameStore((s) => s.greenlightProject);

  if (!activeModal || activeModal.type !== 'GREENLIGHT_DECISION') return null;

  const projectId: string | undefined = activeModal.payload?.projectId;
  const project = projectId ? gameState?.entities.projects[projectId] : undefined;
  if (!project || !gameState) return null;

  const contracts = gameState.entities.contracts;
  const talentMap = gameState.entities.talents;
  const projectContracts = getContractsByProjectId(gameState.entities.contractsByProjectId, contracts, projectId!);
  const attachedTalent = projectContracts.reduce((acc, c) => {
    const t = talentMap[c.talentId];
    if (t) acc.push(t);
    return acc;
  }, [] as typeof talentMap[string][]);

  const report = evaluateGreenlight(
    project,
    gameState.finance.cash,
    attachedTalent,
    gameState.week,
    Object.values(gameState.entities.projects),
    contracts,
    talentMap
  );

  const handleApprove = () => {
    greenlightProject(projectId!);
    resolveCurrentModal();
  };
  const handleReject = () => {
    // Reject = leave in queue; just dismiss the prompt for now.
    resolveCurrentModal();
  };
  const handleDefer = () => {
    resolveCurrentModal();
  };

  const roleColor = report.roleCompleteness >= 100 ? 'text-success' : report.roleCompleteness >= 67 ? 'text-warning' : 'text-destructive';
  const schedColor = report.scheduleCertainty > 70 ? 'text-success' : report.scheduleCertainty >= 40 ? 'text-warning' : 'text-destructive';

  return (
    <Dialog open={true} onOpenChange={() => resolveCurrentModal()}>
      <DialogContent className="max-w-lg bg-black/95 backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.9)] p-0 rounded-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/40 to-primary" />
        <div className="p-10 space-y-8">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl font-black tracking-tighter uppercase italic text-foreground">
              Greenlight Committee
            </DialogTitle>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              {project.title} • {project.genre}
            </p>
          </DialogHeader>

          {/* Score */}
          <div className="flex items-center justify-between border border-white/10 bg-white/[0.02] p-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Recommendation</p>
              <p className="text-xl font-display font-black italic text-primary">{report.recommendation}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Score</p>
              <p className="text-4xl font-display font-black italic text-foreground">{report.score}</p>
            </div>
          </div>

          {/* Role + Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 border border-white/10 p-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                <UserCheck className="h-3.5 w-3.5" /> Role Completeness
              </div>
              <p className={cn('text-2xl font-display font-black italic', roleColor)}>{report.roleCompleteness}%</p>
            </div>
            <div className="space-y-2 border border-white/10 p-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                <ShieldAlert className="h-3.5 w-3.5" /> Schedule Certainty
              </div>
              <p className={cn('text-2xl font-display font-black italic', schedColor)}>{report.scheduleCertainty}%</p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {report.positives.map((p, i) => (
              <p key={`pos-${i}`} className="text-[11px] text-success/80 flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />{p}</p>
            ))}
            {report.negatives.map((n, i) => (
              <p key={`neg-${i}`} className="text-[11px] text-destructive/80 flex items-start gap-2"><XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />{n}</p>
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-3 p-6 border-t border-white/10 bg-white/[0.02]">
          <Button variant="ghost" onClick={handleDefer} className="text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" /> Defer
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReject} className="border-destructive/30 hover:bg-destructive/10 text-destructive">
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
            <Button onClick={handleApprove} className="bg-primary text-primary-foreground font-black uppercase">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Greenlight
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

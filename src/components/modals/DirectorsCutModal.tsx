import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/engine/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Film, Sparkles, TrendingUp, DollarSign } from 'lucide-react';

export const DirectorsCutModal: React.FC = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const releaseDirectorsCutAction = useGameStore(s => s.releaseDirectorsCutAction);
  const gameState = useGameStore(s => s.gameState);

  if (!activeModal || activeModal.type !== 'DIRECTORS_CUT_AVAILABLE') return null;

  const { projectId, projectTitle } = (activeModal.payload || {}) as {
    projectId: string;
    projectTitle: string;
  };

  const project = gameState?.entities?.projects?.[projectId];
  const estimatedRevenue = project
    ? formatMoney(Math.round((project.boxOffice?.openingWeekendDomestic ?? project.budget * 0.1) * 0.3))
    : 'N/A';

  const handleRelease = () => {
    if (projectId) releaseDirectorsCutAction(projectId);
    resolveCurrentModal();
  };

  return (
    <Dialog open onOpenChange={() => resolveCurrentModal()}>
      <DialogContent className="max-w-md border border-amber-500/30 bg-background">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Film className="h-5 w-5 text-amber-500" />
            </div>
            <DialogTitle className="text-lg font-black uppercase tracking-tight">
              Director's Cut Available
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-card/60 border border-border/40">
            <p className="text-sm font-bold text-foreground">{projectTitle}</p>
            <p className="text-xs text-muted-foreground mt-1">
              The sanitized theatrical cut has been in release for 4+ weeks. A director's cut can
              now be released to home video, streaming, and select theatres.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
              <DollarSign className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Est. Revenue</p>
              <p className="text-sm font-black text-emerald-400">{estimatedRevenue}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
              <TrendingUp className="h-4 w-4 text-amber-500 mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Buzz</p>
              <p className="text-sm font-black text-amber-400">+15</p>
            </div>
            <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-center">
              <Sparkles className="h-4 w-4 text-violet-500 mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Prestige</p>
              <p className="text-sm font-black text-violet-400">+8</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => resolveCurrentModal()}
            >
              Pass
            </Button>
            <Button
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold"
              onClick={handleRelease}
            >
              <Film className="h-4 w-4 mr-2" />
              Release Director's Cut
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DirectorsCutModal;

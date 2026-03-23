import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { AlertTriangle } from 'lucide-react';

export const CrisisModal = () => {
  const { showCrisisModal, crisisProjectId, closeCrisisModal } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const resolveProjectCrisis = useGameStore(s => s.resolveProjectCrisis);

  if (!gameState || !crisisProjectId) return null;

  const project = gameState.studio.internal.projects.find(p => p.id === crisisProjectId);
  if (!project || !project.activeCrisis || project.activeCrisis.resolved) {
    return null;
  }

  const crisis = project.activeCrisis;

  const handleResolve = (index: number) => {
    resolveProjectCrisis(crisisProjectId, index);
    closeCrisisModal();
  };

  return (
    <Dialog open={showCrisisModal} onOpenChange={(open) => !open && closeCrisisModal()}>
      <DialogContent className="max-w-md bg-card border border-destructive/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Production Crisis: {project.title}
          </DialogTitle>
          <DialogDescription className="text-foreground pt-4 text-sm font-medium">
            {crisis.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          {crisis.options.map((option, idx) => (
            <div key={idx} className="border border-border p-3 rounded-lg bg-background flex flex-col gap-2">
              <span className="text-sm font-semibold">{option.text}</span>
              <span className="text-xs text-muted-foreground">{option.effectDescription}</span>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => handleResolve(idx)}
              >
                Choose this path
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

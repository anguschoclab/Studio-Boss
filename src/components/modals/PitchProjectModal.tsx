import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ProjectContractType } from '@/engine/types';
import { calculateFitScore } from '@/engine/systems/buyers';

export const PitchProjectModal = () => {
  const { showPitchProject, closePitchProject, pitchingProjectId } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const pitchProject = useGameStore(s => s.pitchProject);

  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('');
  const [selectedContract, setSelectedContract] = useState<ProjectContractType>('upfront');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!gameState || !pitchingProjectId) return null;

  const project = gameState.studio.internal.projects.find(p => p.id === pitchingProjectId);
  if (!project) return null;

  const handlePitch = async () => {
    setFeedback(null);
    if (!selectedBuyerId) return;

    const success = await pitchProject(project.id, selectedBuyerId, selectedContract);

    if (success) {
      setFeedback('Pitch Successful! Project picked up.');
      setTimeout(() => {
        setFeedback(null);
        setSelectedBuyerId('');
        closePitchProject();
      }, 1500);
    } else {
      setFeedback('Pitch Failed. They passed on the project.');
    }
  };

  const handleClose = () => {
    setFeedback(null);
    setSelectedBuyerId('');
    closePitchProject();
  };

  return (
    <Dialog open={showPitchProject} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pitch Project: {project.title}</DialogTitle>
          <DialogDescription>
            Select a network or streamer to pitch this series to, and propose a contract structure.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase">1. Select Buyer</h4>
            <div className="space-y-2">
              {gameState.market.buyers.map(buyer => {
                const fitScore = calculateFitScore(project, buyer);
                return (
                  <button
                    key={buyer.id}
                    onClick={() => setSelectedBuyerId(buyer.id)}
                    aria-pressed={selectedBuyerId === buyer.id}
                    className={`w-full text-left p-3 rounded border transition-colors ${
                      selectedBuyerId === buyer.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:bg-accent'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm">{buyer.name}</span>
                      <Badge variant="outline" className="text-[10px]">{buyer.archetype}</Badge>
                    </div>
                    {buyer.currentMandate && (
                      <p className="text-xs text-muted-foreground">
                        Mandate: <span className="text-foreground">{buyer.currentMandate.type.replace('_', ' ')}</span>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Est. Fit: {Math.round(fitScore)}/100</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase">2. Deal Structure</h4>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedContract('upfront')}
                aria-pressed={selectedContract === 'upfront'}
                className={`w-full text-left p-3 rounded border transition-colors ${
                  selectedContract === 'upfront'
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:bg-accent'
                }`}
              >
                <span className="font-semibold text-sm block">High Upfront Fee</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Buyer fully funds production (0 weekly cost). Studio retains 0% backend. Harder to sell.
                </p>
              </button>

              <button
                onClick={() => setSelectedContract('deficit')}
                aria-pressed={selectedContract === 'deficit'}
                className={`w-full text-left p-3 rounded border transition-colors ${
                  selectedContract === 'deficit'
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:bg-accent'
                }`}
              >
                <span className="font-semibold text-sm block">Deficit Financing</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Studio pays 30% of production costs. Studio retains 100% backend. Easier to sell.
                </p>
              </button>
            </div>

            <div className="pt-6">
              <Button
                onClick={handlePitch}
                disabled={!selectedBuyerId || !!feedback}
                className="w-full"
              >
                Pitch Project
              </Button>
              {feedback && (
                <p className={`mt-4 text-center text-sm font-semibold ${feedback.includes('Failed') ? 'text-destructive' : 'text-success'}`}>
                  {feedback}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

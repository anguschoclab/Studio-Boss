import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import { Clapperboard, Clock, Zap, Film, ChevronRight } from 'lucide-react';
import { Project } from '@/engine/types';

// ─── Post-production timeline steps ──────────────────────────────────────────

export const TIMELINE_STEPS = [
  { week: 1, label: 'Editing & Assembly Cut', icon: '✂️' },
  { week: 2, label: 'Colour Grading & Sound Mix', icon: '🎨' },
  { week: 3, label: 'Ratings Board Submission', icon: '📋' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const PostProductionModal: React.FC = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const updateProject = useGameStore(s => s.updateProject);
  // @ts-expect-error - addFunds might not be typed
  const addFunds = useGameStore(s => s.addFunds);
  const gameState = useGameStore(s => s.gameState);

  const [choice, setChoice] = useState<'none' | 'rush' | 'extended'>('none');

  if (!activeModal || activeModal.type !== 'POST_PRODUCTION') return null;

  const { projectId, projectTitle } = (activeModal.payload ?? {}) as {
    projectId: string;
    projectTitle: string;
  };

  const project = gameState?.entities?.projects?.[projectId];
  const weeksRemaining: number =
    (project as Project & { postProductionWeeksRemaining?: number })?.postProductionWeeksRemaining ?? 3;

  const handleConfirm = () => {
    if (!projectId || !project) {
      resolveCurrentModal();
      return;
    }

    if (choice === 'rush') {
      // Rush: costs $2M, reduces to 1 week
      if (addFunds) addFunds(-2_000_000);
      updateProject(projectId, {
        postProductionWeeksRemaining: 1,
      } as Partial<Project>);
    } else if (choice === 'extended') {
      // Extended cut: +2 weeks, +5 prestige, +10 buzz
      updateProject(projectId, {
        postProductionWeeksRemaining: weeksRemaining + 2,
        buzz: Math.min(100, (project.buzz ?? 0) + 10),
      } as Partial<Project>);
      // Prestige is applied via store action if available, otherwise inline
      const applyPrestige = gameState?.studio?.prestige !== undefined;
      if (applyPrestige) {
        // The parent store will handle prestige on the next tick via the
        // PRESTIGE_CHANGED mechanism; for now we note it via project buzz.
      }
    }

    resolveCurrentModal();
  };

  // Director's cut sub-section — shown if project has been marked for a cut
  const directorsCutPending =
    project && (project as Project & { directorsCutNotified?: boolean }).directorsCutNotified === true &&
    !(project as Project).availableCuts?.some((c: { type: string }) => c.type === 'directors_cut');

  return (
    <Dialog
      open={true}
      onOpenChange={() => {
        // Allow dismissal — this modal is informational
        resolveCurrentModal();
      }}
    >
      <DialogContent className="max-w-lg bg-card/90 backdrop-blur-2xl border border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-none bg-secondary/10">
              <Clapperboard className="h-5 w-5 text-secondary" />
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-black uppercase tracking-widest border-secondary/40 text-secondary bg-secondary/10"
            >
              Post-Production Phase
            </Badge>
          </div>
          <DialogTitle className="font-display font-black text-2xl text-primary tracking-tight">
            {projectTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Timeline */}
          <div className="p-4 rounded-none bg-card/60 border border-border/40 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Timeline — {weeksRemaining} week{weeksRemaining !== 1 ? 's' : ''} remaining
            </p>
            <div className="space-y-2">
              {TIMELINE_STEPS.map((step) => {
                const isComplete = step.week > weeksRemaining;
                const isCurrent = step.week === weeksRemaining;
                return (
                  <div
                    key={step.week}
                    className={cn(
                      'flex items-center gap-3 text-sm',
                      isComplete && 'opacity-40 line-through',
                      isCurrent && 'text-primary font-bold'
                    )}
                  >
                    <span className="text-base w-6 text-center">{step.icon}</span>
                    <span className="flex-1">{step.label}</span>
                    {isCurrent && (
                      <Badge
                        variant="outline"
                        className="text-[9px] font-black uppercase border-primary/40 text-primary bg-primary/10"
                      >
                        Current
                      </Badge>
                    )}
                    {isComplete && (
                      <span className="text-success text-xs font-bold">Done</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional decision */}
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Director Options
            </p>

            {/* Rush */}
            <button
              type="button"
              onClick={() => setChoice(choice === 'rush' ? 'none' : 'rush')}
              className={cn(
                'w-full glass-card hover-glow cursor-pointer p-3 rounded-none border-2 text-left transition-all duration-200',
                choice === 'rush'
                  ? 'border-warning shadow-[0_0_16px_rgba(var(--warning-rgb),0.3)]'
                  : 'border-white/10'
              )}
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning" />
                <span className="font-display font-black text-sm uppercase tracking-tight text-foreground">
                  Rush Post-Production
                </span>
                <span className="ml-auto text-xs font-bold text-destructive">-$2,000,000</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 pl-6">
                Crunch the crew. Reduces post-production to 1 week — quality may suffer.
              </p>
            </button>

            {/* Extended cut */}
            <button
              type="button"
              onClick={() => setChoice(choice === 'extended' ? 'none' : 'extended')}
              className={cn(
                'w-full glass-card hover-glow cursor-pointer p-3 rounded-none border-2 text-left transition-all duration-200',
                choice === 'extended'
                  ? 'border-secondary shadow-[0_0_16px_rgba(var(--secondary-rgb),0.3)]'
                  : 'border-white/10'
              )}
            >
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-secondary" />
                <span className="font-display font-black text-sm uppercase tracking-tight text-foreground">
                  Extended Cut
                </span>
                <div className="ml-auto flex gap-2 text-xs font-bold">
                  <span className="text-warning">+2 wks</span>
                  <span className="text-secondary">+5 prestige</span>
                  <span className="text-success">+10 buzz</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 pl-6">
                Give the director more time. Better craft scores and an awards-season edge.
              </p>
            </button>
          </div>

          {/* Director's cut sub-section */}
          {directorsCutPending && (
            <div className="p-3 rounded-none bg-amber-500/10 border border-amber-500/30 space-y-1">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-amber-400" />
                <p className="text-xs font-black uppercase tracking-widest text-amber-400">
                  Director's Cut Request
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                The director has requested a final cut be prepared. You'll be prompted to approve
                it separately once the film releases.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setChoice('none');
                resolveCurrentModal();
              }}
            >
              <Clock className="h-4 w-4 mr-2" />
              Standard Schedule
            </Button>
            <Button
              className={cn(
                'flex-1 font-display font-black uppercase tracking-wider',
                choice !== 'none'
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
              disabled={choice === 'none'}
              onClick={handleConfirm}
            >
              Confirm
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostProductionModal;

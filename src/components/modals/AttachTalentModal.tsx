import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TalentAttachmentPanel } from '@/components/talent/TalentAttachmentPanel';
import { Users } from 'lucide-react';

/**
 * A standalone modal for attaching talent to a project.
 * Primarily used when clicking "Quick Cast" or coming from specific notifications.
 */
export const AttachTalentModal = () => {
  const gameState = useGameStore(s => s.gameState);
  const { selectedProjectId, selectProject } = useUIStore();
  
  const project = useMemo(() => {
    if (!selectedProjectId || !gameState) return null;
    return gameState.studio.internal.projects[selectedProjectId];
  }, [selectedProjectId, gameState]);
  
  // Only show if the project is actually in a state that allows casting
  const canCast = project && (['pitching', 'development', 'needs_greenlight', 'production'].includes(project.state));

  if (!project || !canCast) return null;

  return (
    <Dialog open={!!selectedProjectId} onOpenChange={() => selectProject(null)}>
      <DialogContent className="max-w-4xl h-[80vh] bg-slate-950 border-slate-800 p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 border-b border-slate-800 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
                Talent Attachment: {project.title}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                Negotiate creative & commercial attachments for your slate
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6">
           <TalentAttachmentPanel project={project} onClose={() => selectProject(null)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

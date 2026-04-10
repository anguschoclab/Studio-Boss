import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { AlertTriangle, UserX, DollarSign, Zap } from 'lucide-react';
import { getCrisisData } from '@/engine/utils/impactUtils';
import { CrisisOption, ActiveCrisis } from '@/engine/types';

export const CrisisModal = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const resolveProjectCrisis = useGameStore(s => s.resolveProjectCrisis);

  if (!gameState || !activeModal || activeModal.type !== 'CRISIS') return null;

  const payload = activeModal.payload as { projectId: string; crisis?: ActiveCrisis } | undefined;
  if (!payload || !payload.projectId) {
    resolveCurrentModal();
    return null;
  }

  const { projectId, crisis: modalCrisis } = payload;
  const project = gameState?.entities?.projects[projectId];
  
  // Use either the crisis passed in the modal payload, or the one on the project
  const activeCrisis = modalCrisis || project?.activeCrisis;
  
  if (!activeCrisis) {
    resolveCurrentModal();
    return null;
  }

  // Attempt to fill missing description/options from the static data pool if this is a templated crisis
  const crisisTemplate = getCrisisData(activeCrisis.crisisId);
  const description = activeCrisis.description || crisisTemplate?.description || "An unexpected production crisis has occurred.";
  const options = activeCrisis.options || crisisTemplate?.options || [];
  
  if (options.length === 0) {
    console.warn(`Crisis ${activeCrisis.crisisId} has no resolution options.`);
    resolveCurrentModal();
    return null;
  }

  const handleResolve = (index: number) => {
    resolveProjectCrisis(projectId, index);
    resolveCurrentModal();
  };

  const getOptionIcon = (text: string) => {
    const t = (text || '').toLowerCase();
    if (t.includes('fire') || t.includes('remove')) return <UserX className="h-4 w-4" />;
    if (t.includes('pay') || t.includes('settle') || t.includes('cost')) return <DollarSign className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const getOptionVariant = (text: string): "destructive" | "default" | "outline" | "secondary" | "ghost" | "link" | null | undefined => {
    const t = (text || '').toLowerCase();
    if (t.includes('fire') || t.includes('remove') || t.includes('destructive')) return 'destructive';
    if (t.includes('pay') || t.includes('settle')) return 'default';
    return 'secondary';
  };

  return (
    <Dialog 
      open={true} 
      onOpenChange={(open) => {
        if (!open) return;
      }}
    >
      <DialogContent 
        className="max-w-md bg-slate-950 border-2 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.3)] animate-in fade-in zoom-in duration-300 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="absolute inset-0 bg-red-950/20 animate-pulse pointer-events-none rounded-lg" />
        
        <DialogHeader className="relative z-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-600 rounded-full animate-bounce">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-black text-center uppercase tracking-tighter text-red-500">
            Production Crisis
          </DialogTitle>
          <DialogDescription className="text-slate-200 pt-4 text-base font-bold text-center leading-tight">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-6 relative z-10 max-h-[60vh] overflow-y-auto pr-2">
          {options.map((option: CrisisOption, idx: number) => (
            <div key={idx} className="group relative">
              <Button
                variant={getOptionVariant(option.text)}
                className={`w-full h-auto py-4 flex flex-col items-start gap-1 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                   (option.text || '').toLowerCase().includes('pay') ? 'bg-amber-500 hover:bg-amber-600 text-black' : ''
                }`}
                onClick={() => handleResolve(idx)}
              >
                <div className="flex items-center gap-2">
                  {getOptionIcon(option.text)}
                  <span className="text-lg font-black uppercase tracking-tight">{option.text}</span>
                </div>
                <span className="text-xs opacity-80 font-medium px-6">{option.effectDescription}</span>
              </Button>
            </div>
          ))}
        </div>
        
        <div className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-black animate-pulse relative z-10">
          Status: {activeCrisis.haltedProduction ? 'PRODUCTION HALTED' : 'SLUGGISH PROGRESS'}
        </div>
      </DialogContent>
    </Dialog>
  );
};



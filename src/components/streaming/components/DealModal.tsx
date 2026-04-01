import React, { useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Buyer, Project, ProjectContractType } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Handshake, 
  Film, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Target,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateFitScore } from '@/engine/systems/buyers';

interface DealModalProps {
  buyer: Buyer;
  open: boolean;
  onClose: () => void;
}

export const DealModal: React.FC<DealModalProps> = ({ buyer, open, onClose }) => {
  const { gameState, pitchProject } = useGameStore();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [contractType, setContractType] = useState<ProjectContractType>('standard');
  const [isPitching, setIsPitching] = useState(false);
  const [dealResult, setDealResult] = useState<{ success: boolean; message: string } | null>(null);

  const eligibleProjects = useMemo(() => {
    if (!gameState) return [];
    return Object.values(gameState.studio.internal.projects).filter(
      (p: Project) => p.state === 'development' || p.state === 'production' || p.state === 'needs_greenlight'
    );
  }, [gameState]);

  const selectedProjectObj = useMemo(
    () => eligibleProjects.find(p => p.id === selectedProject),
    [eligibleProjects, selectedProject]
  );

  const fitScore = useMemo(() => {
    if (!selectedProjectObj || !gameState) return 0;
    return calculateFitScore(selectedProjectObj, buyer, gameState.week, Object.values(gameState.studio.internal.projects));
  }, [selectedProjectObj, buyer, gameState]);

  const handlePitch = async () => {
    if (!selectedProject) return;
    setIsPitching(true);
    
    // Artificial delay for "Negotiation" feel
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = await pitchProject(selectedProject, buyer.id, contractType);
    
    setDealResult({
      success,
      message: success 
        ? `${buyer.name} has greenlit "${selectedProjectObj?.title}" on a ${contractType} deal!` 
        : `${buyer.name} passed on the pitch. The project's current fit score (${Math.round(fitScore)}) didn't meet their executive mandate.`
    });
    setIsPitching(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-card border-border shadow-2xl overflow-hidden p-0">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-violet-500 to-primary/20" />
        
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
               <Handshake className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Studio Distribution Negotiation</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{buyer.name} • Executive Review</p>
            </div>
          </div>

          {dealResult ? (
            <div className={cn(
              "p-6 rounded-2xl border animate-in zoom-in-95 duration-300",
              dealResult.success ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
            )}>
              <div className="flex items-start gap-4">
                {dealResult.success ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-500" />
                )}
                <div className="space-y-2">
                   <h4 className={cn("text-sm font-black uppercase tracking-widest", dealResult.success ? "text-emerald-500" : "text-rose-500")}>
                     {dealResult.success ? 'Deal Signed!' : 'Pitch Rejected'}
                   </h4>
                   <p className="text-sm text-muted-foreground leading-relaxed italic">"{dealResult.message}"</p>
                   <Button onClick={onClose} className="mt-4 h-9 text-[10px] font-black uppercase" variant="outline">Back to Dashboard</Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Selection */}
                <div className="space-y-3">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                     <Film className="w-4 h-4" /> Available Slate
                   </h4>
                   <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                      {eligibleProjects.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProject(p.id)}
                          className={cn(
                            "w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden group",
                            selectedProject === p.id ? "bg-primary/10 border-primary/40" : "bg-white/5 border-white/5 hover:border-white/10"
                          )}
                        >
                          {selectedProject === p.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                          <div className="font-black text-xs uppercase truncate group-hover:text-primary transition-colors">{p.title}</div>
                          <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">{p.genre} • {p.budgetTier}</div>
                        </button>
                      ))}
                   </div>
                </div>

                {/* Analysis Column */}
                <div className="space-y-4">
                   <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-black/20 space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strategic Fit</span>
                         <span className={cn("text-lg font-black italic", fitScore >= 70 ? 'text-emerald-400' : fitScore >= 50 ? 'text-primary' : 'text-rose-400')}>
                           {Math.round(fitScore)}%
                         </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-700", fitScore >= 70 ? 'bg-emerald-500' : fitScore >= 50 ? 'bg-primary' : 'bg-rose-500')} 
                          style={{ width: `${fitScore}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground italic leading-snug">
                        {selectedProjectObj 
                          ? (fitScore >= 50 ? `${buyer.name} is showing positive early interest in this genre.` : `${buyer.name} is hesitant about this package's commercial floor.`)
                          : 'Select a project to analyze mandate alignment.'}
                      </p>
                   </div>

                   <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deal Structure</span>
                      <div className="flex gap-2">
                        {(['standard', 'deficit', 'upfront'] as ProjectContractType[]).map(t => (
                          <button
                            key={t}
                            onClick={() => setContractType(t)}
                            className={cn(
                              "flex-1 h-9 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all",
                              contractType === t ? "bg-primary text-black border-primary shadow-lg" : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                   </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-3">
                 <Button variant="ghost" onClick={onClose} className="h-12 px-6 text-[10px] font-black uppercase">Cancel</Button>
                 <Button 
                   onClick={handlePitch}
                   disabled={!selectedProject || isPitching}
                   className="flex-1 h-12 bg-primary text-black hover:bg-primary/90 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/10 relative overflow-hidden"
                 >
                   {isPitching ? <div className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Reviewing Package...</div> : 'Send Official Pitch'}
                 </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

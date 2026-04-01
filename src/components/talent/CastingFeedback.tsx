import React from 'react';
import { Talent, Project, GameState } from '@/engine/types';
import { calculateWillingness } from '@/engine/systems/talent/willingnessEngine';
import { useGameStore } from '@/store/gameStore';
import { 
  Heart, 
  TrendingUp, 
  Building2, 
  AlertCircle, 
  CheckCircle2,
  Brain,
  Star,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CastingFeedbackProps {
  talent: Talent;
  project: Project;
}

export const CastingFeedback: React.FC<CastingFeedbackProps> = ({ talent, project }) => {
  const gameState = useGameStore(s => s.gameState);
  
  if (!gameState) return null;

  const feedback = calculateWillingness(talent, project, gameState);
  const score = feedback.score;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-black/40 space-y-5 animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Brain className="w-5 h-5 text-violet-400" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Talent Psychology Fit</span>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl",
          score >= 70 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : 
          score >= 40 ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : 
          "bg-rose-500/20 text-rose-500 border border-rose-500/30"
        )}>
          {score}% Agreement Likelihood
        </div>
      </div>

      <div className="space-y-3">
        {feedback.reasons.map((reason, idx) => (
          <div key={idx} className="flex items-start gap-3 group">
             <div className="mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
             </div>
             <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic group-hover:text-slate-200 transition-colors">
                "{reason}"
             </p>
          </div>
        ))}
      </div>

      <div className={cn(
        "p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-3",
        feedback.finalVerdict === 'willing' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500/80" : 
        feedback.finalVerdict === 'hesitant' ? "bg-amber-500/5 border-amber-500/10 text-amber-500/80" : 
        "bg-rose-500/5 border-rose-500/10 text-rose-500/80"
      )}>
        {feedback.finalVerdict === 'willing' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        Verdict: {feedback.finalVerdict === 'willing' ? 'Attached & Aggressive' : feedback.finalVerdict === 'hesitant' ? 'Soft Pass / Negotiation Required' : 'Hard Pass / Uninterested'}
      </div>
    </div>
  );
};

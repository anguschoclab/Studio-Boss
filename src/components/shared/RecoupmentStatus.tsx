import React from 'react';
import { Project } from '@/engine/types';
import { formatMoney } from '@/engine/utils';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { TrendingUp, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecoupmentStatusProps {
  project: Project;
  className?: string;
}

export const RecoupmentStatus: React.FC<RecoupmentStatusProps> = ({ project, className }) => {
  const investment = (project.budget || 0) + (project.marketingBudget || 0);
  const revenue = project.revenue || 0;
  
  if (investment === 0) return null;

  const progress = Math.min(100, (revenue / investment) * 100);
  const isProfitable = revenue >= investment;

  return (
    <TooltipWrapper 
      tooltip={
        <div className="space-y-4 p-2 min-w-[200px]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic border-b border-white/5 pb-3 mb-1">RECOUPMENT AUDIT</p>
          <div className="space-y-2">
            <div className="flex justify-between text-[9px] gap-6">
              <span className="text-muted-foreground/40 uppercase font-black italic tracking-[0.2em]">INVESTMENT</span>
              <span className="font-display font-black text-foreground italic tracking-tighter">{formatMoney(investment)}</span>
            </div>
            <div className="flex justify-between text-[9px] gap-6">
              <span className="text-muted-foreground/40 uppercase font-black italic tracking-[0.2em]">REVENUE</span>
              <span className="font-display font-black text-emerald-400 italic tracking-tighter">{formatMoney(revenue)}</span>
            </div>
          </div>
          {isProfitable ? (
            <div className="bg-emerald-400/5 p-3 border border-emerald-400/10">
              <p className="text-[8px] text-emerald-400/60 uppercase font-black italic tracking-[0.2em] leading-relaxed flex items-start gap-2">
                <Info className="w-3 h-3 shrink-0" /> NET POINTS ROYALTIES ACTIVE
              </p>
            </div>
          ) : (
            <p className="text-[8px] text-muted-foreground/20 uppercase font-black italic tracking-[0.2em] leading-relaxed">
              TALENT ROYALTIES TRIGGER AFTER BREAK-EVEN
            </p>
          )}
        </div>
      }
      side="top"
    >
      <div className={cn("space-y-3", className)}>
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] italic leading-none">
          <span className="flex items-center gap-2 text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors">
            {isProfitable ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            ) : (
              <TrendingUp className="h-3 w-3 text-primary" />
            )}
            {isProfitable ? 'PROFITABLE' : 'RECOUPING'}
          </span>
          <span className={cn("font-display tracking-tighter italic", isProfitable ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "text-foreground")}>
            {Math.round(progress)}%
          </span>
        </div>
        
        <div className="h-2 bg-white/5 rounded-none overflow-hidden border border-white/5 relative">
          <div
            className={cn(
              "h-full rounded-none transition-all duration-1000 relative",
              isProfitable ? "bg-emerald-400" : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          {!isProfitable && (
             <div className="absolute top-0 right-0 h-full w-[1px] bg-white/10" title="Break-even point" />
          )}
        </div>
      </div>
    </TooltipWrapper>
  );
};

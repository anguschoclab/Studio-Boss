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
        <div className="space-y-1.5 p-1">
          <p className="font-bold border-b border-white/10 pb-1 mb-1">Recoupment Audit</p>
          <div className="flex justify-between text-[10px] gap-4">
            <span className="text-muted-foreground uppercase font-black">Total Investment:</span>
            <span className="font-mono text-foreground">{formatMoney(investment)}</span>
          </div>
          <div className="flex justify-between text-[10px] gap-4">
            <span className="text-muted-foreground uppercase font-black">Lifetime Revenue:</span>
            <span className="font-mono text-success">{formatMoney(revenue)}</span>
          </div>
          {isProfitable ? (
            <p className="text-[9px] text-primary italic mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" /> Net Points royalties are active.
            </p>
          ) : (
            <p className="text-[9px] text-muted-foreground italic mt-2">
              Talent royalties trigger after break-even.
            </p>
          )}
        </div>
      }
      side="top"
    >
      <div className={cn("space-y-1.5", className)}>
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.15em]">
          <span className="flex items-center gap-1 text-muted-foreground/60 group-hover:text-muted-foreground/80 transition-colors">
            {isProfitable ? (
              <CheckCircle2 className="h-2.5 w-2.5 text-success" />
            ) : (
              <TrendingUp className="h-2.5 w-2.5 text-primary" />
            )}
            {isProfitable ? 'Profitable' : 'Recouping'}
          </span>
          <span className={cn("font-mono", isProfitable ? "text-success drop-shadow-[0_0_5px_rgba(34,197,94,0.3)]" : "text-foreground")}>
            {Math.round(progress)}%
          </span>
        </div>
        
        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 relative",
              isProfitable ? "bg-success" : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
          </div>
          {!isProfitable && (
             <div className="absolute top-0 right-0 h-full w-[2px] bg-white/10" title="Break-even point" />
          )}
        </div>
      </div>
    </TooltipWrapper>
  );
};

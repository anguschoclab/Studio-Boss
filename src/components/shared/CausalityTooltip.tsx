import * as React from "react";
import {




} from "@/components/ui/tooltip";
import { FinancialCausalityEntry } from "@/engine/types/state.types";
import { formatMoney } from "@/engine/utils";

interface CausalityTooltipProps {
  children: React.ReactNode;
  value: number;
  causality?: FinancialCausalityEntry[];
  label: string;
}

export const CausalityTooltip: React.FC<CausalityTooltipProps> = ({
  children,
  value,
  causality,
  label,
}) => {
  // Only show tooltip if there are causality entries
  const hasCausality = causality && causality.length > 0;

  if (!hasCausality) {
    return <>{children}</>;
  }

  return (
    <TooltipWrapper
      tooltip={
        <div className="space-y-3 max-w-xs">
          <p className="text-primary font-bold text-[10px] uppercase tracking-widest">
            {label}: {formatMoney(value)}
          </p>
          <div className="space-y-2 border-t border-white/10 pt-2">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              Why this changed:
            </p>
            {causality.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px]">
                <span className={c.magnitude >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {c.magnitude >= 0 ? '▲' : '▼'}
                </span>
                <div>
                  <p className="font-semibold">{c.factor}: {c.effect}</p>
                  <p className="text-muted-foreground/60 italic">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <div className="cursor-help">
        {children}
      </div>
    </TooltipWrapper>
  );
};

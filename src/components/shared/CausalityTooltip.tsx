import * as React from "react";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { FinancialCausalityEntry } from "@/engine/types/state.types";
import { formatMoney } from "@/engine/utils";

interface CausalityProps {
  children: React.ReactNode;
  value: number;
  causality?: FinancialCausalityEntry[];
  label: string;
}

export const CausalityTooltip: React.FC<CausalityProps> = ({
  children,
  value,
  causality,
  label,
}) => {
  // Only show tooltip if there are causality entries
  if (!causality || causality.length === 0) {
    return <>{children}</>;
  }

  // Calculate base value (the starting point before modifiers)
  const totalModifications = causality.reduce((sum, entry) => sum + entry.magnitude, 0);
  const baseValue = value - totalModifications;

  const tooltipContent = (
    <div className="space-y-3 w-[260px]">
      <div className="flex justify-between items-center border-b border-white/10 pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label} Base</span>
        <span className="font-mono text-xs">{formatMoney(baseValue)}</span>
      </div>

      <div className="space-y-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Causality Modifiers</p>
        {causality.map((entry, idx) => (
          <div key={`${entry.factor}-${idx}`} className="flex justify-between items-start text-xs">
            <div className="pr-2">
              <p className="font-bold text-slate-300">{entry.factor}</p>
              <p className="text-[9px] text-slate-500">{entry.effect}</p>
            </div>
            <span className={`font-mono shrink-0 font-bold ${entry.magnitude >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {entry.magnitude > 0 ? '+' : ''}{formatMoney(entry.magnitude)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Net Value</span>
        <span className="font-mono text-sm font-black text-white">{formatMoney(value)}</span>
      </div>
    </div>
  );

  return (
    <TooltipWrapper
      tooltip={tooltipContent}
      side="right"
      align="center"
    >
      <div className="cursor-help inline-block decoration-dashed underline decoration-slate-600 underline-offset-4 decoration-1">
        {children}
      </div>
    </TooltipWrapper>
  );
};

import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {BUDGET_TIERS} from "@/engine/data/budgetTiers";
import {BudgetTierKey} from "@/engine/types";
import {formatMoney} from "@/engine/utils";

interface BudgetEstimates {
  weeklyCost: number;
  devWeeks: number;
  prodWeeks: number;
  budget: number;
}

interface BudgetTierFieldProps {
  value: BudgetTierKey;
  onChange: (value: BudgetTierKey) => void;
  estimates: BudgetEstimates;
}

/**
 * Budget tier select + live production estimates panel
 * (weekly burn, dev/production weeks, total budget).
 */
export const BudgetTierField = ({ value, onChange, estimates }: BudgetTierFieldProps) => (
  <div className="space-y-2">
    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 font-black italic">
      Budget Tier
    </Label>
    <Select value={value} onValueChange={(v) => onChange(v as BudgetTierKey)}>
      <SelectTrigger
        aria-label="Budget Tier"
        className="h-14 bg-black/40 border-white/5 rounded-none font-display font-black italic uppercase tracking-tight text-xs"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-none border-white/10 bg-black/95 backdrop-blur-xl">
        {Object.entries(BUDGET_TIERS).map(([key, tier]) => (
          <SelectItem
            key={key}
            value={key}
            className="rounded-none font-display font-black italic uppercase text-[10px] tracking-widest py-3"
          >
            <div className="flex flex-col items-start gap-0.5">
              <span>{tier.label}</span>
              <span className="text-[9px] text-muted-foreground/40 tracking-[0.2em] font-medium">
                {tier.name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* Estimates Panel */}
    <div className="p-4 bg-black/40 border border-white/5 space-y-2">
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[10px] font-black uppercase tracking-[0.2em] italic">
        <div className="flex justify-between border-b border-white/5 pb-1">
          <span className="text-muted-foreground/40">Weekly Cost</span>
          <span className="text-foreground/80 font-display">
            {formatMoney(estimates.weeklyCost)}
          </span>
        </div>
        <div className="flex justify-between border-b border-white/5 pb-1">
          <span className="text-muted-foreground/40">Total Budget</span>
          <span className="text-primary font-display">
            {formatMoney(estimates.budget)}
          </span>
        </div>
        <div className="flex justify-between border-b border-white/5 pb-1">
          <span className="text-muted-foreground/40">Dev Phase</span>
          <span className="text-foreground/80 font-display">{estimates.devWeeks}w</span>
        </div>
        <div className="flex justify-between border-b border-white/5 pb-1">
          <span className="text-muted-foreground/40">Prod Phase</span>
          <span className="text-foreground/80 font-display">{estimates.prodWeeks}w</span>
        </div>
      </div>
    </div>
  </div>
);

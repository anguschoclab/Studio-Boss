import {Project, Buyer} from "@/engine/types";
import {TooltipWrapper} from "@/components/ui/tooltip-wrapper";
import {DollarSign} from "lucide-react";
import {formatMoney} from "@/engine/utils";
import {DistributionBadge} from "../../shared/DistributionBadge";

interface DistributionDealRowProps {
  project: Project;
  buyer: Buyer | null | undefined;
}

/**
 * Distribution deal strip: buyer badge + projected weekly revenue flow.
 * Renders nothing when the project has no distribution status or buyer.
 */
export const DistributionDealRow = ({ project, buyer }: DistributionDealRowProps) => {
  if (!project.distributionStatus || !buyer) return null;

  // Estimate weekly streaming revenue (passive revenue from deal)
  const weeklyRevenueForecast =
    project.distributionStatus === "streaming" && project.buyerId
      ? Math.floor(project.budget * 0.02) // ~2% of budget per week from streaming deal
      : project.distributionStatus === "theatrical"
        ? Math.floor(project.budget * 0.03)
        : 0;

  return (
    <div className="space-y-3 border-t border-white/5 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <DistributionBadge
            status={project.distributionStatus}
            className="rounded-none shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 truncate max-w-[120px] italic">
            {buyer.name.toUpperCase()}
          </span>
        </div>
        {weeklyRevenueForecast > 0 && (
          <TooltipWrapper tooltip="PROJECTED WEEKLY FISCAL FLOW" side="top">
            <div className="flex items-center gap-2 bg-emerald-400/5 px-3 py-1.5 border border-emerald-400/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" strokeWidth={3} />
              <span className="text-[11px] font-display font-black italic text-emerald-400 tracking-tighter">
                {formatMoney(weeklyRevenueForecast).toUpperCase()}/WK
              </span>
            </div>
          </TooltipWrapper>
        )}
      </div>
    </div>
  );
};

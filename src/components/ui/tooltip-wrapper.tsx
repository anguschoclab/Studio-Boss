import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  tooltip?: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  enabled?: boolean;
}

export const TooltipWrapper = ({
  children,
  tooltip,
  side = "top",
  align = "center",
  enabled = true,
}: TooltipWrapperProps) => {
  if (!tooltip || !enabled) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        className="z-50 font-black text-[10px] uppercase tracking-widest bg-card border border-white/10 text-foreground animate-in fade-in-0 zoom-in-95 shadow-2xl"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
};

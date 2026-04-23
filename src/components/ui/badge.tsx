/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-none border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] italic transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Archetype variants - Design Bible Section 8.2
        archetype: "border-transparent bg-primary/20 text-primary border-primary/30",
        // Status variants
        status: "border-transparent bg-success/20 text-success border-success/30",
        warning: "border-transparent bg-amber-500/20 text-amber-400 border-amber-500/30",
        // Tier variants
        tier: "border-transparent bg-secondary/20 text-secondary border-secondary/30",
        // Format variants
        format: "border-transparent bg-muted/50 text-muted-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

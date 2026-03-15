import { Link, LinkProps } from "@tanstack/react-router";
import { forwardRef } from "react";

interface NavLinkCompatProps extends Omit<LinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, to, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        to={to as string}
        activeProps={{ className: activeClassName }}
        className={className}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };

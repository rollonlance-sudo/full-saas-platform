import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  grid?: boolean;
  grain?: boolean;
};

export function AuroraBackground({
  className,
  children,
  grid = true,
  grain = true,
  ...props
}: Props) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden aurora-bg",
        grain && "noise-overlay",
        className,
      )}
      {...props}
    >
      {grid && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 grid-pattern opacity-40"
        />
      )}
      {children}
    </div>
  );
}

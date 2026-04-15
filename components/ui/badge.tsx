import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "aurora";

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }
>(({ className, variant = "default", ...props }, ref) => {
  const variants: Record<Variant, string> = {
    default:
      "border-transparent bg-[color-mix(in_oklab,var(--primary)_14%,transparent)] text-[var(--primary)]",
    secondary:
      "border-transparent bg-[var(--surface-muted)] text-[var(--fg-muted)]",
    destructive:
      "border-transparent bg-[color-mix(in_oklab,var(--danger)_14%,transparent)] text-[var(--danger)]",
    outline: "border-[var(--border-strong)] text-[var(--fg)] bg-transparent",
    success:
      "border-transparent bg-[color-mix(in_oklab,var(--success)_16%,transparent)] text-[var(--success)]",
    warning:
      "border-transparent bg-[color-mix(in_oklab,var(--warning)_20%,transparent)] text-[color-mix(in_oklab,var(--warning)_85%,var(--fg))]",
    aurora:
      "border-transparent text-white bg-[linear-gradient(135deg,var(--aurora-1),var(--aurora-2),var(--aurora-3))]",
  };
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };

import { cn } from "@/lib/utils";

function Progress({
  value = 0,
  className,
  gradient = true,
}: {
  value?: number;
  className?: string;
  gradient?: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]",
        className,
      )}
    >
      <div
        className={cn(
          "h-full transition-all duration-500 ease-out",
          gradient
            ? "bg-[linear-gradient(90deg,var(--aurora-1),var(--aurora-2),var(--aurora-3))]"
            : "bg-[var(--primary)]",
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export { Progress };

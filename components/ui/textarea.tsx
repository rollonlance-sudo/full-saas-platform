import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--fg)] shadow-sm transition-all duration-200",
        "placeholder:text-[var(--fg-subtle)]",
        "hover:border-[var(--border-strong)]",
        "focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-4 focus-visible:ring-[color-mix(in_oklab,var(--primary)_18%,transparent)]",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };

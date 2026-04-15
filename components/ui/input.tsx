import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--fg)] shadow-sm transition-all duration-200",
          "placeholder:text-[var(--fg-subtle)]",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "hover:border-[var(--border-strong)]",
          "focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-4 focus-visible:ring-[color-mix(in_oklab,var(--primary)_18%,transparent)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

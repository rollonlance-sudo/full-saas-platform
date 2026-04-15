"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: "icon" | "pill";
};

export function ThemeToggle({ className, variant = "icon" }: Props) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (variant === "pill") {
    const options = [
      { value: "light", icon: Sun, label: "Light" },
      { value: "system", icon: Monitor, label: "System" },
      { value: "dark", icon: Moon, label: "Dark" },
    ] as const;
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm",
          className,
        )}
        role="radiogroup"
        aria-label="Theme"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const active = mounted && theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "relative inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--fg-muted)] transition-colors",
                active && "bg-[var(--primary-soft)] text-[var(--primary)]",
              )}
              title={opt.label}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    );
  }

  const current = mounted ? resolvedTheme : "light";
  const next = current === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)] transition-all hover:text-[var(--fg)] hover:shadow-sm",
        className,
      )}
    >
      <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </button>
  );
}

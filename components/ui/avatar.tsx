import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "h-5 w-5 text-[10px]",
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
  xl: "h-14 w-14 text-lg",
};

const fallbackSurface =
  "bg-[linear-gradient(135deg,color-mix(in_oklab,var(--violet-400)_38%,var(--surface)),color-mix(in_oklab,var(--cyan-400)_30%,var(--surface)))] text-[var(--fg)]";

export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  className,
  children,
  ...props
}: AvatarProps) {
  if (children) {
    return (
      <div
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[var(--border)]",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (src) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full border border-[var(--border)]",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt || ""} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold",
        fallbackSurface,
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {fallback ? getInitials(fallback) : "?"}
    </div>
  );
}

export function AvatarImage({
  src,
  alt,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt || ""}
      className={cn("h-full w-full object-cover", className)}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full font-semibold",
        fallbackSurface,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarGroup({ children, max = 3 }: { children: React.ReactNode; max?: number }) {
  const childArray = React.Children.toArray(children);
  const visible = childArray.slice(0, max);
  const remaining = childArray.length - max;
  return (
    <div className="flex -space-x-2">
      {visible.map((child, i) => (
        <div key={i} className="rounded-full ring-2 ring-[var(--surface)]">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-medium text-[var(--fg-muted)] ring-2 ring-[var(--surface)]">
          +{remaining}
        </div>
      )}
    </div>
  );
}

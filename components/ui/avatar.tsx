import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ src, alt, fallback, size = "md", className, children, ...props }: AvatarProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  // If children are provided (compound component usage), render them
  if (children) {
    return (
      <div className={cn("relative overflow-hidden rounded-full", sizeClasses[size], className)} {...props}>
        {children}
      </div>
    );
  }

  if (src) {
    return (
      <div className={cn("relative overflow-hidden rounded-full", sizeClasses[size], className)} {...props}>
        <img src={src} alt={alt || ""} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-indigo-100 font-medium text-indigo-700",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {fallback ? getInitials(fallback) : "?"}
    </div>
  );
}

export function AvatarImage({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) return null;
  return <img src={src} alt={alt || ""} className={cn("h-full w-full object-cover", className)} {...props} />;
}

export function AvatarFallback({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-indigo-100 font-medium text-indigo-700",
        className
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
        <div key={i} className="ring-2 ring-white rounded-full">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 ring-2 ring-white">
          +{remaining}
        </div>
      )}
    </div>
  );
}

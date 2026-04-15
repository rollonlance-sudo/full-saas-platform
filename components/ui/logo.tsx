import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * FlowBoard brand mark.
 *
 * Concept: three cascading cards on a Kanban board, offset diagonally to imply
 * motion (flow). At a glance the negative space reads as an "F". Aurora-tinted
 * to match the brand palette (violet → cyan → rose).
 */

type LogoMarkProps = React.SVGProps<SVGSVGElement> & {
  /** Render with the rounded aurora-gradient background tile. Default: true. */
  tile?: boolean;
  /** Force monochrome fill (e.g. for on-brand dark surfaces). */
  mono?: "light" | "dark";
  title?: string;
};

export function LogoMark({
  tile = true,
  mono,
  className,
  title = "FlowBoard",
  ...props
}: LogoMarkProps) {
  const id = React.useId();
  const gradId = `fb-aurora-${id}`;
  const cardFill = mono
    ? mono === "light"
      ? "#ffffff"
      : "#0b0b14"
    : "#ffffff";
  const tileFill = mono ? "transparent" : `url(#${gradId})`;

  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn("block", className)}
      {...props}
    >
      <title>{title}</title>
      {!mono && (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
      )}
      {tile && (
        <rect
          x="0"
          y="0"
          width="32"
          height="32"
          rx="8"
          fill={tileFill}
        />
      )}
      {/* Three cascading cards — top is widest, stack shifts right & narrows */}
      <g>
        <rect
          x="6"
          y="7"
          width="16"
          height="4"
          rx="2"
          fill={cardFill}
          opacity={mono ? 1 : 0.96}
        />
        <rect
          x="8"
          y="14"
          width="14"
          height="4"
          rx="2"
          fill={cardFill}
          opacity={mono ? 0.8 : 0.78}
        />
        <rect
          x="10"
          y="21"
          width="10"
          height="4"
          rx="2"
          fill={cardFill}
          opacity={mono ? 0.6 : 0.58}
        />
      </g>
    </svg>
  );
}

type LogoProps = {
  className?: string;
  /** Size of the mark in pixels (width = height). Default: 36. */
  size?: number;
  /** Show the "FlowBoard" wordmark next to the mark. Default: true. */
  wordmark?: boolean;
  /** Text color override for the wordmark. */
  textClassName?: string;
  tile?: boolean;
  mono?: "light" | "dark";
};

export function Logo({
  className,
  size = 36,
  wordmark = true,
  textClassName,
  tile = true,
  mono,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark
        tile={tile}
        mono={mono}
        style={{ width: size, height: size }}
        className="flex-shrink-0 shadow-[0_6px_20px_-6px_color-mix(in_oklab,#7c3aed_50%,transparent)]"
      />
      {wordmark && (
        <span
          className={cn(
            "font-semibold tracking-[-0.02em] text-[var(--fg)]",
            size >= 40 ? "text-2xl" : size >= 32 ? "text-lg" : "text-[17px]",
            textClassName,
          )}
        >
          FlowBoard
        </span>
      )}
    </span>
  );
}

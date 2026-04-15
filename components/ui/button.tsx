import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "text-sm font-medium tracking-[-0.01em] rounded-lg",
    "transition-[transform,box-shadow,background,color,border-color] duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:shrink-0 [&_svg]:pointer-events-none",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "text-white",
          "bg-[linear-gradient(135deg,var(--violet-500),var(--violet-600))]",
          "shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_8px_24px_-8px_rgba(124,58,237,0.55)]",
          "hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_14px_32px_-8px_rgba(124,58,237,0.7)]",
          "hover:-translate-y-[1px]",
        ].join(" "),
        aurora: [
          "text-white",
          "bg-[linear-gradient(135deg,var(--aurora-1),var(--aurora-2)_55%,var(--aurora-3))]",
          "bg-[length:200%_100%] bg-[position:0%_50%]",
          "hover:bg-[position:100%_50%] transition-[background-position,box-shadow,transform] duration-500",
          "shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_10px_32px_-8px_rgba(124,58,237,0.55)]",
          "hover:-translate-y-[1px]",
        ].join(" "),
        secondary: [
          "text-[var(--fg)] bg-[var(--surface-muted)] border border-[var(--border)]",
          "hover:bg-[var(--surface)] hover:border-[var(--border-strong)]",
        ].join(" "),
        outline: [
          "text-[var(--fg)] bg-transparent border border-[var(--border-strong)]",
          "hover:bg-[var(--surface-muted)]",
        ].join(" "),
        ghost: "text-[var(--fg)] hover:bg-[var(--surface-muted)]",
        glass: [
          "text-[var(--fg)] glass hover:shadow-md",
        ].join(" "),
        destructive: [
          "text-white bg-[linear-gradient(135deg,#f43f5e,#e11d48)]",
          "shadow-[0_8px_24px_-8px_rgba(244,63,94,0.5)] hover:-translate-y-[1px]",
        ].join(" "),
        link: "text-[var(--primary)] underline-offset-4 hover:underline px-0",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-12 px-6 text-[15px] rounded-xl",
        xl: "h-14 px-8 text-base rounded-2xl",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlowButton({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "cyan" | "violet" | "ghost" | "danger" | "secondary";
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-xs font-medium",
    md: "px-5 py-2.5 text-sm font-medium",
    lg: "px-6 py-3 text-base font-semibold",
  };
  const variants = {
    primary: "bg-primary text-primary-foreground border border-transparent shadow-xs hover:opacity-95 hover:shadow-md",
    secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-muted",
    cyan: "bg-[color-mix(in_oklch,var(--cyan)_15%,transparent)] text-foreground border border-[color-mix(in_oklch,var(--cyan)_40%,transparent)] hover:bg-[color-mix(in_oklch,var(--cyan)_25%,transparent)]",
    violet: "bg-[color-mix(in_oklch,var(--violet)_15%,transparent)] text-foreground border border-[color-mix(in_oklch,var(--violet)_40%,transparent)] hover:bg-[color-mix(in_oklch,var(--violet)_25%,transparent)]",
    ghost: "bg-transparent text-foreground border border-border hover:bg-secondary",
    danger: "bg-destructive/15 text-destructive border border-destructive/40 hover:bg-destructive/25",
  };
  return (
    <button
      className={cn(
        "rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 cursor-pointer select-none",
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

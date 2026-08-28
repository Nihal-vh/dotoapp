import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "amber" | "emerald" | "blue" | "rose" | "purple" | "white";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-zinc-900 text-zinc-300 border-zinc-800",
    secondary: "bg-zinc-900 text-zinc-400 border-zinc-800",
    outline: "border-zinc-800 text-zinc-400 bg-transparent",
    white: "bg-white text-zinc-950 font-semibold border-white",
    amber: "bg-zinc-800 text-zinc-100 border-zinc-700 font-semibold",
    emerald: "bg-zinc-800 text-zinc-200 border-zinc-700",
    blue: "bg-zinc-800 text-zinc-300 border-zinc-700",
    rose: "bg-zinc-800 text-zinc-300 border-zinc-700",
    purple: "bg-zinc-800 text-zinc-300 border-zinc-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-mono transition-colors select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

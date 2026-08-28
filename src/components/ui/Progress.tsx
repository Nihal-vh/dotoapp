import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  color?: "amber" | "emerald" | "blue" | "zinc" | "white";
}

export function Progress({ value, color = "white", className, ...props }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-zinc-800", className)}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-300 rounded-full bg-zinc-100", className)}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}

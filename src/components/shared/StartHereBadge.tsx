import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StartHereBadgeProps {
  actionText: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function StartHereBadge({
  actionText,
  className,
  size = "md",
  label = "START HERE",
}: StartHereBadgeProps) {
  if (!actionText) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-700 bg-zinc-900/90 p-3.5 text-zinc-100 start-here-glow shadow-sm",
        size === "sm" && "p-2.5 text-xs",
        size === "lg" && "p-4 text-base",
        className
      )}
    >
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
        <Sparkles className="h-3 w-3 text-zinc-300" />
        <span>{label}</span>
      </div>
      <div className="mt-1 flex items-start gap-2 text-white font-medium leading-snug">
        <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400 mt-0.5" />
        <span className="break-words">{actionText}</span>
      </div>
    </div>
  );
}

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "../ui/Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-semibold text-zinc-200">{title}</h4>
      <p className="mt-1 text-xs text-zinc-400 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="secondary" className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

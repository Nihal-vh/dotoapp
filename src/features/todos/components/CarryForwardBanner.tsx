"use client";

import React, { useState, useTransition } from "react";
import { ArrowRight, X } from "lucide-react";
import { carryForwardTodosAction, skipTodosAction } from "../actions";

interface OverdueTodoData {
  id: string;
  title: string;
  date: string;
}

interface CarryForwardBannerProps {
  overdueTodos: OverdueTodoData[];
}

export function CarryForwardBanner({ overdueTodos }: CarryForwardBannerProps) {
  const [isPending, startTransition] = useTransition();
  const [isDismissed, setIsDismissed] = useState(false);

  if (overdueTodos.length === 0 || isDismissed) return null;

  const handleCarryForwardAll = () => {
    startTransition(async () => {
      const ids = overdueTodos.map((t) => t.id);
      await carryForwardTodosAction(ids);
    });
  };

  const handleSkipAll = () => {
    startTransition(async () => {
      const ids = overdueTodos.map((t) => t.id);
      await skipTodosAction(ids);
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 text-xs flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-zinc-200 font-medium truncate">
          {overdueTodos.length} unfinished {overdueTodos.length === 1 ? "task" : "tasks"} from earlier days.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleSkipAll}
          disabled={isPending}
          className="text-zinc-500 hover:text-zinc-300 text-xs px-2 py-1 transition-colors"
        >
          Dismiss
        </button>
        <button
          onClick={handleCarryForwardAll}
          disabled={isPending}
          className="flex items-center gap-1 bg-white text-zinc-950 font-semibold px-3 py-1 rounded-lg text-xs hover:bg-zinc-200 transition-colors"
        >
          <span>Move to Today</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

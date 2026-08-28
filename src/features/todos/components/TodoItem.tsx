"use client";

import React, { useTransition } from "react";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { toggleTodoStatusAction, deleteTodoAction } from "../actions";
import Link from "next/link";

export interface TodoItemData {
  id: string;
  title: string;
  description: string | null;
  date: string;
  status: string;
  priority: string;
  project?: { id: string; name: string } | null;
  task?: { id: string; title: string } | null;
  learningItem?: { id: string; title: string } | null;
  resource?: { id: string; title: string } | null;
  readingItem?: { id: string; title: string } | null;
}

interface TodoItemProps {
  todo: TodoItemData;
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isPending, startTransition] = useTransition();
  const isCompleted = todo.status === "COMPLETED";

  const handleToggle = () => {
    startTransition(async () => {
      await toggleTodoStatusAction(todo.id, todo.status);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTodoAction(todo.id);
    });
  };

  const sourceLabel =
    todo.project?.name ||
    todo.learningItem?.title ||
    todo.readingItem?.title;

  return (
    <div
      className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all ${
        isCompleted
          ? "bg-zinc-950/40 opacity-40"
          : "bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-850"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="text-zinc-500 hover:text-white transition-colors shrink-0 p-0.5"
        >
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-white" />
          ) : (
            <Circle className="h-4 w-4 text-zinc-600 hover:text-zinc-400" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-xs sm:text-sm font-medium leading-snug break-words ${
              isCompleted ? "line-through text-zinc-500" : "text-zinc-100"
            }`}
          >
            {todo.title}
          </p>

          {sourceLabel && (
            <span className="text-[11px] text-zinc-500 block truncate">
              {sourceLabel}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-zinc-600 hover:text-zinc-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        title="Delete task"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

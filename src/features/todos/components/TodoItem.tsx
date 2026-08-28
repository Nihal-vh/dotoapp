"use client";

import React, { useTransition, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Trash2,
  Bell,
  Calendar,
  Clock,
  Layers,
} from "lucide-react";
import { toggleTodoStatusAction, deleteTodoAction } from "../actions";
import { CreateReminderModal } from "@/features/reminders/components/CreateReminderModal";

export interface TodoItemData {
  id: string;
  title: string;
  description: string | null;
  date: string;
  status: string;
  priority: string;
  dueDate?: Date | string | null;
  remindAt?: Date | string | null;
  isGlobal?: boolean;
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
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const isCompleted = todo.status === "COMPLETED";

  const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
  const remindAt = todo.remindAt ? new Date(todo.remindAt) : null;
  const now = new Date();
  const isExpired = dueDate ? dueDate.getTime() <= now.getTime() : false;

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
    <>
      <div
        className={`group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
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
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <Circle className="h-4 w-4 text-zinc-600 hover:text-zinc-400" />
            )}
          </button>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={`text-xs sm:text-sm font-medium leading-snug break-words ${
                  isCompleted ? "line-through text-zinc-500" : "text-zinc-100"
                }`}
              >
                {todo.title}
              </p>

              {todo.isGlobal && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                  Ongoing
                </span>
              )}
            </div>

            {/* Badges: Source, Due Date, Reminder */}
            <div className="flex items-center gap-2 flex-wrap text-[11px] text-zinc-500">
              {sourceLabel && (
                <span className="truncate max-w-[140px]">{sourceLabel}</span>
              )}

              {dueDate && (
                <span
                  className={`flex items-center gap-1 font-medium ${
                    isExpired && !isCompleted ? "text-red-400" : "text-zinc-400"
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  {isExpired ? "Expired" : "Due"}:{" "}
                  {dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}

              {remindAt && (
                <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                  <Clock className="h-3 w-3" />
                  Alarm: {remindAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Add/View Reminder button */}
          <button
            onClick={() => setIsReminderModalOpen(true)}
            className="p-1 rounded-md text-zinc-600 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Set Reminder / Alarm"
          >
            <Bell className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-1 rounded-md text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {isReminderModalOpen && (
        <CreateReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          defaultTitle={todo.title}
          defaultDescription={todo.description || undefined}
          defaultDueDate={todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : undefined}
          todoId={todo.id}
          projectId={todo.project?.id}
          projectTaskId={todo.task?.id}
          learningItemId={todo.learningItem?.id}
          readingItemId={todo.readingItem?.id}
        />
      )}
    </>
  );
}

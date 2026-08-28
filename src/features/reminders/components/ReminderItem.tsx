"use client";

import React, { useTransition, useState } from "react";
import {
  Bell,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Trash2,
  MoreVertical,
  RotateCcw,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import {
  toggleReminderStatusAction,
  snoozeReminderAction,
  deleteReminderAction,
} from "../actions";

export interface ReminderItemData {
  id: string;
  title: string;
  description: string | null;
  remindAt: Date | string;
  dueDate: Date | string | null;
  priority: string;
  status: string;
  isPushSent: boolean;
  todo?: { id: string; title: string; status: string } | null;
  project?: { id: string; name: string } | null;
  task?: { id: string; title: string } | null;
  learningItem?: { id: string; title: string } | null;
  readingItem?: { id: string; title: string } | null;
}

interface ReminderItemProps {
  reminder: ReminderItemData;
  isHighlighted?: boolean;
}

export function ReminderItem({ reminder, isHighlighted = false }: ReminderItemProps) {
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);

  const isCompleted = reminder.status === "COMPLETED";
  const remindDate = new Date(reminder.remindAt);
  const dueDate = reminder.dueDate ? new Date(reminder.dueDate) : null;
  const now = new Date();

  const isPastRemind = remindDate.getTime() <= now.getTime();
  const isExpired = dueDate ? dueDate.getTime() <= now.getTime() : false;

  // Format relative alarm time
  const formatAlarmTime = (target: Date) => {
    const diffMs = target.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / (60 * 1000));
    const diffHours = Math.round(diffMs / (3600 * 1000));
    const diffDays = Math.round(diffMs / (86400 * 1000));

    if (diffMs <= 0) {
      return "Due now / Passed";
    }
    if (diffMins < 60) {
      return `in ${diffMins} min${diffMins === 1 ? "" : "s"}`;
    }
    if (diffHours < 24) {
      return `in ${diffHours} hr${diffHours === 1 ? "" : "s"}`;
    }
    return `in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  };

  const handleToggle = () => {
    startTransition(async () => {
      await toggleReminderStatusAction(reminder.id, reminder.status);
    });
  };

  const handleSnooze = (minutes: number) => {
    setShowMenu(false);
    startTransition(async () => {
      await snoozeReminderAction(reminder.id, minutes);
    });
  };

  const handleDelete = () => {
    setShowMenu(false);
    startTransition(async () => {
      await deleteReminderAction(reminder.id);
    });
  };

  const priorityColors = {
    URGENT: "bg-red-950/60 text-red-400 border-red-800/60",
    HIGH: "bg-amber-950/60 text-amber-300 border-amber-800/60",
    MEDIUM: "bg-zinc-800 text-zinc-300 border-zinc-700",
    LOW: "bg-zinc-900 text-zinc-400 border-zinc-800",
  }[reminder.priority] || "bg-zinc-900 text-zinc-400 border-zinc-800";

  return (
    <div
      className={`group relative flex flex-col gap-2 p-3.5 rounded-xl border transition-all ${
        isHighlighted
          ? "border-amber-500/80 bg-amber-950/10 shadow-lg shadow-amber-500/10"
          : isCompleted
          ? "bg-zinc-950/40 opacity-45 border-zinc-900"
          : isPastRemind && !isCompleted
          ? "bg-zinc-900/60 border-amber-800/40 hover:border-amber-700/60"
          : "bg-zinc-900/30 border-zinc-850 hover:bg-zinc-900/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Checkbox and Title */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <button
            onClick={handleToggle}
            disabled={isPending}
            className="text-zinc-500 hover:text-white transition-colors shrink-0 mt-0.5"
          >
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <Circle className="h-4 w-4 text-zinc-600 hover:text-zinc-400" />
            )}
          </button>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs sm:text-sm font-medium leading-snug break-words ${
                  isCompleted ? "line-through text-zinc-500" : "text-zinc-100"
                }`}
              >
                {reminder.title}
              </span>

              {/* Priority badge */}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-semibold ${priorityColors}`}>
                {reminder.priority}
              </span>

              {/* Push sent indicator */}
              {reminder.isPushSent && !isCompleted && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 flex items-center gap-1">
                  <Bell className="h-2.5 w-2.5 text-zinc-400" />
                  Notified
                </span>
              )}
            </div>

            {reminder.description && (
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {reminder.description}
              </p>
            )}

            {/* Entity linkage */}
            {(reminder.project || reminder.task || reminder.learningItem || reminder.readingItem) && (
              <span className="text-[11px] text-zinc-500 block truncate">
                Linked to: {reminder.project?.name || reminder.learningItem?.title || reminder.readingItem?.title}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons & Menu */}
        <div className="flex items-center gap-1 shrink-0">
          {!isCompleted && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Reminder options"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-6 z-20 w-36 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl py-1 text-xs">
                  <button
                    onClick={() => handleSnooze(15)}
                    className="w-full text-left px-3 py-1.5 text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <RotateCcw className="h-3 w-3" /> Snooze 15m
                  </button>
                  <button
                    onClick={() => handleSnooze(60)}
                    className="w-full text-left px-3 py-1.5 text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <RotateCcw className="h-3 w-3" /> Snooze 1 hour
                  </button>
                  <button
                    onClick={() => handleSnooze(1440)}
                    className="w-full text-left px-3 py-1.5 text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <RotateCcw className="h-3 w-3" /> Snooze 1 day
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-3 py-1.5 text-red-400 hover:bg-zinc-800 flex items-center gap-2 border-t border-zinc-800/80"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-1 rounded-md text-zinc-600 hover:text-zinc-300 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Meta Footer: Alarm Date & Expiry Date */}
      <div className="flex items-center gap-3 pt-1 border-t border-zinc-850/60 text-[11px] text-zinc-500">
        <span className={`flex items-center gap-1 font-medium ${isPastRemind && !isCompleted ? "text-amber-400" : ""}`}>
          <Clock className="h-3 w-3" />
          {remindDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
          {remindDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}{" "}
          <span className="text-zinc-600 font-normal">({formatAlarmTime(remindDate)})</span>
        </span>

        {dueDate && (
          <span className={`flex items-center gap-1 ml-auto font-medium ${isExpired && !isCompleted ? "text-red-400" : "text-zinc-400"}`}>
            <Calendar className="h-3 w-3" />
            {isExpired ? "Expired" : "Due"}:{" "}
            {dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>
    </div>
  );
}

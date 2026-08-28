"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { getTodayDateString, getTomorrowDateString } from "@/lib/utils";
import { Calendar, Plus, Clock, Layers, Bell } from "lucide-react";

interface QuickAddToTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle: string;
  defaultDescription?: string;
  projectId?: string;
  projectTaskId?: string;
  learningItemId?: string;
  resourceId?: string;
  readingItemId?: string;
  onAddTodo: (data: {
    title: string;
    description?: string;
    date: string;
    priority: string;
    dueDate?: string;
    remindAt?: string;
    isGlobal?: boolean;
    projectId?: string;
    projectTaskId?: string;
    learningItemId?: string;
    resourceId?: string;
    readingItemId?: string;
  }) => Promise<void>;
}

export function QuickAddToTodoModal({
  isOpen,
  onClose,
  defaultTitle,
  defaultDescription,
  projectId,
  projectTaskId,
  learningItemId,
  resourceId,
  readingItemId,
  onAddTodo,
}: QuickAddToTodoModalProps) {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription || "");
  const [scheduleType, setScheduleType] = useState<"TODAY" | "TOMORROW" | "BACKLOG">("TODAY");
  const [priority, setPriority] = useState("MEDIUM");
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [hasReminder, setHasReminder] = useState(false);
  const [remindAt, setRemindAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync title when default changes
  React.useEffect(() => {
    setTitle(defaultTitle);
    setDescription(defaultDescription || "");
  }, [defaultTitle, defaultDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const date = scheduleType === "TODAY" ? today : scheduleType === "TOMORROW" ? tomorrow : "BACKLOG";
      await onAddTodo({
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        isGlobal: scheduleType === "BACKLOG",
        priority,
        dueDate: hasDueDate && dueDate ? new Date(dueDate).toISOString() : undefined,
        remindAt: hasReminder && remindAt ? new Date(remindAt).toISOString() : undefined,
        projectId,
        projectTaskId,
        learningItemId,
        resourceId,
        readingItemId,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Tasks & Reminders"
      description="Schedule for today, tomorrow, or add to your ongoing global backlog with optional alarms & deadlines."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">Task Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement PostgreSQL schema creation"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">Description / Notes (Optional)</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional context or pointers..."
            rows={2}
          />
        </div>

        {/* Schedule Destination */}
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">Schedule For</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setScheduleType("TODAY")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-all ${
                scheduleType === "TODAY"
                  ? "border-zinc-500 bg-zinc-800 text-white font-bold"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Today</span>
            </button>

            <button
              type="button"
              onClick={() => setScheduleType("TOMORROW")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-all ${
                scheduleType === "TOMORROW"
                  ? "border-zinc-500 bg-zinc-800 text-white font-bold"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Tomorrow</span>
            </button>

            <button
              type="button"
              onClick={() => setScheduleType("BACKLOG")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-all ${
                scheduleType === "BACKLOG"
                  ? "border-zinc-500 bg-zinc-800 text-white font-bold"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Global / Ongoing</span>
            </button>
          </div>
        </div>

        {/* Optional Alarm Reminder */}
        <div className="space-y-2 pt-1 border-t border-zinc-900">
          <div className="flex items-center justify-between">
            <label
              htmlFor="quickModalHasReminder"
              className="text-xs text-zinc-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Bell className="h-3.5 w-3.5 text-amber-400" />
              <span>Set Push Alarm Reminder</span>
            </label>
            <input
              id="quickModalHasReminder"
              type="checkbox"
              checked={hasReminder}
              onChange={(e) => setHasReminder(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-700 text-white h-4 w-4"
            />
          </div>

          {hasReminder && (
            <input
              type="datetime-local"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none"
              required={hasReminder}
            />
          )}
        </div>

        {/* Optional Expiry / Deadline Date */}
        <div className="space-y-2 pt-1 border-t border-zinc-900">
          <div className="flex items-center justify-between">
            <label
              htmlFor="quickModalHasDueDate"
              className="text-xs text-zinc-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              <span>Set Expiry / Deadline Date</span>
            </label>
            <input
              id="quickModalHasDueDate"
              type="checkbox"
              checked={hasDueDate}
              onChange={(e) => setHasDueDate(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-700 text-white h-4 w-4"
            />
          </div>

          {hasDueDate && (
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none"
              required={hasDueDate}
            />
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">Priority</label>
          <div className="flex gap-2">
            {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all ${
                  priority === p
                    ? "border-zinc-500 bg-zinc-100 text-zinc-950 font-bold"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="default" size="sm" isLoading={isSubmitting}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Save Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}

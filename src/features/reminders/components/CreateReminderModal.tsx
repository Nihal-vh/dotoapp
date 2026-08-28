"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Bell, Clock, Calendar, CheckSquare, Sparkles } from "lucide-react";
import { createReminderAction } from "../actions";
import { usePwa } from "@/components/pwa/PwaProvider";

interface CreateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultDueDate?: string;
  todoId?: string;
  projectId?: string;
  projectTaskId?: string;
  learningItemId?: string;
  readingItemId?: string;
  onSuccess?: () => void;
}

export function CreateReminderModal({
  isOpen,
  onClose,
  defaultTitle = "",
  defaultDescription = "",
  defaultDueDate,
  todoId,
  projectId,
  projectTaskId,
  learningItemId,
  readingItemId,
  onSuccess,
}: CreateReminderModalProps) {
  const { notificationPermission, requestPushPermission } = usePwa();

  // Compute default reminder time (1 hour from now formatted as YYYY-MM-DDTHH:mm)
  const getDefaultRemindAt = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
    d.setSeconds(0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [remindAt, setRemindAt] = useState(getDefaultRemindAt());
  const [hasDueDate, setHasDueDate] = useState(Boolean(defaultDueDate));
  const [dueDate, setDueDate] = useState(defaultDueDate || "");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [createAsGlobalTodo, setCreateAsGlobalTodo] = useState(!todoId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setTitle(defaultTitle);
    setDescription(defaultDescription);
    if (defaultDueDate) {
      setDueDate(defaultDueDate);
      setHasDueDate(true);
    }
  }, [defaultTitle, defaultDescription, defaultDueDate]);

  // Shortcut presets
  const applyPreset = (minutesFromNow: number) => {
    const d = new Date(Date.now() + minutesFromNow * 60 * 1000);
    setRemindAt(
      new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    );
  };

  const applyTomorrowMorning = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    setRemindAt(
      new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (notificationPermission !== "granted") {
        // Attempt to request permission seamlessly
        await requestPushPermission();
      }

      await createReminderAction({
        title: title.trim(),
        description: description.trim() || undefined,
        remindAt: new Date(remindAt).toISOString(),
        dueDate: hasDueDate && dueDate ? new Date(dueDate).toISOString() : undefined,
        priority,
        todoId,
        projectId,
        projectTaskId,
        learningItemId,
        readingItemId,
        createAsGlobalTodo,
      });

      setTitle("");
      setDescription("");
      onClose();
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Reminder & Task Alarm"
      description="Schedule push notifications and set expiry/deadlines for your tasks or standalone reminders."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">
            Reminder / Task Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Renew SSL certificates or Finish API review"
            required
            autoFocus
          />
        </div>

        {/* Description / Notes */}
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">
            Notes / Context (Optional)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key details or URLs needed when this fires..."
            rows={2}
          />
        </div>

        {/* Quick Alarm Shortcuts */}
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span>Remind Me At (Alarm Time)</span>
          </label>

          <div className="flex flex-wrap gap-1.5 mb-2">
            <button
              type="button"
              onClick={() => applyPreset(15)}
              className="px-2.5 py-1 rounded-md text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            >
              +15 mins
            </button>
            <button
              type="button"
              onClick={() => applyPreset(60)}
              className="px-2.5 py-1 rounded-md text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            >
              +1 hour
            </button>
            <button
              type="button"
              onClick={() => applyPreset(180)}
              className="px-2.5 py-1 rounded-md text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            >
              +3 hours
            </button>
            <button
              type="button"
              onClick={applyTomorrowMorning}
              className="px-2.5 py-1 rounded-md text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            >
              Tomorrow 9 AM
            </button>
          </div>

          <input
            type="datetime-local"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            required
            className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
          />
        </div>

        {/* Expiry / Due Date Checkbox & Field */}
        <div className="space-y-2 pt-1 border-t border-zinc-900">
          <div className="flex items-center justify-between">
            <label
              htmlFor="hasDueDateCheckbox"
              className="text-xs font-medium text-zinc-300 flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              <span>Set Expiry / Deadline Date</span>
            </label>
            <input
              id="hasDueDateCheckbox"
              type="checkbox"
              checked={hasDueDate}
              onChange={(e) => setHasDueDate(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-700 text-white focus:ring-0 h-4 w-4"
            />
          </div>

          {hasDueDate && (
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="Expiry / Final deadline date"
              className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
            />
          )}
        </div>

        {/* Global Todo Integration Checkbox */}
        {!todoId && (
          <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
            <label
              htmlFor="createAsGlobalTodoCheckbox"
              className="text-xs text-zinc-300 flex items-center gap-2 cursor-pointer"
            >
              <CheckSquare className="h-3.5 w-3.5 text-zinc-400" />
              <span>Also add to Global Tasks Backlog</span>
            </label>
            <input
              id="createAsGlobalTodoCheckbox"
              type="checkbox"
              checked={createAsGlobalTodo}
              onChange={(e) => setCreateAsGlobalTodo(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-700 text-white focus:ring-0 h-4 w-4"
            />
          </div>
        )}

        {/* Priority Selector */}
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">Priority</label>
          <div className="grid grid-cols-4 gap-2">
            {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`rounded-lg border py-1.5 text-[11px] font-medium transition-all ${
                  priority === p
                    ? p === "URGENT"
                      ? "border-red-500 bg-red-950/60 text-red-300 font-bold"
                      : "border-zinc-400 bg-zinc-100 text-zinc-950 font-bold"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="default" size="sm" isLoading={isSubmitting}>
            <Bell className="h-3.5 w-3.5 mr-1" />
            Set Reminder
          </Button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { getTodayDateString, getTomorrowDateString } from "@/lib/utils";
import { Calendar, Plus } from "lucide-react";

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
  const [date, setDate] = useState(today);
  const [priority, setPriority] = useState("MEDIUM");
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
      await onAddTodo({
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        priority,
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
      title="Add to Daily Todos"
      description="Schedule this item for today or tomorrow without creating duplicate records."
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

        {/* Date Selection Shortcut */}
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">Schedule For</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDate(today)}
              className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                date === today
                  ? "border-zinc-500 bg-zinc-800 text-white font-bold"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Today</span>
            </button>
            <button
              type="button"
              onClick={() => setDate(tomorrow)}
              className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                date === tomorrow
                  ? "border-zinc-500 bg-zinc-800 text-white font-bold"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Tomorrow</span>
            </button>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">Priority</label>
          <div className="flex gap-2">
            {["LOW", "MEDIUM", "HIGH"].map((p) => (
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
            Schedule Todo
          </Button>
        </div>
      </form>
    </Modal>
  );
}

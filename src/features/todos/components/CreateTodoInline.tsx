"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { createTodoAction } from "../actions";

interface CreateTodoInlineProps {
  date: string;
  onSuccess?: () => void;
}

export function CreateTodoInline({ date, onSuccess }: CreateTodoInlineProps) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTodoAction({
        title: title.trim(),
        date,
        priority: "MEDIUM",
      });
      setTitle("");
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <Plus className="absolute left-3 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task (press Enter)..."
        disabled={isSubmitting}
        className="w-full h-10 pl-9 pr-3 rounded-xl bg-zinc-900/50 border border-zinc-800/60 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
      />
    </form>
  );
}

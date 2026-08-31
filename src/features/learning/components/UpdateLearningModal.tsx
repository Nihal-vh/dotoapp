"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { updateLearningItemAction } from "../actions";
import { Sparkles } from "lucide-react";

interface UpdateLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  learning: {
    id: string;
    title: string;
    description: string | null;
    status: string;
  };
}

export function UpdateLearningModal({
  isOpen,
  onClose,
  learning,
}: UpdateLearningModalProps) {
  const [title, setTitle] = useState(learning.title);
  const [description, setDescription] = useState(learning.description || "");
  const [status, setStatus] = useState(learning.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await updateLearningItemAction({
        id: learning.id,
        title: title.trim(),
        description: description.trim() || null,
        status,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update learning roadmap");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Learning Roadmap"
      description="Update the roadmap subject, notes, or progress status."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-950/40 border border-red-800 p-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Learning Subject</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Distributed Systems & Consensus Algorithms"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Description (Optional)</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key concepts, goals, or reference materials..."
            rows={3}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Status</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "NOT_STARTED", label: "Not Started" },
              { id: "IN_PROGRESS", label: "In Progress" },
              { id: "COMPLETED", label: "Completed" },
              { id: "PAUSED", label: "Paused" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatus(s.id)}
                className={`rounded-lg border py-1.5 text-xs font-medium transition-all ${
                  status === s.id
                    ? "border-zinc-500 bg-zinc-100 text-zinc-950 font-bold"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="default" size="sm" isLoading={isSubmitting}>
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

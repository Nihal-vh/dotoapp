"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { updateLearningTopicAction, deleteLearningTopicAction } from "../actions";
import { Trash2, Sparkles } from "lucide-react";

interface UpdateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: {
    id: string;
    title: string;
    description: string | null;
    notes: string | null;
    status: string;
  };
  learningItemId: string;
}

export function UpdateTopicModal({
  isOpen,
  onClose,
  topic,
  learningItemId,
}: UpdateTopicModalProps) {
  const [title, setTitle] = useState(topic.title);
  const [description, setDescription] = useState(topic.description || "");
  const [notes, setNotes] = useState(topic.notes || "");
  const [status, setStatus] = useState(topic.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Topic title is required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await updateLearningTopicAction({
        id: topic.id,
        learningItemId,
        title: title.trim(),
        description: description.trim() || null,
        notes: notes.trim() || null,
        status,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update topic");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete topic "${topic.title}" and its resources?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteLearningTopicAction(topic.id, learningItemId);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete topic");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Roadmap Topic"
      description="Update topic title, core concept notes, or status."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-950/40 border border-red-800 p-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Topic Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Memory Management & Paging"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Description (Optional)</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Topic description or overview..."
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Notes / Key Takeaways</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Summary of formulas, takeaways, or references..."
            rows={3}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Status</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "NOT_STARTED", label: "Not Started" },
              { id: "IN_PROGRESS", label: "In Progress" },
              { id: "COMPLETED", label: "Completed" },
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

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete Topic
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default" size="sm" isLoading={isSubmitting}>
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

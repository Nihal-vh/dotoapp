"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { logProjectSessionAction } from "../actions";

interface EndSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  currentStartHere?: string | null;
}

export function EndSessionModal({
  isOpen,
  onClose,
  projectId,
  projectName,
}: EndSessionModalProps) {
  const [stoppedAt, setStoppedAt] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextAction.trim()) {
      setError("Please write the next step to resume with.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await logProjectSessionAction({
        projectId,
        workedOn: stoppedAt.trim() || "Worked on active tasks",
        completed: stoppedAt.trim() || "Progress made",
        stoppedAt: stoppedAt.trim() || "Paused session",
        nextAction: nextAction.trim(),
      });
      setStoppedAt("");
      setNextAction("");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectName}
      description="Record where you paused so you can resume immediately next time."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-zinc-300">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1">
            Where did you stop?
          </label>
          <Textarea
            value={stoppedAt}
            onChange={(e) => setStoppedAt(e.target.value)}
            placeholder="e.g. Finished DB migration, still need to test auth tokens..."
            rows={2}
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1">
            What is the next exact action?
          </label>
          <Textarea
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="e.g. Write unit test for token refresh function"
            rows={2}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="default" size="sm" isLoading={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

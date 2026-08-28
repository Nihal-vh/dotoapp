"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { updateResourceProgressAction } from "../actions";
import { Sparkles, Clock } from "lucide-react";

interface UpdateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: {
    id: string;
    title: string;
    type: string;
    currentProgress?: string | null;
    totalDuration?: string | null;
    resumePoint?: string | null;
    notes?: string | null;
    status: string;
  };
}

export function UpdateResourceModal({
  isOpen,
  onClose,
  resource,
}: UpdateResourceModalProps) {
  const [currentProgress, setCurrentProgress] = useState(resource.currentProgress || "");
  const [totalDuration, setTotalDuration] = useState(resource.totalDuration || "");
  const [resumePoint, setResumePoint] = useState(resource.resumePoint || "");
  const [notes, setNotes] = useState(resource.notes || "");
  const [status, setStatus] = useState(resource.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isVideo = resource.type === "YOUTUBE" || resource.type === "COURSE";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateResourceProgressAction({
        resourceId: resource.id,
        currentProgress: currentProgress.trim() || "0",
        totalDuration: totalDuration.trim() || undefined,
        resumePoint: resumePoint.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
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
      title="Update Learning Progress"
      description={`Record where you paused on "${resource.title}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isVideo ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1 mb-1">
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                <span>Current Timestamp</span>
              </label>
              <Input
                value={currentProgress}
                onChange={(e) => setCurrentProgress(e.target.value)}
                placeholder="e.g. 18:32"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Total Duration
              </label>
              <Input
                value={totalDuration}
                onChange={(e) => setTotalDuration(e.target.value)}
                placeholder="e.g. 42:10"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Current Progress (%) or Page
            </label>
            <Input
              value={currentProgress}
              onChange={(e) => setCurrentProgress(e.target.value)}
              placeholder="e.g. 45% or Section 3"
              required
              autoFocus
            />
          </div>
        )}

        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
          <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
            <span>Resume Point & NEXT Action</span>
          </label>
          <Textarea
            value={resumePoint}
            onChange={(e) => setResumePoint(e.target.value)}
            placeholder="e.g. 18:32 - Continue and understand stack vs heap allocation"
            rows={2}
            className="bg-zinc-950 border-zinc-700"
          />
          <p className="mt-1 text-[11px] text-zinc-400">
            This will appear in your Dashboard Resume section so you can jump right back in.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">
            Notes / Insights
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key concepts or reference links..."
            rows={2}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Status</label>
          <div className="flex gap-2">
            {[
              { id: "IN_PROGRESS", label: "In Progress" },
              { id: "COMPLETED", label: "Completed" },
              { id: "NOT_STARTED", label: "Not Started" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatus(s.id)}
                className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all ${
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
            Save Progress
          </Button>
        </div>
      </form>
    </Modal>
  );
}

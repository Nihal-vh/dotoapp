"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { updateLearningResourceAction, deleteLearningResourceAction } from "../actions";
import { Sparkles, Clock, Trash2, ExternalLink } from "lucide-react";

interface UpdateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: {
    id: string;
    title: string;
    type: string;
    url?: string | null;
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
  const [title, setTitle] = useState(resource.title);
  const [type, setType] = useState(resource.type || "ARTICLE");
  const [url, setUrl] = useState(resource.url || "");
  const [currentProgress, setCurrentProgress] = useState(resource.currentProgress || "");
  const [totalDuration, setTotalDuration] = useState(resource.totalDuration || "");
  const [resumePoint, setResumePoint] = useState(resource.resumePoint || "");
  const [notes, setNotes] = useState(resource.notes || "");
  const [status, setStatus] = useState(resource.status || "IN_PROGRESS");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVideo = type === "YOUTUBE" || type === "COURSE";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Resource title is required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await updateLearningResourceAction({
        id: resource.id,
        title: title.trim(),
        type,
        url: url.trim() || null,
        currentProgress: currentProgress.trim() || null,
        totalDuration: totalDuration.trim() || null,
        resumePoint: resumePoint.trim() || null,
        notes: notes.trim() || null,
        status,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteLearningResourceAction(resource.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete resource");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Learning Resource"
      description={`Update resource details, progress, or resume point for "${resource.title}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {error && (
          <div className="rounded-lg bg-red-950/40 border border-red-800 p-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Resource Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Memory Management Deep Dive"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Resource Type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "YOUTUBE", label: "YouTube" },
              { id: "COURSE", label: "Course" },
              { id: "DOCS", label: "Docs" },
              { id: "ARTICLE", label: "Article" },
              { id: "WEBSITE", label: "Website" },
              { id: "CUSTOM", label: "Custom" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`rounded-lg border py-1.5 text-xs font-medium transition-all ${
                  type === t.id
                    ? "border-zinc-500 bg-zinc-100 text-zinc-950 font-bold"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-zinc-300">Resource URL</label>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
              >
                <span>Visit Link</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            type="url"
          />
        </div>

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
              Current Progress (%) or Section
            </label>
            <Input
              value={currentProgress}
              onChange={(e) => setCurrentProgress(e.target.value)}
              placeholder="e.g. 45% or Section 3"
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
            Delete Resource
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

"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createLearningResourceAction } from "../actions";
import { Plus } from "lucide-react";

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
}

export function CreateResourceModal({ isOpen, onClose, topicId }: CreateResourceModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("YOUTUBE");
  const [currentProgress, setCurrentProgress] = useState("");
  const [totalDuration, setTotalDuration] = useState("");
  const [resumePoint, setResumePoint] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await createLearningResourceAction({
        topicId,
        title: title.trim(),
        url: url.trim() || undefined,
        type,
        currentProgress: currentProgress.trim() || undefined,
        totalDuration: totalDuration.trim() || undefined,
        resumePoint: resumePoint.trim() || undefined,
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
      title="Add Learning Resource"
      description="Attach a video, course, documentation, or article to this topic."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Resource Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Memory Management Deep Dive Video"
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
          <label className="text-xs font-semibold text-zinc-300 block mb-1">URL (Optional)</label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            type="url"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Start Timestamp / Progress
            </label>
            <Input
              value={currentProgress}
              onChange={(e) => setCurrentProgress(e.target.value)}
              placeholder="e.g. 18:32 or 0%"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Total Duration (Optional)
            </label>
            <Input
              value={totalDuration}
              onChange={(e) => setTotalDuration(e.target.value)}
              placeholder="e.g. 42:10"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">
            Initial Resume Pointer / Next Action
          </label>
          <Input
            value={resumePoint}
            onChange={(e) => setResumePoint(e.target.value)}
            placeholder="e.g. Continue from 18:32 and review page tables."
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="default" size="sm" isLoading={isSubmitting}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Resource
          </Button>
        </div>
      </form>
    </Modal>
  );
}

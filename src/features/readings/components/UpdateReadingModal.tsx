"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { updateReadingProgressAction } from "../actions";
import { Bookmark, Sparkles, BookOpen } from "lucide-react";

interface UpdateReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reading: {
    id: string;
    title: string;
    currentPage?: number | null;
    totalPages?: number | null;
    currentChapter?: string | null;
    resumePoint?: string | null;
    progressNotes?: string | null;
    status: string;
  };
}

export function UpdateReadingModal({
  isOpen,
  onClose,
  reading,
}: UpdateReadingModalProps) {
  const [currentPage, setCurrentPage] = useState<number | "">(reading.currentPage ?? 0);
  const [totalPages, setTotalPages] = useState<number | "">(reading.totalPages ?? "");
  const [currentChapter, setCurrentChapter] = useState(reading.currentChapter || "");
  const [resumePoint, setResumePoint] = useState(reading.resumePoint || "");
  const [progressNotes, setProgressNotes] = useState(reading.progressNotes || "");
  const [status, setStatus] = useState(reading.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateReadingProgressAction({
        id: reading.id,
        currentPage: currentPage !== "" ? Number(currentPage) : undefined,
        totalPages: totalPages !== "" ? Number(totalPages) : undefined,
        currentChapter: currentChapter.trim() || undefined,
        resumePoint: resumePoint.trim() || undefined,
        progressNotes: progressNotes.trim() || undefined,
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
      title="Update Reading Progress"
      description={`Record your latest position in "${reading.title}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1 mb-1">
              <Bookmark className="h-3.5 w-3.5 text-zinc-400" />
              <span>Current Page</span>
            </label>
            <Input
              type="number"
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value ? Number(e.target.value) : "")}
              placeholder="e.g. 47"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Total Pages
            </label>
            <Input
              type="number"
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value ? Number(e.target.value) : "")}
              placeholder="e.g. 300"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1 mb-1">
            <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
            <span>Current Chapter / Section</span>
          </label>
          <Input
            value={currentChapter}
            onChange={(e) => setCurrentChapter(e.target.value)}
            placeholder="e.g. Chapter 15: Address Translation"
          />
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
          <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
            <span>NEXT Reading Target / Resume Point</span>
          </label>
          <Textarea
            value={resumePoint}
            onChange={(e) => setResumePoint(e.target.value)}
            placeholder="e.g. Read pages 48–60 (Hardware-based Relocation)"
            rows={2}
            className="bg-zinc-950 border-zinc-700"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">
            Notes / Insights
          </label>
          <Textarea
            value={progressNotes}
            onChange={(e) => setProgressNotes(e.target.value)}
            placeholder="Key takeaways or summary..."
            rows={2}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Status</label>
          <div className="flex gap-2">
            {[
              { id: "IN_PROGRESS", label: "In Progress" },
              { id: "COMPLETED", label: "Completed" },
              { id: "PAUSED", label: "Paused" },
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

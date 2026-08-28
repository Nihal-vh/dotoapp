"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createReadingItemAction } from "../actions";
import { Plus } from "lucide-react";

interface CreateReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateReadingModal({ isOpen, onClose }: CreateReadingModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [type, setType] = useState("BOOK");
  const [totalPages, setTotalPages] = useState<number | "">("");
  const [currentPage, setCurrentPage] = useState<number | "">(0);
  const [currentChapter, setCurrentChapter] = useState("");
  const [resumePoint, setResumePoint] = useState("");
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
      await createReadingItemAction({
        title: title.trim(),
        author: author.trim() || undefined,
        type,
        totalPages: totalPages !== "" ? Number(totalPages) : undefined,
        currentPage: currentPage !== "" ? Number(currentPage) : undefined,
        currentChapter: currentChapter.trim() || undefined,
        resumePoint: resumePoint.trim() || undefined,
      });
      setTitle("");
      setAuthor("");
      setTotalPages("");
      setCurrentPage(0);
      setCurrentChapter("");
      setResumePoint("");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create reading item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Reading Item"
      description="Track a book, technical paper, article, or documentation."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="rounded-lg bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-zinc-300">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Designing Data-Intensive Applications"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Author (Optional)</label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Martin Kleppmann"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Reading Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
            >
              <option value="BOOK">Book</option>
              <option value="PAPER">Research Paper</option>
              <option value="ARTICLE">Article</option>
              <option value="DOCS">Documentation</option>
              <option value="PDF">PDF</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Current Page</label>
            <Input
              type="number"
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value ? Number(e.target.value) : "")}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Total Pages</label>
            <Input
              type="number"
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value ? Number(e.target.value) : "")}
              placeholder="e.g. 616"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Current Chapter / Section</label>
          <Input
            value={currentChapter}
            onChange={(e) => setCurrentChapter(e.target.value)}
            placeholder="e.g. Chapter 7: Transactions"
          />
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
          <label className="text-xs font-bold text-zinc-200 block mb-1">
            Initial NEXT Action / Resume Point
          </label>
          <Input
            value={resumePoint}
            onChange={(e) => setResumePoint(e.target.value)}
            placeholder="e.g. Read Chapter 7 section on Serializable Snapshot Isolation."
            className="bg-zinc-950 border-zinc-700"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="default" size="sm" isLoading={isSubmitting}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Reading
          </Button>
        </div>
      </form>
    </Modal>
  );
}

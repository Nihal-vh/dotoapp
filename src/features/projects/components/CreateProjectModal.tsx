"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createProjectAction } from "../actions";
import { Plus } from "lucide-react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startHere, setStartHere] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await createProjectAction({
        name: name.trim(),
        description: description.trim() || undefined,
        startHere: startHere.trim() || undefined,
      });
      setName("");
      setDescription("");
      setStartHere("");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      description="Add a new software project, freelance engagement, or personal initiative."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-zinc-300">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Project Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. E-Commerce Platform"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Description (Optional)</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short overview of the project's goal..."
            rows={2}
          />
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
          <label className="text-xs font-bold text-zinc-200 block mb-1">
            Initial Next Action (Optional)
          </label>
          <Input
            value={startHere}
            onChange={(e) => setStartHere(e.target.value)}
            placeholder="e.g. Setup project repository and database models."
            className="bg-zinc-950 border-zinc-700"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="default" size="sm" isLoading={isSubmitting}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}

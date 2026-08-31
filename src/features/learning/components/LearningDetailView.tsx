"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { StatusPill } from "@/components/shared/StatusPill";
import { RoadmapTimeline, RoadmapTopicData } from "./RoadmapTimeline";
import { UpdateLearningModal } from "./UpdateLearningModal";
import { deleteLearningItemAction } from "../actions";
import { useRouter } from "next/navigation";

interface LearningDetailViewProps {
  learning: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    topics: RoadmapTopicData[];
  };
}

export function LearningDetailView({ learning }: LearningDetailViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const totalTopics = learning.topics.length;
  const completedTopics = learning.topics.filter((t) => t.status === "COMPLETED").length;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${learning.title}"?`)) return;
    setIsDeleting(true);
    await deleteLearningItemAction(learning.id);
    router.push("/learning");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back & Actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/learning"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Learning Roadmaps</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="h-8 text-xs flex items-center gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Roadmap</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="h-8 w-8 text-zinc-500 hover:text-zinc-200"
            title="Delete roadmap"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{learning.title}</h1>
              <StatusPill status={learning.status} />
            </div>
            {learning.description && (
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                {learning.description}
              </p>
            )}
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-xs">
            <span className="font-mono text-zinc-200 font-bold text-sm">
              {progressPercent}%
            </span>
            <span className="text-zinc-500 text-[11px]">
              {completedTopics} of {totalTopics} completed
            </span>
          </div>
        </div>

        <Progress value={progressPercent} />
      </div>

      {/* Roadmap Timeline */}
      <RoadmapTimeline learningItemId={learning.id} topics={learning.topics} />

      {/* Edit Roadmap Modal */}
      {isEditOpen && (
        <UpdateLearningModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          learning={learning}
        />
      )}
    </div>
  );
}

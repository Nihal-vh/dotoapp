"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { ArrowRight, Edit3 } from "lucide-react";
import { Progress } from "@/components/ui/Progress";
import { UpdateLearningModal } from "./UpdateLearningModal";

export interface LearningSummary {
  id: string;
  title: string;
  description: string | null;
  status: string;
  updatedAt: Date | string;
  currentTopic?: {
    id: string;
    title: string;
    status: string;
    activeResource?: {
      id: string;
      title: string;
      type: string;
      currentProgress: string | null;
      totalDuration: string | null;
      resumePoint: string | null;
    } | null;
  } | null;
  progressPercent: number;
  totalTopics: number;
  completedTopics: number;
}

interface LearningCardProps {
  learning: LearningSummary;
}

export function LearningCard({ learning }: LearningCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const activeResource = learning.currentTopic?.activeResource;

  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/30 p-4 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all flex flex-col justify-between space-y-3">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Link
            href={`/learning/${learning.id}`}
            className="font-semibold text-sm text-white hover:underline truncate"
          >
            {learning.title}
          </Link>
          <span className="text-[10px] text-zinc-500 font-mono">
            {learning.progressPercent}%
          </span>
        </div>

        <Progress value={learning.progressPercent} />

        {activeResource && (
          <p className="text-xs text-zinc-400 truncate">
            <span className="text-zinc-500">Resource:</span> {activeResource.title}
            {activeResource.currentProgress && ` (${activeResource.currentProgress})`}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
        <span className="text-[11px] text-zinc-500">
          {formatRelativeTime(learning.updatedAt)}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <Edit3 className="h-3 w-3" />
            <span>Edit</span>
          </button>
          <Link
            href={`/learning/${learning.id}`}
            className="inline-flex items-center gap-1 text-xs text-white hover:underline font-medium"
          >
            <span>Open</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

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

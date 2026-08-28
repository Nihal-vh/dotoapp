"use client";

import React, { useState } from "react";
import { formatRelativeTime } from "@/lib/utils";
import { Progress } from "@/components/ui/Progress";
import { UpdateReadingModal } from "./UpdateReadingModal";

export interface ReadingItemData {
  id: string;
  title: string;
  author: string | null;
  type: string;
  url: string | null;
  status: string;
  totalPages: number | null;
  currentPage: number | null;
  currentChapter: string | null;
  resumePoint: string | null;
  progressNotes: string | null;
  lastRead: Date | string | null;
}

interface ReadingCardProps {
  reading: ReadingItemData;
}

export function ReadingCard({ reading }: ReadingCardProps) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const currentPage = reading.currentPage || 0;
  const totalPages = reading.totalPages || 0;
  const progressPercent =
    totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/30 p-4 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all flex flex-col justify-between space-y-3">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-white truncate">
            {reading.title}
          </span>
          {totalPages > 0 && (
            <span className="text-[10px] text-zinc-500 font-mono">
              p. {currentPage}/{totalPages}
            </span>
          )}
        </div>

        {totalPages > 0 && <Progress value={progressPercent} />}

        {reading.resumePoint ? (
          <p className="text-xs text-zinc-300 line-clamp-2">
            <span className="text-zinc-500">Next:</span> {reading.resumePoint}
          </p>
        ) : (
          <p className="text-xs text-zinc-500 line-clamp-1">
            {reading.currentChapter || reading.author ? `by ${reading.author}` : "No next target."}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
        <span className="text-[11px] text-zinc-500">
          {formatRelativeTime(reading.lastRead)}
        </span>
        <button
          onClick={() => setIsUpdateOpen(true)}
          className="text-xs text-white font-medium hover:underline"
        >
          Update
        </button>
      </div>

      {isUpdateOpen && (
        <UpdateReadingModal
          isOpen={isUpdateOpen}
          onClose={() => setIsUpdateOpen(false)}
          reading={reading}
        />
      )}
    </div>
  );
}

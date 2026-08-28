"use client";

import React from "react";
import Link from "next/link";
import {
  FolderKanban,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Sparkles,
  Bookmark,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ActiveProjectContext {
  id: string;
  name: string;
  startHere: string | null;
  whereLeftOff: string | null;
  currentMilestone: string | null;
  lastSessionAt: Date | string | null;
}

interface ActiveLearningContext {
  id: string;
  title: string;
  currentTopic: string | null;
  currentResourceTitle: string | null;
  resumePoint: string | null;
  currentProgress: string | null;
}

interface ActiveReadingContext {
  id: string;
  title: string;
  author: string | null;
  currentPage: number | null;
  totalPages: number | null;
  currentChapter: string | null;
  resumePoint: string | null;
}

interface ResumeHeroDeckProps {
  project: ActiveProjectContext | null;
  learning: ActiveLearningContext | null;
  reading: ActiveReadingContext | null;
  onOpenSessionModal?: (projectId: string, projectName: string) => void;
  onQuickAddToTodo?: (item: { title: string; description?: string; projectId?: string; learningItemId?: string; readingItemId?: string }) => void;
}

export function ResumeHeroDeck({
  project,
  learning,
  reading,
  onOpenSessionModal,
  onQuickAddToTodo,
}: ResumeHeroDeckProps) {
  if (!project && !learning && !reading) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-zinc-400" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
            Resume Exactly Where You Stopped
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Project Resume Card */}
        {project ? (
          <div className="rounded-xl border border-zinc-700 bg-zinc-950/80 p-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FolderKanban className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="font-semibold text-sm text-white truncate">{project.name}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  PROJECT
                </span>
              </div>

              {project.currentMilestone && (
                <div className="text-xs text-zinc-400">
                  <span className="text-zinc-500">Milestone:</span> {project.currentMilestone}
                </div>
              )}

              {project.whereLeftOff && (
                <div className="text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 space-y-1">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider block">
                    Where you stopped:
                  </span>
                  <p className="text-zinc-200 text-xs leading-relaxed line-clamp-2">
                    {project.whereLeftOff}
                  </p>
                </div>
              )}

              {project.startHere ? (
                <div className="mt-3 rounded-lg border border-zinc-600 bg-zinc-900 p-2.5 text-xs">
                  <span className="font-mono text-[10px] font-bold text-white uppercase tracking-wider block mb-0.5">
                    START HERE:
                  </span>
                  <p className="text-zinc-200 font-medium leading-snug">
                    {project.startHere}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800 gap-2">
              <Link href={`/projects/${project.id}`} className="text-xs text-zinc-400 hover:text-white flex items-center gap-1">
                <span>Details</span>
                <ArrowRight className="h-3 w-3" />
              </Link>

              <div className="flex items-center gap-1.5">
                {onQuickAddToTodo && project.startHere && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() =>
                      onQuickAddToTodo({
                        title: project.startHere!,
                        projectId: project.id,
                      })
                    }
                  >
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>To Daily</span>
                  </Button>
                )}
                {onOpenSessionModal && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onOpenSessionModal(project.id, project.name)}
                  >
                    End Session
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Learning Resume Card */}
        {learning ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <GraduationCap className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="font-semibold text-sm text-white truncate">{learning.title}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  ROADMAP
                </span>
              </div>

              {learning.currentTopic && (
                <div className="text-xs text-zinc-400">
                  <span className="text-zinc-500">Topic:</span> {learning.currentTopic}
                </div>
              )}

              {learning.currentResourceTitle && (
                <div className="text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 text-zinc-300 font-medium truncate">
                      <BookOpen className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{learning.currentResourceTitle}</span>
                    </div>
                    {learning.currentProgress && (
                      <span className="font-mono text-[11px] text-zinc-300 shrink-0 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                        {learning.currentProgress}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {learning.resumePoint && (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-2.5 text-xs">
                  <span className="font-mono text-[10px] font-bold text-white uppercase tracking-wider block mb-0.5">
                    NEXT ACTION:
                  </span>
                  <p className="text-zinc-200 font-medium leading-snug">
                    {learning.resumePoint}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800">
              <Link href={`/learning/${learning.id}`} className="text-xs text-zinc-400 hover:text-white flex items-center gap-1">
                <span>View Roadmap</span>
                <ArrowRight className="h-3 w-3" />
              </Link>

              {onQuickAddToTodo && learning.resumePoint && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() =>
                    onQuickAddToTodo({
                      title: learning.resumePoint!,
                      learningItemId: learning.id,
                    })
                  }
                >
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>To Daily</span>
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {/* Reading Resume Card */}
        {reading ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="font-semibold text-sm text-white truncate">{reading.title}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  READING
                </span>
              </div>

              {reading.author && (
                <div className="text-xs text-zinc-400">
                  <span className="text-zinc-500">Author:</span> {reading.author}
                </div>
              )}

              <div className="text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Bookmark className="h-3.5 w-3.5 text-zinc-400" />
                    <span>
                      Page {reading.currentPage ?? 0}
                      {reading.totalPages ? ` of ${reading.totalPages}` : ""}
                    </span>
                  </div>
                  {reading.currentChapter && (
                    <span className="text-zinc-400 truncate max-w-[120px] text-[11px]">
                      {reading.currentChapter}
                    </span>
                  )}
                </div>
              </div>

              {reading.resumePoint && (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-2.5 text-xs">
                  <span className="font-mono text-[10px] font-bold text-white uppercase tracking-wider block mb-0.5">
                    NEXT TARGET:
                  </span>
                  <p className="text-zinc-200 font-medium leading-snug">
                    {reading.resumePoint}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800">
              <Link href="/readings" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1">
                <span>View Queue</span>
                <ArrowRight className="h-3 w-3" />
              </Link>

              {onQuickAddToTodo && reading.resumePoint && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() =>
                    onQuickAddToTodo({
                      title: reading.resumePoint!,
                      readingItemId: reading.id,
                    })
                  }
                >
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>To Daily</span>
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

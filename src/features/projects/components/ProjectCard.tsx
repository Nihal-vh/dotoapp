import React from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startHere: string | null;
  lastWorked: Date | string | null;
  currentMilestone?: {
    id: string;
    name: string;
    status: string;
  } | null;
  tasksCount?: {
    total: number;
    completed: number;
  };
}

interface ProjectCardProps {
  project: ProjectSummary;
  onOpenSessionModal?: (projectId: string, projectName: string) => void;
}

export function ProjectCard({ project, onOpenSessionModal }: ProjectCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/30 p-4 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Link
            href={`/projects/${project.id}`}
            className="font-semibold text-sm text-white hover:underline truncate"
          >
            {project.name}
          </Link>
          <span className="text-[10px] text-zinc-500 font-mono">
            {project.status}
          </span>
        </div>

        {project.startHere ? (
          <p className="text-xs text-zinc-300 line-clamp-2">
            <span className="text-zinc-500">Next:</span> {project.startHere}
          </p>
        ) : (
          <p className="text-xs text-zinc-500 line-clamp-1">
            {project.description || "No next action set."}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
        <span className="text-[11px] text-zinc-500">
          {formatRelativeTime(project.lastWorked)}
        </span>

        <div className="flex items-center gap-2">
          {onOpenSessionModal && (
            <button
              onClick={() => onOpenSessionModal(project.id, project.name)}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Log Session
            </button>
          )}
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 text-xs text-white hover:underline"
          >
            <span>Open</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { MilestoneList } from "./MilestoneList";
import { SessionHistoryList } from "./SessionHistoryList";
import { EndSessionModal } from "./EndSessionModal";
import { formatRelativeTime } from "@/lib/utils";
import { updateProjectStatusAction, deleteProjectAction } from "../actions";
import { useRouter } from "next/navigation";

interface ProjectDetailViewProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    startHere: string | null;
    lastWorked: Date | string | null;
    createdAt: Date | string;
    milestones: {
      id: string;
      name: string;
      description: string | null;
      status: string;
      position: number;
      tasks: {
        id: string;
        title: string;
        description: string | null;
        status: string;
        priority: string;
        dueDate?: Date | string | null;
      }[];
    }[];
    sessions: {
      id: string;
      workedOn: string;
      completed: string;
      stoppedAt: string;
      nextAction: string;
      durationMins?: number | null;
      createdAt: Date | string;
    }[];
  };
}

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const router = useRouter();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${project.name}"?`)) return;
    setIsDeleting(true);
    await deleteProjectAction(project.id);
    router.push("/projects");
  };

  const handleStatusChange = async (newStatus: string) => {
    await updateProjectStatusAction(project.id, newStatus);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Projects</span>
        </Link>

        <div className="flex items-center gap-2">
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-8 rounded-lg border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-200 focus:outline-none"
          >
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <button
            onClick={() => setIsSessionModalOpen(true)}
            className="h-8 px-3 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors"
          >
            Log Session
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Delete project"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Project Card */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">{project.name}</h1>
          <span className="text-xs text-zinc-500">
            {formatRelativeTime(project.lastWorked)}
          </span>
        </div>

        {project.description && (
          <p className="text-xs text-zinc-400 leading-relaxed">
            {project.description}
          </p>
        )}

        {project.startHere && (
          <div className="pt-1">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block">
              Next Action
            </span>
            <p className="text-sm font-semibold text-white mt-0.5">
              {project.startHere}
            </p>
          </div>
        )}
      </div>

      {/* Milestones & Tasks */}
      <div className="space-y-6">
        <MilestoneList projectId={project.id} milestones={project.milestones} />
        <SessionHistoryList sessions={project.sessions} />
      </div>

      {/* End Session Modal */}
      {isSessionModalOpen && (
        <EndSessionModal
          isOpen={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          projectId={project.id}
          projectName={project.name}
        />
      )}
    </div>
  );
}

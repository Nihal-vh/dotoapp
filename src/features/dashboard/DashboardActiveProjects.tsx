"use client";

import React from "react";
import Link from "next/link";
import { FolderKanban, ArrowRight, Flag } from "lucide-react";
import { StatusPill } from "@/components/shared/StatusPill";

interface DashboardProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  currentMilestone: string | null;
  startHere: string | null;
}

interface DashboardActiveProjectsProps {
  projects: DashboardProject[];
}

export function DashboardActiveProjects({ projects }: DashboardActiveProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-zinc-400" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
            Active Projects ({projects.length})
          </h3>
        </div>
        <Link
          href="/projects"
          className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <span>All Projects</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900"
          >
            <div className="flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-semibold text-sm text-white group-hover:text-zinc-200 transition-colors truncate">
                    {project.name}
                  </span>
                  <StatusPill status={project.status} />
                </div>

                {project.currentMilestone && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Flag className="h-3 w-3 text-zinc-400 shrink-0" />
                    <span className="truncate">{project.currentMilestone}</span>
                  </div>
                )}

                {project.startHere && (
                  <div className="mt-2 text-xs text-zinc-200 font-medium bg-zinc-800 rounded px-2 py-1 border border-zinc-700 line-clamp-1">
                    <span className="font-mono text-zinc-400 mr-1 text-[10px]">NEXT:</span>
                    {project.startHere}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

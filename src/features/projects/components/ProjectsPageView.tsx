"use client";

import React, { useState } from "react";
import { ProjectCard, ProjectSummary } from "./ProjectCard";
import { CreateProjectModal } from "./CreateProjectModal";
import { EndSessionModal } from "./EndSessionModal";
import { Plus } from "lucide-react";

interface ProjectsPageViewProps {
  projects: ProjectSummary[];
}

export function ProjectsPageView({ projects }: ProjectsPageViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [sessionModalState, setSessionModalState] = useState<{
    isOpen: boolean;
    projectId: string;
    projectName: string;
  }>({
    isOpen: false,
    projectId: "",
    projectName: "",
  });

  const handleOpenSessionModal = (projectId: string, projectName: string) => {
    setSessionModalState({
      isOpen: true,
      projectId,
      projectName,
    });
  };

  const filteredProjects = projects.filter((p) => {
    if (filterStatus === "ALL") return p.status !== "ARCHIVED";
    return p.status === filterStatus;
  });

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-10">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Projects</h1>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "ALL", label: "Active & Paused" },
          { id: "ACTIVE", label: "Active" },
          { id: "PAUSED", label: "Paused" },
          { id: "COMPLETED", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
              filterStatus === tab.id
                ? "bg-zinc-800 text-white font-semibold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-500">
          No projects found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpenSessionModal={handleOpenSessionModal}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {isCreateOpen && (
        <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      )}

      {sessionModalState.isOpen && (
        <EndSessionModal
          isOpen={sessionModalState.isOpen}
          onClose={() =>
            setSessionModalState({ isOpen: false, projectId: "", projectName: "" })
          }
          projectId={sessionModalState.projectId}
          projectName={sessionModalState.projectName}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Plus,
} from "lucide-react";
import { TodoItem, TodoItemData } from "../todos/components/TodoItem";
import { CreateTodoInline } from "../todos/components/CreateTodoInline";
import { EndSessionModal } from "../projects/components/EndSessionModal";
import { CarryForwardBanner } from "../todos/components/CarryForwardBanner";

export interface DashboardClientProps {
  todayDate: string;
  tomorrowDate: string;
  overdueTodos: { id: string; title: string; date: string }[];
  todayTodos: TodoItemData[];
  tomorrowTodos: TodoItemData[];
  activeProjects: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    startHere: string | null;
    lastWorked: Date | string | null;
    lastSession?: {
      stoppedAt: string;
      nextAction: string;
      createdAt: Date | string;
    } | null;
  }[];
  activeLearning?: {
    id: string;
    title: string;
    currentTopicTitle: string;
    resourceTitle: string;
    resourceType: string;
    currentProgress: string | null;
    totalDuration: string | null;
    resumePoint: string | null;
  } | null;
  activeReading?: {
    id: string;
    title: string;
    currentChapter: string | null;
    currentPage: number | null;
    totalPages: number | null;
    resumePoint: string | null;
  } | null;
}

export function DashboardClientView({
  todayDate,
  tomorrowDate,
  overdueTodos,
  todayTodos,
  tomorrowTodos,
  activeProjects,
  activeLearning,
  activeReading,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"TODAY" | "TOMORROW">("TODAY");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    activeProjects[0]?.id || ""
  );

  const [sessionModalState, setSessionModalState] = useState<{
    isOpen: boolean;
    projectId: string;
    projectName: string;
    startHere?: string | null;
  }>({
    isOpen: false,
    projectId: "",
    projectName: "",
  });

  const selectedProject =
    activeProjects.find((p) => p.id === selectedProjectId) || activeProjects[0];

  const displayedTodos = activeTab === "TODAY" ? todayTodos : tomorrowTodos;
  const currentDisplayedDate = activeTab === "TODAY" ? todayDate : tomorrowDate;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      {/* Overdue alert if any */}
      <CarryForwardBanner overdueTodos={overdueTodos} />

      {/* ======================================================== */}
      {/* 1. CURRENT FOCUS CARD (Minimal & Clean)                  */}
      {/* ======================================================== */}
      {selectedProject ? (
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 space-y-4">
          {/* Project Switcher Chips */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {activeProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                    p.id === selectedProject.id
                      ? "bg-white text-zinc-950 font-semibold"
                      : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <Link
              href={`/projects/${selectedProject.id}`}
              className="text-xs text-zinc-500 hover:text-white transition-colors shrink-0"
            >
              Details &rarr;
            </Link>
          </div>

          {/* Next Action in large, calm typography */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider block">
              Next Action
            </span>
            <p className="text-lg sm:text-xl font-semibold text-white leading-snug">
              {selectedProject.startHere || "Click below to set your next step."}
            </p>

            {(selectedProject.lastSession?.stoppedAt || selectedProject.description) && (
              <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                <span className="text-zinc-500">Previously:</span>{" "}
                {selectedProject.lastSession?.stoppedAt || selectedProject.description}
              </p>
            )}
          </div>

          {/* Single primary button */}
          <div className="pt-2">
            <button
              onClick={() =>
                setSessionModalState({
                  isOpen: true,
                  projectId: selectedProject.id,
                  projectName: selectedProject.name,
                  startHere: selectedProject.startHere,
                })
              }
              className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Log Session & Set Next Action</span>
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center space-y-2">
          <p className="text-xs text-zinc-400">No active projects yet.</p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-xs text-white font-medium hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Create a project
          </Link>
        </section>
      )}

      {/* ======================================================== */}
      {/* 2. TODAY'S TASKS (Minimal Checklist)                     */}
      {/* ======================================================== */}
      <section className="space-y-3">
        {/* Simple Tabs: Today / Tomorrow */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("TODAY")}
              className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                activeTab === "TODAY"
                  ? "border-white text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Today ({todayTodos.filter((t) => t.status !== "COMPLETED").length})
            </button>
            <button
              onClick={() => setActiveTab("TOMORROW")}
              className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                activeTab === "TOMORROW"
                  ? "border-white text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Tomorrow ({tomorrowTodos.length})
            </button>
          </div>

          <Link
            href="/todos/plan-tomorrow"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Plan Tomorrow &rarr;
          </Link>
        </div>

        {/* Quick Task Input */}
        <CreateTodoInline date={currentDisplayedDate} />

        {/* Task List */}
        {displayedTodos.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-600">
            No tasks for {activeTab === "TODAY" ? "today" : "tomorrow"}.
          </div>
        ) : (
          <div className="space-y-1.5 pt-1">
            {displayedTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 3. CONTINUITY SHELF (Clean 1-line Bookmarks)              */}
      {/* ======================================================== */}
      {(activeLearning || activeReading) && (
        <section className="pt-4 border-t border-zinc-900 space-y-2">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium block">
            Continuity
          </span>

          <div className="space-y-2">
            {activeLearning && (
              <Link
                href={`/learning/${activeLearning.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-900 transition-colors group text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <GraduationCap className="h-4 w-4 text-zinc-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-medium text-white">{activeLearning.title}</span>
                    {activeLearning.resumePoint && (
                      <span className="text-zinc-500 ml-2 truncate">
                        · Next: {activeLearning.resumePoint}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white transition-colors shrink-0 ml-2" />
              </Link>
            )}

            {activeReading && (
              <Link
                href="/readings"
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-900 transition-colors group text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <BookOpen className="h-4 w-4 text-zinc-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-medium text-white">{activeReading.title}</span>
                    {activeReading.currentPage !== null && (
                      <span className="text-zinc-500 ml-2">
                        · p. {activeReading.currentPage}
                        {activeReading.totalPages ? `/${activeReading.totalPages}` : ""}
                      </span>
                    )}
                    {activeReading.resumePoint && (
                      <span className="text-zinc-500 ml-2 truncate">
                        · Next: {activeReading.resumePoint}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white transition-colors shrink-0 ml-2" />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* End Session Modal */}
      {sessionModalState.isOpen && (
        <EndSessionModal
          isOpen={sessionModalState.isOpen}
          onClose={() =>
            setSessionModalState({ isOpen: false, projectId: "", projectName: "" })
          }
          projectId={sessionModalState.projectId}
          projectName={sessionModalState.projectName}
          currentStartHere={sessionModalState.startHere}
        />
      )}
    </div>
  );
}

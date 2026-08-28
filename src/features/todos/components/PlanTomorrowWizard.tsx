"use client";

import React, { useState } from "react";
import {
  CalendarCheck,
  FolderKanban,
  GraduationCap,
  BookOpen,
  Plus,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createTodoAction } from "../actions";
import { TodoItem, TodoItemData } from "./TodoItem";
import Link from "next/link";

interface QuickSourceProject {
  id: string;
  name: string;
  startHere?: string | null;
  tasks: { id: string; title: string; milestoneName: string }[];
}

interface QuickSourceLearning {
  id: string;
  title: string;
  currentTopicTitle?: string;
  resources: { id: string; title: string; resumePoint?: string | null }[];
}

interface QuickSourceReading {
  id: string;
  title: string;
  resumePoint?: string | null;
  currentChapter?: string | null;
}

interface PlanTomorrowWizardProps {
  tomorrowDate: string;
  existingTomorrowTodos: TodoItemData[];
  projects: QuickSourceProject[];
  learnings: QuickSourceLearning[];
  readings: QuickSourceReading[];
}

export function PlanTomorrowWizard({
  tomorrowDate,
  existingTomorrowTodos,
  projects,
  learnings,
  readings,
}: PlanTomorrowWizardProps) {
  const [customTitle, setCustomTitle] = useState("");
  const [customPriority, setCustomPriority] = useState("MEDIUM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await createTodoAction({
        title: customTitle.trim(),
        date: tomorrowDate,
        priority: customPriority,
      });
      setCustomTitle("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProjectTask = async (proj: QuickSourceProject, task: { id: string; title: string }) => {
    setAddedItemIds((prev) => ({ ...prev, [`task-${task.id}`]: true }));
    await createTodoAction({
      title: task.title,
      date: tomorrowDate,
      priority: "HIGH",
      projectId: proj.id,
      projectTaskId: task.id,
    });
  };

  const handleAddProjectStartHere = async (proj: QuickSourceProject) => {
    if (!proj.startHere) return;
    setAddedItemIds((prev) => ({ ...prev, [`proj-${proj.id}`]: true }));
    await createTodoAction({
      title: `${proj.name}: ${proj.startHere}`,
      date: tomorrowDate,
      priority: "HIGH",
      projectId: proj.id,
    });
  };

  const handleAddLearningResource = async (
    learning: QuickSourceLearning,
    res: { id: string; title: string; resumePoint?: string | null }
  ) => {
    setAddedItemIds((prev) => ({ ...prev, [`res-${res.id}`]: true }));
    await createTodoAction({
      title: `Continue ${learning.title}: ${res.title}`,
      description: res.resumePoint || undefined,
      date: tomorrowDate,
      priority: "MEDIUM",
      learningItemId: learning.id,
      resourceId: res.id,
    });
  };

  const handleAddReading = async (reading: QuickSourceReading) => {
    setAddedItemIds((prev) => ({ ...prev, [`read-${reading.id}`]: true }));
    await createTodoAction({
      title: reading.resumePoint
        ? `${reading.title}: ${reading.resumePoint}`
        : `Read ${reading.title}`,
      description: reading.currentChapter ? `Chapter: ${reading.currentChapter}` : undefined,
      date: tomorrowDate,
      priority: "MEDIUM",
      readingItemId: reading.id,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Wizard Header */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
              <CalendarCheck className="h-4 w-4 text-zinc-300" />
              <span>Evening Planning Routine</span>
            </div>
            <h1 className="text-xl font-bold text-white">
              Plan Tomorrow ({tomorrowDate})
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
              Line up your exact next actions from your active projects, learning roadmaps, and reading lists so you wake up ready to execute with zero friction.
            </p>
          </div>

          <Link href="/">
            <Button variant="secondary" size="sm" className="text-xs">
              <span>Back to Dashboard</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick-Add Drawers from Modules (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Quick Custom Task Form */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-zinc-400" />
              <span>Add Custom Standalone Task</span>
            </h3>
            <form onSubmit={handleAddCustom} className="space-y-2">
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Call client / verify staging deploy..."
                className="text-xs h-8"
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1">
                  {["LOW", "MEDIUM", "HIGH"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCustomPriority(p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors ${
                        customPriority === p
                          ? "bg-zinc-100 text-zinc-950 font-bold"
                          : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <Button
                  type="submit"
                  size="sm"
                  variant="default"
                  isLoading={isSubmitting}
                  className="text-xs h-7"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add for Tomorrow
                </Button>
              </div>
            </form>
          </div>

          {/* Quick Add from Projects */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <FolderKanban className="h-3.5 w-3.5 text-zinc-400" />
              <span>From Active Projects</span>
            </div>

            {projects.length === 0 ? (
              <p className="text-xs text-zinc-500">No active projects available.</p>
            ) : (
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-zinc-200 truncate">
                        {proj.name}
                      </span>
                      {proj.startHere && (
                        <button
                          onClick={() => handleAddProjectStartHere(proj)}
                          disabled={addedItemIds[`proj-${proj.id}`]}
                          className="flex items-center gap-1 text-[11px] font-medium text-zinc-200 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded border border-zinc-700 disabled:opacity-50 transition-colors"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>
                            {addedItemIds[`proj-${proj.id}`] ? "Added" : "+ Add START HERE"}
                          </span>
                        </button>
                      )}
                    </div>

                    {proj.tasks.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-zinc-800/60">
                        {proj.tasks.slice(0, 3).map((task) => {
                          const isAdded = addedItemIds[`task-${task.id}`];
                          return (
                            <div
                              key={task.id}
                              className="flex items-center justify-between gap-2 text-xs text-zinc-300 py-1"
                            >
                              <span className="truncate">{task.title}</span>
                              <button
                                onClick={() => handleAddProjectTask(proj, task)}
                                disabled={isAdded}
                                className="text-[11px] text-zinc-400 hover:text-white bg-zinc-800 px-2 py-0.5 rounded shrink-0 disabled:opacity-40 transition-colors"
                              >
                                {isAdded ? "Added" : "+ Tomorrow"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add from Learning Roadmaps */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <GraduationCap className="h-3.5 w-3.5 text-zinc-400" />
              <span>From Learning Roadmaps</span>
            </div>

            {learnings.length === 0 ? (
              <p className="text-xs text-zinc-500">No active learning items.</p>
            ) : (
              <div className="space-y-2">
                {learnings.map((l) => (
                  <div
                    key={l.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 space-y-1.5"
                  >
                    <span className="font-semibold text-xs text-zinc-200 block truncate">
                      {l.title}
                    </span>
                    {l.resources.map((res) => {
                      const isAdded = addedItemIds[`res-${res.id}`];
                      return (
                        <div
                          key={res.id}
                          className="flex items-center justify-between gap-2 text-xs text-zinc-300"
                        >
                          <span className="truncate">{res.title}</span>
                          <button
                            onClick={() => handleAddLearningResource(l, res)}
                            disabled={isAdded}
                            className="text-[11px] text-zinc-400 hover:text-white bg-zinc-800 px-2 py-0.5 rounded shrink-0 disabled:opacity-40"
                          >
                            {isAdded ? "Added" : "+ Tomorrow"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add from Readings */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
              <span>From Reading List</span>
            </div>

            {readings.length === 0 ? (
              <p className="text-xs text-zinc-500">No active readings.</p>
            ) : (
              <div className="space-y-2">
                {readings.map((r) => {
                  const isAdded = addedItemIds[`read-${r.id}`];
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs text-zinc-300"
                    >
                      <div className="min-w-0">
                        <span className="font-medium truncate block text-zinc-200">
                          {r.title}
                        </span>
                        {r.resumePoint && (
                          <span className="text-[11px] text-zinc-400 truncate block">
                            Target: {r.resumePoint}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddReading(r)}
                        disabled={isAdded}
                        className="text-[11px] text-zinc-400 hover:text-white bg-zinc-800 px-2 py-0.5 rounded shrink-0 disabled:opacity-40"
                      >
                        {isAdded ? "Added" : "+ Tomorrow"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tomorrow's Live Plan (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20 rounded-xl border border-zinc-700 bg-zinc-950 p-4 space-y-3 start-here-glow">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-zinc-300" />
                <h3 className="text-sm font-semibold text-white">
                  Tomorrow&apos;s Queue ({existingTomorrowTodos.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {tomorrowDate}
              </span>
            </div>

            {existingTomorrowTodos.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
                Nothing planned for tomorrow yet. Click &quot;+ Tomorrow&quot; on any item to the left or add a custom task.
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {existingTomorrowTodos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Ready for tomorrow?
              </span>
              <Link href="/">
                <Button variant="default" size="sm" className="text-xs font-semibold">
                  Finish Planning
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

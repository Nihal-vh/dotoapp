"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Plus, CalendarPlus, ChevronDown, ChevronRight, Flag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createTaskAction, toggleTaskStatusAction, createMilestoneAction } from "../actions";
import { QuickAddToTodoModal } from "@/components/shared/QuickAddToTodoModal";
import { createTodoAction } from "@/features/todos/actions";

interface TaskItemData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate?: Date | string | null;
}

interface MilestoneData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  position: number;
  tasks: TaskItemData[];
}

interface MilestoneListProps {
  projectId: string;
  milestones: MilestoneData[];
}

export function MilestoneList({ projectId, milestones }: MilestoneListProps) {
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    milestones.forEach((m, idx) => {
      initial[m.id] = idx === 0 || m.status === "IN_PROGRESS";
    });
    return initial;
  });

  const [newTaskMilestoneId, setNewTaskMilestoneId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState("");

  const [selectedTaskForTodo, setSelectedTaskForTodo] = useState<{ id: string; title: string } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedMilestones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateTask = async (milestoneId: string) => {
    if (!newTaskTitle.trim()) return;
    await createTaskAction(milestoneId, projectId, newTaskTitle.trim());
    setNewTaskTitle("");
    setNewTaskMilestoneId(null);
  };

  const handleCreateMilestone = async () => {
    if (!newMilestoneName.trim()) return;
    await createMilestoneAction(projectId, newMilestoneName.trim());
    setNewMilestoneName("");
    setIsAddingMilestone(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <Flag className="h-4 w-4 text-zinc-400" />
          <span>Milestones & Tasks</span>
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingMilestone(true)}
          className="text-xs h-7"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Milestone
        </Button>
      </div>

      {isAddingMilestone && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-3 space-y-2">
          <label className="text-xs text-zinc-300 font-medium">New Milestone Name</label>
          <div className="flex gap-2">
            <Input
              value={newMilestoneName}
              onChange={(e) => setNewMilestoneName(e.target.value)}
              placeholder="e.g. Authentication & RBAC"
              autoFocus
              className="h-8 text-xs"
            />
            <Button size="sm" onClick={handleCreateMilestone} className="h-8 text-xs">
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsAddingMilestone(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {milestones.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
            No milestones created yet. Click above to add your first milestone.
          </div>
        ) : (
          milestones.map((milestone) => {
            const isExpanded = expandedMilestones[milestone.id];
            const completedTasks = milestone.tasks.filter((t) => t.status === "COMPLETED").length;

            return (
              <div
                key={milestone.id}
                className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 overflow-hidden"
              >
                {/* Milestone Header Bar */}
                <div
                  onClick={() => toggleExpand(milestone.id)}
                  className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-zinc-400" />
                    )}
                    <span className="font-medium text-sm text-zinc-100 truncate">
                      {milestone.name}
                    </span>
                    {milestone.status === "COMPLETED" && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        Done
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="text-[11px] font-mono">
                      {completedTasks}/{milestone.tasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks List */}
                {isExpanded && (
                  <div className="p-3 pt-0 border-t border-zinc-900 space-y-1.5">
                    {milestone.tasks.map((task) => {
                      const isCompleted = task.status === "COMPLETED";

                      return (
                        <div
                          key={task.id}
                          className="group flex items-center justify-between gap-3 rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2 hover:border-zinc-800 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              onClick={() => toggleTaskStatusAction(task.id, projectId, task.status)}
                              className="text-zinc-500 hover:text-white transition-colors"
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-zinc-300" />
                              ) : (
                                <Circle className="h-4 w-4 text-zinc-500" />
                              )}
                            </button>
                            <span
                              className={`text-xs font-medium truncate ${
                                isCompleted ? "line-through text-zinc-500" : "text-zinc-200"
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            {task.priority === "HIGH" && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                                HIGH
                              </span>
                            )}
                            <button
                              onClick={() =>
                                setSelectedTaskForTodo({ id: task.id, title: task.title })
                              }
                              title="Schedule for Today or Tomorrow"
                              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 px-2 py-0.5 rounded transition-colors"
                            >
                              <CalendarPlus className="h-3 w-3" />
                              <span className="hidden sm:inline">Add to Todo</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Task Input */}
                    {newTaskMilestoneId === milestone.id ? (
                      <div className="pt-2 flex gap-2">
                        <Input
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleCreateTask(milestone.id)}
                          placeholder="Task title..."
                          autoFocus
                          className="h-8 text-xs"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleCreateTask(milestone.id)}
                          className="h-8 text-xs"
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setNewTaskMilestoneId(null)}
                          className="h-8 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setNewTaskMilestoneId(milestone.id)}
                        className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 py-1 px-2 rounded hover:bg-zinc-900 transition-colors w-full"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add task to this milestone</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Add To Todo Modal */}
      {selectedTaskForTodo && (
        <QuickAddToTodoModal
          isOpen={true}
          onClose={() => setSelectedTaskForTodo(null)}
          defaultTitle={selectedTaskForTodo.title}
          projectId={projectId}
          projectTaskId={selectedTaskForTodo.id}
          onAddTodo={async (data) => {
            await createTodoAction(data);
          }}
        />
      )}
    </div>
  );
}

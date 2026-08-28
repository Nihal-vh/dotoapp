"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Clock, Plus, Video, ExternalLink, BookOpen, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateTopicStatusAction, createLearningTopicAction } from "../actions";
import { UpdateResourceModal } from "./UpdateResourceModal";
import { CreateResourceModal } from "./CreateResourceModal";
import { QuickAddToTodoModal } from "@/components/shared/QuickAddToTodoModal";
import { createTodoAction } from "@/features/todos/actions";

export interface TopicResourceData {
  id: string;
  title: string;
  url: string | null;
  type: string;
  status: string;
  currentProgress: string | null;
  totalDuration: string | null;
  resumePoint: string | null;
  notes: string | null;
}

export interface RoadmapTopicData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  position: number;
  notes: string | null;
  resources: TopicResourceData[];
}

interface RoadmapTimelineProps {
  learningItemId: string;
  topics: RoadmapTopicData[];
}

export function RoadmapTimeline({ learningItemId, topics }: RoadmapTimelineProps) {
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicDesc, setNewTopicDesc] = useState("");

  const [updatingResource, setUpdatingResource] = useState<TopicResourceData | null>(null);
  const [addingResourceTopicId, setAddingResourceTopicId] = useState<string | null>(null);

  const [todoItemToSchedule, setTodoItemToSchedule] = useState<{
    title: string;
    description?: string;
    resourceId?: string;
  } | null>(null);

  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim()) return;
    await createLearningTopicAction({
      learningItemId,
      title: newTopicTitle.trim(),
      description: newTopicDesc.trim() || undefined,
    });
    setNewTopicTitle("");
    setNewTopicDesc("");
    setIsAddingTopic(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">Roadmap & Topics</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingTopic(true)}
          className="text-xs h-7"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Topic
        </Button>
      </div>

      {isAddingTopic && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 space-y-3">
          <label className="text-xs font-semibold text-zinc-200">New Roadmap Topic</label>
          <Input
            value={newTopicTitle}
            onChange={(e) => setNewTopicTitle(e.target.value)}
            placeholder="e.g. Memory Management & Paging"
            autoFocus
            className="h-8 text-xs"
          />
          <Input
            value={newTopicDesc}
            onChange={(e) => setNewTopicDesc(e.target.value)}
            placeholder="Topic description / core concepts (optional)..."
            className="h-8 text-xs"
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsAddingTopic(false)}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateTopic} className="h-7 text-xs">
              Save Topic
            </Button>
          </div>
        </div>
      )}

      {/* Roadmap List */}
      <div className="space-y-3">
        {topics.map((topic, index) => {
          const isCompleted = topic.status === "COMPLETED";
          const isInProgress = topic.status === "IN_PROGRESS";

          return (
            <div
              key={topic.id}
              className={`rounded-xl border p-4 transition-all ${
                isInProgress
                  ? "border-zinc-700 bg-zinc-950/80 start-here-glow"
                  : "border-zinc-800 bg-zinc-900/40"
              }`}
            >
              {/* Topic Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() =>
                      updateTopicStatusAction(
                        topic.id,
                        learningItemId,
                        isCompleted ? "IN_PROGRESS" : "COMPLETED"
                      )
                    }
                    className="mt-0.5 text-zinc-500 hover:text-white transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-zinc-300" />
                    ) : isInProgress ? (
                      <Clock className="h-5 w-5 text-white" />
                    ) : (
                      <Circle className="h-5 w-5 text-zinc-600" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-500 font-bold">
                        #{index + 1}
                      </span>
                      <h4
                        className={`text-sm font-semibold ${
                          isCompleted ? "line-through text-zinc-400" : "text-zinc-100"
                        }`}
                      >
                        {topic.title}
                      </h4>
                      {isInProgress && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                          Current Focus
                        </span>
                      )}
                    </div>
                    {topic.description && (
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {topic.description}
                      </p>
                    )}
                    {topic.notes && (
                      <p className="text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 mt-2">
                        {topic.notes}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingResourceTopicId(topic.id)}
                  className="text-xs h-7 px-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Resource
                </Button>
              </div>

              {/* Topic Resources */}
              {topic.resources.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-zinc-800/60 space-y-2">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Resources:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {topic.resources.map((res) => (
                      <div
                        key={res.id}
                        className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-medium text-zinc-200 truncate">
                              {res.type === "YOUTUBE" ? (
                                <Video className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              ) : (
                                <BookOpen className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              )}
                              <span className="truncate">{res.title}</span>
                            </div>
                            {res.url && (
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-zinc-400 hover:text-white"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>

                          {/* Progress Badge */}
                          {res.currentProgress && (
                            <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                              <span className="text-zinc-500">Progress:</span>
                              <span className="font-mono text-zinc-200 font-medium bg-zinc-800 px-1.5 py-0.2 rounded border border-zinc-700">
                                {res.currentProgress}
                                {res.totalDuration ? ` / ${res.totalDuration}` : ""}
                              </span>
                            </div>
                          )}

                          {/* Resume Point Note */}
                          {res.resumePoint && (
                            <div className="mt-1.5 text-[11px] text-zinc-300 bg-zinc-900 rounded p-1.5 border border-zinc-800">
                              <span className="font-mono text-zinc-200 font-semibold block mb-0.5">
                                NEXT:
                              </span>
                              <span>{res.resumePoint}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-2.5 pt-2 border-t border-zinc-900 flex items-center justify-between gap-1">
                          <button
                            onClick={() => setUpdatingResource(res)}
                            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Update Progress</span>
                          </button>

                          <button
                            onClick={() =>
                              setTodoItemToSchedule({
                                title: `Continue: ${res.title}`,
                                description: res.resumePoint || undefined,
                                resourceId: res.id,
                              })
                            }
                            className="flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add to Todo</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {updatingResource && (
        <UpdateResourceModal
          isOpen={true}
          onClose={() => setUpdatingResource(null)}
          resource={updatingResource}
        />
      )}

      {addingResourceTopicId && (
        <CreateResourceModal
          isOpen={true}
          onClose={() => setAddingResourceTopicId(null)}
          topicId={addingResourceTopicId}
        />
      )}

      {todoItemToSchedule && (
        <QuickAddToTodoModal
          isOpen={true}
          onClose={() => setTodoItemToSchedule(null)}
          defaultTitle={todoItemToSchedule.title}
          defaultDescription={todoItemToSchedule.description}
          learningItemId={learningItemId}
          resourceId={todoItemToSchedule.resourceId}
          onAddTodo={async (data) => {
            await createTodoAction(data);
          }}
        />
      )}
    </div>
  );
}

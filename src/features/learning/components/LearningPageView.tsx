"use client";

import React, { useState } from "react";
import { LearningCard, LearningSummary } from "./LearningCard";
import { CreateLearningModal } from "./CreateLearningModal";
import { Plus } from "lucide-react";

interface LearningPageViewProps {
  learnings: LearningSummary[];
}

export function LearningPageView({ learnings }: LearningPageViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const filteredLearnings = learnings.filter((l) => {
    if (filterStatus === "ALL") return true;
    return l.status === filterStatus;
  });

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Learning</h1>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Roadmap</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "ALL", label: "All Roadmaps" },
          { id: "IN_PROGRESS", label: "In Progress" },
          { id: "COMPLETED", label: "Completed" },
          { id: "PAUSED", label: "Paused" },
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

      {/* Grid */}
      {filteredLearnings.length === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-500">
          No learning roadmaps found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredLearnings.map((learning) => (
            <LearningCard key={learning.id} learning={learning} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <CreateLearningModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </div>
  );
}

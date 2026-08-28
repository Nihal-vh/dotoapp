"use client";

import React, { useState } from "react";
import { ReadingCard, ReadingItemData } from "./ReadingCard";
import { CreateReadingModal } from "./CreateReadingModal";
import { Plus } from "lucide-react";

interface ReadingsPageViewProps {
  readings: ReadingItemData[];
}

export function ReadingsPageView({ readings }: ReadingsPageViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");

  const filteredReadings = readings.filter((r) => {
    if (filterType === "ALL") return true;
    return r.type === filterType;
  });

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Readings</h1>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Reading</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "ALL", label: "All Items" },
          { id: "BOOK", label: "Books" },
          { id: "PAPER", label: "Papers" },
          { id: "ARTICLE", label: "Articles" },
          { id: "DOCS", label: "Docs" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
              filterType === tab.id
                ? "bg-zinc-800 text-white font-semibold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredReadings.length === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-500">
          No reading items found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredReadings.map((reading) => (
            <ReadingCard key={reading.id} reading={reading} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <CreateReadingModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </div>
  );
}

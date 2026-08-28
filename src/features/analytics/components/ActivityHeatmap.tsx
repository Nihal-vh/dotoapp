"use client";

import React, { useState } from "react";
import { formatDisplayDate } from "@/lib/utils";

export interface DayActivity {
  date: string; // YYYY-MM-DD
  count: number;
  sessions: number;
  todos: number;
}

interface ActivityHeatmapProps {
  days: DayActivity[];
  totalActions: number;
  currentStreak: number;
  longestStreak: number;
}

export function ActivityHeatmap({
  days,
  totalActions,
  currentStreak,
  longestStreak,
}: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);

  // Group days into weeks of 7 days (Sun -> Sat)
  const weeks: DayActivity[][] = [];
  let currentWeek: DayActivity[] = [];

  days.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-zinc-900 border border-zinc-800/40";
    if (count <= 2) return "bg-zinc-700 border border-zinc-600";
    if (count <= 4) return "bg-zinc-500 border border-zinc-400";
    if (count <= 7) return "bg-zinc-300 border border-zinc-200";
    return "bg-white border border-white text-zinc-950 shadow-xs";
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 space-y-4">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Activity & Continuity Graph
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {totalActions} actions logged over the past year
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-medium">
              Current Streak
            </span>
            <span className="text-white font-bold text-sm">
              {currentStreak} {currentStreak === 1 ? "day" : "days"}
            </span>
          </div>
          <div className="h-6 w-[1px] bg-zinc-800" />
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-medium">
              Longest Streak
            </span>
            <span className="text-white font-bold text-sm">
              {longestStreak} {longestStreak === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
      </div>

      {/* Git-like Contribution Grid */}
      <div className="relative">
        <div className="overflow-x-auto pb-2 pt-1 scrollbar-none">
          <div className="inline-flex gap-1 min-w-max">
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-1">
                {week.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-xs transition-all hover:ring-1 hover:ring-white ${getIntensityClass(
                      day.count
                    )}`}
                    title={`${day.count} actions on ${day.date}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Tooltip */}
        <div className="h-6 flex items-center justify-between text-[11px] text-zinc-400 pt-1">
          <div>
            {hoveredDay ? (
              <span className="text-zinc-200">
                <strong>{hoveredDay.count}</strong> actions on{" "}
                <span className="text-white font-medium">
                  {formatDisplayDate(hoveredDay.date)}
                </span>{" "}
                ({hoveredDay.sessions} sessions, {hoveredDay.todos} tasks)
              </span>
            ) : (
              <span className="text-zinc-500">Hover over tiles to see daily details</span>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <span>Less</span>
            <div className="h-2.5 w-2.5 rounded-xs bg-zinc-900 border border-zinc-800" />
            <div className="h-2.5 w-2.5 rounded-xs bg-zinc-700" />
            <div className="h-2.5 w-2.5 rounded-xs bg-zinc-500" />
            <div className="h-2.5 w-2.5 rounded-xs bg-zinc-300" />
            <div className="h-2.5 w-2.5 rounded-xs bg-white" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

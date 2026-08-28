"use client";

import React, { useState } from "react";

export interface PeriodProgressData {
  label: string; // e.g. "Aug 4-10" or "Jul 2026"
  shortLabel: string; // e.g. "Aug 4" or "Jul"
  totalActions: number;
  sessions: number;
  todos: number;
  isCurrent?: boolean;
}

interface ProgressChartProps {
  weeklyData: PeriodProgressData[];
  monthlyData: PeriodProgressData[];
}

export function ProgressChart({ weeklyData, monthlyData }: ProgressChartProps) {
  const [viewMode, setViewMode] = useState<"WEEKLY" | "MONTHLY">("WEEKLY");
  const [hoveredItem, setHoveredItem] = useState<PeriodProgressData | null>(null);

  const activeData = viewMode === "WEEKLY" ? weeklyData : monthlyData;
  const maxActions = Math.max(...activeData.map((d) => d.totalActions), 5);

  const totalPeriodActions = activeData.reduce((sum, d) => sum + d.totalActions, 0);
  const averageActions =
    activeData.length > 0
      ? Math.round((totalPeriodActions / activeData.length) * 10) / 10
      : 0;

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 space-y-4">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Activity Trends & Velocity
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {viewMode === "WEEKLY"
              ? `Past ${weeklyData.length} weeks (avg. ${averageActions} actions/week)`
              : `Past ${monthlyData.length} months (avg. ${averageActions} actions/month)`}
          </p>
        </div>

        {/* Weekly / Monthly Toggle */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setViewMode("WEEKLY");
              setHoveredItem(null);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "WEEKLY"
                ? "bg-zinc-800 text-white shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode("MONTHLY");
              setHoveredItem(null);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "MONTHLY"
                ? "bg-zinc-800 text-white shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Bar Chart Canvas */}
      <div className="pt-4 space-y-2">
        <div className="relative h-44 w-full flex items-end justify-between gap-1.5 sm:gap-3 border-b border-zinc-800 pb-1">
          {/* Subtle horizontal guideline at 50% and 100% */}
          <div className="absolute inset-x-0 top-0 border-b border-dashed border-zinc-800/60 pointer-events-none" />
          <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-zinc-800/40 pointer-events-none" />

          {activeData.map((item, idx) => {
            const heightPercent =
              item.totalActions > 0
                ? Math.max(8, Math.round((item.totalActions / maxActions) * 100))
                : 3;

            const isHovered = hoveredItem?.label === item.label;

            return (
              <div
                key={idx}
                className="relative flex-1 flex flex-col items-center justify-end h-full group"
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[28px] rounded-t-sm transition-all duration-200 ${
                    item.isCurrent
                      ? "bg-white"
                      : isHovered
                      ? "bg-zinc-200"
                      : item.totalActions > 0
                      ? "bg-zinc-600 group-hover:bg-zinc-400"
                      : "bg-zinc-850"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis Labels */}
        <div className="flex items-center justify-between gap-1 sm:gap-3 px-0.5">
          {activeData.map((item, idx) => (
            <div
              key={idx}
              className={`flex-1 text-center text-[10px] font-mono truncate transition-colors ${
                item.isCurrent
                  ? "text-white font-bold"
                  : hoveredItem?.label === item.label
                  ? "text-zinc-200"
                  : "text-zinc-500"
              }`}
            >
              {item.shortLabel}
            </div>
          ))}
        </div>

        {/* Hover / Info Banner */}
        <div className="h-6 flex items-center justify-between text-xs text-zinc-400 pt-1">
          {hoveredItem ? (
            <span className="text-zinc-200">
              <strong className="text-white">{hoveredItem.label}:</strong>{" "}
              {hoveredItem.totalActions} total actions (
              {hoveredItem.sessions} sessions, {hoveredItem.todos} tasks)
            </span>
          ) : (
            <span className="text-zinc-500 text-[11px]">
              Hover over bars to inspect {viewMode.toLowerCase()} productivity
            </span>
          )}

          <span className="text-zinc-500 font-mono text-[10px]">
            Peak: {maxActions} actions
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { ActivityHeatmap, DayActivity } from "./ActivityHeatmap";
import { ProgressChart, PeriodProgressData } from "./ProgressChart";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface ProjectAnalytics {
  id: string;
  name: string;
  sessionsCount: number;
  totalDurationMins: number;
  completedTasksCount: number;
  lastWorked: Date | string | null;
}

export interface RecentSessionData {
  id: string;
  projectId: string;
  projectName: string;
  workedOn: string;
  stoppedAt: string;
  nextAction: string;
  durationMins: number | null;
  createdAt: Date | string;
}

interface AnalyticsPageViewProps {
  days: DayActivity[];
  totalActions: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  totalTasksCompleted: number;
  totalDurationMinutes: number;
  weeklyData: PeriodProgressData[];
  monthlyData: PeriodProgressData[];
  projects: ProjectAnalytics[];
  recentSessions: RecentSessionData[];
}

export function AnalyticsPageView({
  days,
  totalActions,
  currentStreak,
  longestStreak,
  totalSessions,
  totalTasksCompleted,
  totalDurationMinutes,
  weeklyData,
  monthlyData,
  projects,
  recentSessions,
}: AnalyticsPageViewProps) {
  const hours = Math.floor(totalDurationMinutes / 60);
  const minutes = totalDurationMinutes % 60;
  const timeFormatted =
    hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ""}` : `${minutes}m`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Analytics</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Continuity metrics, weekly/monthly charts, and activity heatmap.
          </p>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-1">
          <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider block">
            Sessions Logged
          </span>
          <p className="text-xl font-bold text-white">{totalSessions}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-1">
          <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider block">
            Tasks Completed
          </span>
          <p className="text-xl font-bold text-white">{totalTasksCompleted}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-1">
          <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider block">
            Focus Time
          </span>
          <p className="text-xl font-bold text-white">
            {totalDurationMinutes > 0 ? timeFormatted : "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-1">
          <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider block">
            Active Streak
          </span>
          <p className="text-xl font-bold text-white">
            {currentStreak} {currentStreak === 1 ? "day" : "days"}
          </p>
        </div>
      </div>

      {/* Weekly & Monthly Progress Chart */}
      <ProgressChart weeklyData={weeklyData} monthlyData={monthlyData} />

      {/* Git-like Contribution Heatmap */}
      <ActivityHeatmap
        days={days}
        totalActions={totalActions}
        currentStreak={currentStreak}
        longestStreak={longestStreak}
      />

      {/* 2-Column Split: Projects Summary + Recent Session Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Project Breakdown */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-white">
            Project Continuity
          </h2>

          {projects.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No projects yet.</p>
          ) : (
            <div className="space-y-2">
              {projects.map((proj) => (
                <Link
                  key={proj.id}
                  href={`/projects/${proj.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850 transition-colors group"
                >
                  <div className="space-y-0.5 truncate">
                    <span className="font-medium text-xs text-white group-hover:underline truncate block">
                      {proj.name}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {proj.sessionsCount} {proj.sessionsCount === 1 ? "session" : "sessions"} · {proj.completedTasksCount} tasks
                    </span>
                  </div>

                  <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white transition-colors shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Session Logs */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-white">
            Recent Session Logs
          </h2>

          {recentSessions.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No sessions logged yet.</p>
          ) : (
            <div className="space-y-2.5">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-850 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate">
                      {session.projectName}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {formatRelativeTime(session.createdAt)}
                    </span>
                  </div>

                  {session.stoppedAt && (
                    <p className="text-zinc-400 text-[11px]">
                      <span className="text-zinc-500">Stopped:</span> {session.stoppedAt}
                    </p>
                  )}

                  {session.nextAction && (
                    <p className="text-zinc-200 text-[11px] font-medium">
                      <span className="text-zinc-500">Next:</span> {session.nextAction}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AnalyticsPageView, ProjectAnalytics, RecentSessionData } from "@/features/analytics/components/AnalyticsPageView";
import { DayActivity } from "@/features/analytics/components/ActivityHeatmap";
import { PeriodProgressData } from "@/features/analytics/components/ProgressChart";
import { getTodayDateString } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 1. Fetch user's projects
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: {
      sessions: true,
      todos: {
        where: { status: "COMPLETED" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // 2. Fetch all user's project sessions
  const sessions = await prisma.projectSession.findMany({
    where: {
      project: { userId: user.id },
    },
    include: {
      project: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 3. Fetch all completed todos
  const completedTodos = await prisma.todo.findMany({
    where: {
      userId: user.id,
      status: "COMPLETED",
    },
    orderBy: { updatedAt: "desc" },
  });

  // 4. Compute daily activity map
  const activityMap: Record<string, { sessions: number; todos: number }> = {};

  // Fill in sessions
  sessions.forEach((s) => {
    const d = s.createdAt.toISOString().split("T")[0];
    if (!activityMap[d]) activityMap[d] = { sessions: 0, todos: 0 };
    activityMap[d].sessions += 1;
  });

  // Fill in completed todos
  completedTodos.forEach((t) => {
    const d = t.date;
    if (!activityMap[d]) activityMap[d] = { sessions: 0, todos: 0 };
    activityMap[d].todos += 1;
  });

  // 5. Generate 52-week heatmap array (aligned to start of week)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const daysToShow = 52 * 7 + (dayOfWeek + 1);

  const days: DayActivity[] = [];
  let totalActions = 0;

  const startDate = new Date();
  startDate.setDate(today.getDate() - (daysToShow - 1));

  for (let i = 0; i < daysToShow; i++) {
    const curr = new Date(startDate);
    curr.setDate(startDate.getDate() + i);
    const dateStr = curr.toISOString().split("T")[0];

    const sessionCount = activityMap[dateStr]?.sessions || 0;
    const todoCount = activityMap[dateStr]?.todos || 0;
    const count = sessionCount + todoCount;

    totalActions += count;
    days.push({
      date: dateStr,
      count,
      sessions: sessionCount,
      todos: todoCount,
    });
  }

  // 6. Compute Streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  days.forEach((day) => {
    if (day.count > 0) {
      tempStreak += 1;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  });

  const todayStr = getTodayDateString();
  const todayIndex = days.findIndex((d) => d.date === todayStr);

  if (todayIndex !== -1) {
    let checkIdx = todayIndex;
    if (days[checkIdx].count === 0 && checkIdx > 0 && days[checkIdx - 1].count > 0) {
      checkIdx = checkIdx - 1;
    }

    while (checkIdx >= 0 && days[checkIdx].count > 0) {
      currentStreak += 1;
      checkIdx -= 1;
    }
  }

  // 7. Compute Weekly Progress Data (Past 10 Weeks)
  const weeklyData: PeriodProgressData[] = [];
  for (let w = 9; w >= 0; w--) {
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - w * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    let weekSessions = 0;
    let weekTodos = 0;

    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + d);
      const dateStr = dayDate.toISOString().split("T")[0];

      if (activityMap[dateStr]) {
        weekSessions += activityMap[dateStr].sessions;
        weekTodos += activityMap[dateStr].todos;
      }
    }

    const startMonth = weekStart.toLocaleString("en-US", { month: "short" });
    const endMonth = weekEnd.toLocaleString("en-US", { month: "short" });
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();

    const label =
      w === 0
        ? `This Week (${startMonth} ${startDay} - ${endMonth} ${endDay})`
        : `${startMonth} ${startDay} - ${endMonth} ${endDay}`;

    const shortLabel = w === 0 ? "Now" : `${startMonth} ${startDay}`;

    weeklyData.push({
      label,
      shortLabel,
      totalActions: weekSessions + weekTodos,
      sessions: weekSessions,
      todos: weekTodos,
      isCurrent: w === 0,
    });
  }

  // 8. Compute Monthly Progress Data (Past 6 Months)
  const monthlyData: PeriodProgressData[] = [];
  for (let m = 5; m >= 0; m--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const monthYear = monthDate.getFullYear();
    const monthIndex = monthDate.getMonth();
    const monthStr = String(monthIndex + 1).padStart(2, "0");
    const prefix = `${monthYear}-${monthStr}`;

    let monthSessions = 0;
    let monthTodos = 0;

    Object.keys(activityMap).forEach((dateKey) => {
      if (dateKey.startsWith(prefix)) {
        monthSessions += activityMap[dateKey].sessions;
        monthTodos += activityMap[dateKey].todos;
      }
    });

    const fullMonthName = monthDate.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    const shortMonthName = monthDate.toLocaleString("en-US", { month: "short" });

    monthlyData.push({
      label: m === 0 ? `This Month (${fullMonthName})` : fullMonthName,
      shortLabel: m === 0 ? "This Mo" : shortMonthName,
      totalActions: monthSessions + monthTodos,
      sessions: monthSessions,
      todos: monthTodos,
      isCurrent: m === 0,
    });
  }

  // 9. Compute Total Metrics
  const totalSessions = sessions.length;
  const totalTasksCompleted = completedTodos.length;
  const totalDurationMinutes = sessions.reduce(
    (acc, s) => acc + (s.durationMins || 0),
    0
  );

  // 10. Project breakdown data
  const projectAnalytics: ProjectAnalytics[] = projects.map((p) => ({
    id: p.id,
    name: p.name,
    sessionsCount: p.sessions.length,
    totalDurationMins: p.sessions.reduce(
      (acc, s) => acc + (s.durationMins || 0),
      0
    ),
    completedTasksCount: p.todos.length,
    lastWorked: p.lastWorked,
  }));

  // 11. Recent 5 sessions
  const recentSessions: RecentSessionData[] = sessions.slice(0, 5).map((s) => ({
    id: s.id,
    projectId: s.projectId,
    projectName: s.project.name,
    workedOn: s.workedOn,
    stoppedAt: s.stoppedAt,
    nextAction: s.nextAction,
    durationMins: s.durationMins,
    createdAt: s.createdAt,
  }));

  return (
    <AnalyticsPageView
      days={days}
      totalActions={totalActions}
      currentStreak={currentStreak}
      longestStreak={longestStreak}
      totalSessions={totalSessions}
      totalTasksCompleted={totalTasksCompleted}
      totalDurationMinutes={totalDurationMinutes}
      weeklyData={weeklyData}
      monthlyData={monthlyData}
      projects={projectAnalytics}
      recentSessions={recentSessions}
    />
  );
}

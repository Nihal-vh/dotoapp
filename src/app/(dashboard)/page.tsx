import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getTodayDateString, getTomorrowDateString } from "@/lib/utils";
import { DashboardClientView } from "@/features/dashboard/DashboardClientView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  // 1. Overdue Unfinished Todos
  const overdueTodos = await prisma.todo.findMany({
    where: {
      userId: user.id,
      date: { lt: today },
      status: "PENDING",
    },
    select: {
      id: true,
      title: true,
      date: true,
    },
    orderBy: { date: "asc" },
  });

  // 2. Active Projects for Resume Deck & Quick Switcher
  const activeProjectsRaw = await prisma.project.findMany({
    where: {
      userId: user.id,
      status: { in: ["ACTIVE", "IN_PROGRESS"] },
    },
    include: {
      sessions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { lastWorked: "desc" },
    take: 6,
  });

  const activeProjects = activeProjectsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    startHere: p.startHere,
    lastWorked: p.lastWorked,
    lastSession: p.sessions[0] || null,
  }));

  // 3. Active Learning Item
  const recentLearning = await prisma.learningItem.findFirst({
    where: {
      userId: user.id,
      status: { in: ["IN_PROGRESS", "ACTIVE"] },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      topics: {
        where: { status: { in: ["IN_PROGRESS", "NOT_STARTED"] } },
        orderBy: { position: "asc" },
        take: 1,
        include: {
          resources: {
            where: { status: { in: ["IN_PROGRESS", "NOT_STARTED"] } },
            take: 1,
          },
        },
      },
    },
  });

  let activeLearning = null;
  if (recentLearning && recentLearning.topics.length > 0) {
    const currentTopic = recentLearning.topics[0];
    const currentResource = currentTopic.resources[0];
    activeLearning = {
      id: recentLearning.id,
      title: recentLearning.title,
      currentTopicTitle: currentTopic.title,
      resourceTitle: currentResource ? currentResource.title : "Active Topic",
      resourceType: currentResource ? currentResource.type : "CUSTOM",
      currentProgress: currentResource ? currentResource.currentProgress : null,
      totalDuration: currentResource ? currentResource.totalDuration : null,
      resumePoint: currentResource ? currentResource.resumePoint : currentTopic.notes,
    };
  }

  // 4. Active Reading Item
  const recentReading = await prisma.readingItem.findFirst({
    where: {
      userId: user.id,
      status: { in: ["IN_PROGRESS", "ACTIVE"] },
    },
    orderBy: { lastRead: "desc" },
  });

  const activeReading = recentReading
    ? {
        id: recentReading.id,
        title: recentReading.title,
        currentChapter: recentReading.currentChapter,
        currentPage: recentReading.currentPage,
        totalPages: recentReading.totalPages,
        resumePoint: recentReading.resumePoint,
      }
    : null;

  // 5. Today's Todos
  const todayTodos = await prisma.todo.findMany({
    where: {
      userId: user.id,
      date: today,
    },
    include: {
      project: { select: { id: true, name: true } },
      task: { select: { id: true, title: true } },
      learningItem: { select: { id: true, title: true } },
      resource: { select: { id: true, title: true } },
      readingItem: { select: { id: true, title: true } },
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  // 6. Tomorrow's Todos
  const tomorrowTodos = await prisma.todo.findMany({
    where: {
      userId: user.id,
      date: tomorrow,
    },
    include: {
      project: { select: { id: true, name: true } },
      task: { select: { id: true, title: true } },
      learningItem: { select: { id: true, title: true } },
      resource: { select: { id: true, title: true } },
      readingItem: { select: { id: true, title: true } },
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return (
    <DashboardClientView
      todayDate={today}
      tomorrowDate={tomorrow}
      overdueTodos={overdueTodos}
      todayTodos={todayTodos}
      tomorrowTodos={tomorrowTodos}
      activeProjects={activeProjects}
      activeLearning={activeLearning}
      activeReading={activeReading}
    />
  );
}

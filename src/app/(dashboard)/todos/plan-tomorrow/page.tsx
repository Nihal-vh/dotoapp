import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getTomorrowDateString } from "@/lib/utils";
import { PlanTomorrowWizard } from "@/features/todos/components/PlanTomorrowWizard";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PlanTomorrowPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tomorrow = getTomorrowDateString();

  // 1. Existing Tomorrow Todos
  const existingTomorrowTodos = await prisma.todo.findMany({
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

  // 2. Active Projects with uncompleted tasks & startHere
  const activeProjects = await prisma.project.findMany({
    where: {
      userId: user.id,
      status: { in: ["ACTIVE", "IN_PROGRESS"] },
    },
    include: {
      milestones: {
        where: { status: { in: ["IN_PROGRESS", "NOT_STARTED"] } },
        include: {
          tasks: {
            where: { status: "TODO" },
            take: 4,
          },
        },
      },
    },
    orderBy: { lastWorked: "desc" },
  });

  const projectsFormatted = activeProjects.map((p) => {
    const tasks: { id: string; title: string; milestoneName: string }[] = [];
    p.milestones.forEach((m) => {
      m.tasks.forEach((t) => {
        tasks.push({
          id: t.id,
          title: t.title,
          milestoneName: m.name,
        });
      });
    });
    return {
      id: p.id,
      name: p.name,
      startHere: p.startHere,
      tasks,
    };
  });

  // 3. Active Learning Items with In-Progress Resources
  const activeLearnings = await prisma.learningItem.findMany({
    where: {
      userId: user.id,
      status: { in: ["IN_PROGRESS", "ACTIVE"] },
    },
    include: {
      topics: {
        where: { status: { in: ["IN_PROGRESS", "NOT_STARTED"] } },
        include: {
          resources: {
            where: { status: { in: ["IN_PROGRESS", "NOT_STARTED"] } },
            take: 3,
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const learningsFormatted = activeLearnings.map((l) => {
    const currentTopic = l.topics[0];
    const resources = currentTopic ? currentTopic.resources : [];
    return {
      id: l.id,
      title: l.title,
      currentTopicTitle: currentTopic?.title,
      resources: resources.map((r) => ({
        id: r.id,
        title: r.title,
        resumePoint: r.resumePoint,
      })),
    };
  });

  // 4. Active Readings
  const activeReadings = await prisma.readingItem.findMany({
    where: {
      userId: user.id,
      status: { in: ["IN_PROGRESS", "ACTIVE"] },
    },
    orderBy: { lastRead: "desc" },
    take: 4,
  });

  const readingsFormatted = activeReadings.map((r) => ({
    id: r.id,
    title: r.title,
    currentChapter: r.currentChapter,
    resumePoint: r.resumePoint,
  }));

  return (
    <PlanTomorrowWizard
      tomorrowDate={tomorrow}
      existingTomorrowTodos={existingTomorrowTodos}
      projects={projectsFormatted}
      learnings={learningsFormatted}
      readings={readingsFormatted}
    />
  );
}

"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  startHere: z.string().optional(),
});

const LogSessionSchema = z.object({
  projectId: z.string(),
  workedOn: z.string().min(1, "What did you work on is required"),
  completed: z.string().min(1, "What did you complete is required"),
  stoppedAt: z.string().min(1, "Where did you stop is required"),
  nextAction: z.string().min(1, "What is the NEXT EXACT ACTION is required"),
  durationMins: z.number().optional(),
});

export async function createProjectAction(data: z.infer<typeof CreateProjectSchema>) {
  const user = await requireUser();
  const parsed = CreateProjectSchema.parse(data);

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: parsed.name,
      description: parsed.description || null,
      startHere: parsed.startHere || null,
      lastWorked: new Date(),
      milestones: {
        create: [
          {
            name: "Initial Setup",
            description: "Foundation and core architecture",
            status: "IN_PROGRESS",
            position: 1,
          },
        ],
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  return project;
}

export async function updateProjectStatusAction(projectId: string, status: string) {
  const user = await requireUser();

  await prisma.project.update({
    where: { id: projectId, userId: user.id },
    data: { status },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

export async function logProjectSessionAction(data: z.infer<typeof LogSessionSchema>) {
  const user = await requireUser();
  const parsed = LogSessionSchema.parse(data);

  // 1. Verify project ownership
  const project = await prisma.project.findUnique({
    where: { id: parsed.projectId, userId: user.id },
  });

  if (!project) throw new Error("Project not found");

  // 2. Create the session entry
  const session = await prisma.projectSession.create({
    data: {
      projectId: parsed.projectId,
      workedOn: parsed.workedOn,
      completed: parsed.completed,
      stoppedAt: parsed.stoppedAt,
      nextAction: parsed.nextAction,
      durationMins: parsed.durationMins || null,
    },
  });

  // 3. Automatically update the project's START HERE and lastWorked timestamp
  await prisma.project.update({
    where: { id: parsed.projectId },
    data: {
      startHere: parsed.nextAction,
      lastWorked: new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${parsed.projectId}`);
  return session;
}

export async function createMilestoneAction(projectId: string, name: string, description?: string) {
  const user = await requireUser();

  // Get current max position
  const lastMilestone = await prisma.milestone.findFirst({
    where: { projectId, project: { userId: user.id } },
    orderBy: { position: "desc" },
  });

  const milestone = await prisma.milestone.create({
    data: {
      projectId,
      name,
      description: description || null,
      position: (lastMilestone?.position ?? 0) + 1,
      status: "NOT_STARTED",
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return milestone;
}

export async function updateMilestoneStatusAction(milestoneId: string, projectId: string, status: string) {
  const user = await requireUser();

  await prisma.milestone.update({
    where: { id: milestoneId, project: { userId: user.id } },
    data: { status },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function createTaskAction(milestoneId: string, projectId: string, title: string, priority = "MEDIUM") {
  const user = await requireUser();

  const lastTask = await prisma.task.findFirst({
    where: { milestoneId, milestone: { project: { userId: user.id } } },
    orderBy: { position: "desc" },
  });

  const task = await prisma.task.create({
    data: {
      milestoneId,
      title,
      priority,
      status: "TODO",
      position: (lastTask?.position ?? 0) + 1,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return task;
}

export async function toggleTaskStatusAction(taskId: string, projectId: string, currentStatus: string) {
  const user = await requireUser();
  const nextStatus = currentStatus === "COMPLETED" ? "TODO" : "COMPLETED";

  await prisma.task.update({
    where: { id: taskId, milestone: { project: { userId: user.id } } },
    data: { status: nextStatus },
  });

  // Also update linked todos if any
  await prisma.todo.updateMany({
    where: { projectTaskId: taskId, userId: user.id },
    data: { status: nextStatus === "COMPLETED" ? "COMPLETED" : "PENDING" },
  });

  revalidatePath("/");
  revalidatePath("/todos");
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteProjectAction(projectId: string) {
  const user = await requireUser();

  await prisma.project.delete({
    where: { id: projectId, userId: user.id },
  });

  revalidatePath("/");
  revalidatePath("/projects");
}

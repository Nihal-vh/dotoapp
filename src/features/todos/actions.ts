"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getTodayDateString } from "@/lib/utils";

const CreateTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().default(getTodayDateString()),
  priority: z.string().default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  remindAt: z.string().optional().nullable(),
  isGlobal: z.boolean().optional().default(false),
  projectId: z.string().optional(),
  projectTaskId: z.string().optional(),
  learningItemId: z.string().optional(),
  resourceId: z.string().optional(),
  readingItemId: z.string().optional(),
});

export type CreateTodoInput = {
  title: string;
  description?: string;
  date?: string;
  priority?: string;
  dueDate?: string | null;
  remindAt?: string | null;
  isGlobal?: boolean;
  projectId?: string;
  projectTaskId?: string;
  learningItemId?: string;
  resourceId?: string;
  readingItemId?: string;
};

export async function createTodoAction(data: CreateTodoInput) {
  const user = await requireUser();
  const parsed = CreateTodoSchema.parse(data);

  // Position
  const lastTodo = await prisma.todo.findFirst({
    where: { userId: user.id, date: parsed.date },
    orderBy: { position: "desc" },
  });

  const dueDateVal = parsed.dueDate ? new Date(parsed.dueDate) : null;
  const remindAtVal = parsed.remindAt ? new Date(parsed.remindAt) : null;

  const todo = await prisma.todo.create({
    data: {
      userId: user.id,
      title: parsed.title,
      description: parsed.description || null,
      date: parsed.date,
      priority: parsed.priority,
      status: "PENDING",
      dueDate: dueDateVal,
      remindAt: remindAtVal,
      isGlobal: parsed.isGlobal,
      position: (lastTodo?.position ?? 0) + 1,
      projectId: parsed.projectId || null,
      projectTaskId: parsed.projectTaskId || null,
      learningItemId: parsed.learningItemId || null,
      resourceId: parsed.resourceId || null,
      readingItemId: parsed.readingItemId || null,
    },
  });

  // If a reminder alarm time was specified, also create a Reminder entry
  if (remindAtVal) {
    await prisma.reminder.create({
      data: {
        userId: user.id,
        title: parsed.title,
        description: parsed.description || null,
        remindAt: remindAtVal,
        dueDate: dueDateVal,
        priority: parsed.priority,
        status: "PENDING",
        todoId: todo.id,
        projectId: parsed.projectId || null,
        projectTaskId: parsed.projectTaskId || null,
        learningItemId: parsed.learningItemId || null,
        readingItemId: parsed.readingItemId || null,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/todos");
  revalidatePath("/todos/plan-tomorrow");
  return todo;
}

export async function toggleTodoStatusAction(id: string, currentStatus: string) {
  const user = await requireUser();
  const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";

  const todo = await prisma.todo.update({
    where: { id, userId: user.id },
    data: { status: nextStatus },
  });

  // If this todo is linked to a project task, sync its status
  if (todo.projectTaskId) {
    await prisma.task.update({
      where: { id: todo.projectTaskId },
      data: { status: nextStatus === "COMPLETED" ? "COMPLETED" : "TODO" },
    });
  }

  // If this todo is linked to any Reminders, sync status
  await prisma.reminder.updateMany({
    where: { todoId: todo.id, userId: user.id },
    data: { status: nextStatus === "COMPLETED" ? "COMPLETED" : "PENDING" },
  });

  revalidatePath("/");
  revalidatePath("/todos");
}

export async function updateTodoPriorityAction(id: string, priority: string) {
  const user = await requireUser();

  await prisma.todo.update({
    where: { id, userId: user.id },
    data: { priority },
  });

  revalidatePath("/");
  revalidatePath("/todos");
}

export async function carryForwardTodosAction(todoIds: string[], targetDate?: string) {
  const user = await requireUser();
  const date = targetDate || getTodayDateString();

  await prisma.todo.updateMany({
    where: {
      id: { in: todoIds },
      userId: user.id,
    },
    data: {
      date,
      status: "PENDING",
    },
  });

  revalidatePath("/");
  revalidatePath("/todos");
}

export async function skipTodosAction(todoIds: string[]) {
  const user = await requireUser();

  await prisma.todo.updateMany({
    where: {
      id: { in: todoIds },
      userId: user.id,
    },
    data: {
      status: "SKIPPED",
    },
  });

  revalidatePath("/");
  revalidatePath("/todos");
}

export async function deleteTodoAction(id: string) {
  const user = await requireUser();

  // Delete attached reminders first
  await prisma.reminder.deleteMany({
    where: { todoId: id, userId: user.id },
  });

  await prisma.todo.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/");
  revalidatePath("/todos");
}


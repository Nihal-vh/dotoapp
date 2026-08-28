"use server";

import { prisma } from "@/lib/db";
import { requireUser, getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendPushNotificationToUser } from "@/lib/notifications/push";

const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  userAgent: z.string().optional(),
});

export async function savePushSubscriptionAction(data: z.infer<typeof PushSubscriptionSchema>) {
  const user = await requireUser();
  const parsed = PushSubscriptionSchema.parse(data);

  const sub = await prisma.pushSubscription.upsert({
    where: { endpoint: parsed.endpoint },
    create: {
      userId: user.id,
      endpoint: parsed.endpoint,
      p256dh: parsed.p256dh,
      auth: parsed.auth,
      userAgent: parsed.userAgent || null,
    },
    update: {
      userId: user.id,
      p256dh: parsed.p256dh,
      auth: parsed.auth,
      userAgent: parsed.userAgent || null,
      updatedAt: new Date(),
    },
  });

  return { success: true, id: sub.id };
}

export async function removePushSubscriptionAction(endpoint: string) {
  const user = await requireUser();
  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: user.id },
  });
  return { success: true };
}

const CreateReminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  remindAt: z.string().or(z.date()), // ISO string or Date
  dueDate: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  todoId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  projectTaskId: z.string().optional().nullable(),
  learningItemId: z.string().optional().nullable(),
  readingItemId: z.string().optional().nullable(),
  createAsGlobalTodo: z.boolean().optional(),
});

export async function createReminderAction(data: z.infer<typeof CreateReminderSchema>) {
  const user = await requireUser();
  const parsed = CreateReminderSchema.parse(data);

  const remindAtDate = new Date(parsed.remindAt);
  const dueDateVal = parsed.dueDate ? new Date(parsed.dueDate) : null;

  let linkedTodoId = parsed.todoId;

  // If user wants to also create this as a Global/Backlog Todo with expiry
  if (parsed.createAsGlobalTodo && !linkedTodoId) {
    const newTodo = await prisma.todo.create({
      data: {
        userId: user.id,
        title: parsed.title,
        description: parsed.description || null,
        date: "BACKLOG",
        isGlobal: true,
        priority: parsed.priority,
        dueDate: dueDateVal,
        remindAt: remindAtDate,
        projectId: parsed.projectId || null,
        projectTaskId: parsed.projectTaskId || null,
        learningItemId: parsed.learningItemId || null,
        readingItemId: parsed.readingItemId || null,
      },
    });
    linkedTodoId = newTodo.id;
  }

  const reminder = await prisma.reminder.create({
    data: {
      userId: user.id,
      title: parsed.title,
      description: parsed.description || null,
      remindAt: remindAtDate,
      dueDate: dueDateVal,
      priority: parsed.priority,
      status: "PENDING",
      isPushSent: false,
      todoId: linkedTodoId || null,
      projectId: parsed.projectId || null,
      projectTaskId: parsed.projectTaskId || null,
      learningItemId: parsed.learningItemId || null,
      readingItemId: parsed.readingItemId || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/todos");
  return reminder;
}

export async function toggleReminderStatusAction(id: string, currentStatus: string) {
  const user = await requireUser();
  const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";

  const reminder = await prisma.reminder.update({
    where: { id, userId: user.id },
    data: { status: nextStatus },
  });

  // Sync with linked todo if present
  if (reminder.todoId) {
    await prisma.todo.update({
      where: { id: reminder.todoId, userId: user.id },
      data: { status: nextStatus === "COMPLETED" ? "COMPLETED" : "PENDING" },
    });
  }

  revalidatePath("/");
  revalidatePath("/todos");
}

export async function snoozeReminderAction(id: string, minutes: number = 15) {
  const user = await requireUser();
  const newRemindAt = new Date(Date.now() + minutes * 60 * 1000);

  await prisma.reminder.update({
    where: { id, userId: user.id },
    data: {
      remindAt: newRemindAt,
      status: "SNOOZED",
      isPushSent: false,
    },
  });

  revalidatePath("/");
  revalidatePath("/todos");
}

export async function deleteReminderAction(id: string) {
  const user = await requireUser();
  await prisma.reminder.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/");
  revalidatePath("/todos");
}

export async function testPushNotificationAction() {
  const user = await requireUser();
  const res = await sendPushNotificationToUser(user.id, {
    title: "⚡ DOTO Web Push Working!",
    body: "Your device is successfully linked to DOTO for real-time task reminder alarms.",
    url: "/todos",
  });
  return res;
}

export async function checkAndTriggerDueRemindersAction() {
  const user = await getCurrentUser();
  if (!user) {
    return { triggered: 0 };
  }
  const now = new Date();

  // Find due pending or snoozed reminders that haven't sent push
  const dueReminders = await prisma.reminder.findMany({
    where: {
      userId: user.id,
      status: { in: ["PENDING", "SNOOZED"] },
      remindAt: { lte: now },
      isPushSent: false,
    },
  });

  if (dueReminders.length === 0) {
    return { triggered: 0 };
  }

  let triggeredCount = 0;
  for (const rem of dueReminders) {
    await sendPushNotificationToUser(user.id, {
      title: `⏰ Task Reminder: ${rem.title}`,
      body: rem.description || "Scheduled reminder for your DOTO task",
      url: `/todos?highlight=${rem.todoId || rem.id}`,
      id: rem.id,
    });

    await prisma.reminder.update({
      where: { id: rem.id },
      data: { isPushSent: true },
    });

    triggeredCount++;
  }

  revalidatePath("/todos");
  return { triggered: triggeredCount };
}

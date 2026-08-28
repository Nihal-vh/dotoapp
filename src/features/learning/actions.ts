"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateLearningSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

const CreateTopicSchema = z.object({
  learningItemId: z.string(),
  title: z.string().min(1, "Topic title is required"),
  description: z.string().optional(),
  notes: z.string().optional(),
});

const CreateResourceSchema = z.object({
  topicId: z.string(),
  title: z.string().min(1, "Title is required"),
  url: z.string().optional(),
  type: z.string().default("ARTICLE"),
  currentProgress: z.string().optional(),
  totalDuration: z.string().optional(),
  resumePoint: z.string().optional(),
  notes: z.string().optional(),
});

const UpdateResourceProgressSchema = z.object({
  resourceId: z.string(),
  currentProgress: z.string(),
  totalDuration: z.string().optional(),
  resumePoint: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
});

export async function createLearningItemAction(data: z.infer<typeof CreateLearningSchema>) {
  const user = await requireUser();
  const parsed = CreateLearningSchema.parse(data);

  const item = await prisma.learningItem.create({
    data: {
      userId: user.id,
      title: parsed.title,
      description: parsed.description || null,
      status: "IN_PROGRESS",
      topics: {
        create: [
          {
            title: "Core Fundamentals",
            description: "Introduction and high-level concepts",
            status: "IN_PROGRESS",
            position: 1,
          },
        ],
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/learning");
  return item;
}

export async function createLearningTopicAction(data: z.infer<typeof CreateTopicSchema>) {
  const user = await requireUser();
  const parsed = CreateTopicSchema.parse(data);

  const lastTopic = await prisma.learningTopic.findFirst({
    where: { learningItemId: parsed.learningItemId, learningItem: { userId: user.id } },
    orderBy: { position: "desc" },
  });

  const topic = await prisma.learningTopic.create({
    data: {
      learningItemId: parsed.learningItemId,
      title: parsed.title,
      description: parsed.description || null,
      notes: parsed.notes || null,
      position: (lastTopic?.position ?? 0) + 1,
      status: "NOT_STARTED",
    },
  });

  revalidatePath(`/learning/${parsed.learningItemId}`);
  return topic;
}

export async function updateTopicStatusAction(topicId: string, learningItemId: string, status: string) {
  const user = await requireUser();

  await prisma.learningTopic.update({
    where: { id: topicId, learningItem: { userId: user.id } },
    data: { status },
  });

  revalidatePath("/");
  revalidatePath("/learning");
  revalidatePath(`/learning/${learningItemId}`);
}

export async function createLearningResourceAction(data: z.infer<typeof CreateResourceSchema>) {
  const user = await requireUser();
  const parsed = CreateResourceSchema.parse(data);

  // verify ownership
  const topic = await prisma.learningTopic.findUnique({
    where: { id: parsed.topicId, learningItem: { userId: user.id } },
  });

  if (!topic) throw new Error("Topic not found");

  const resource = await prisma.learningResource.create({
    data: {
      topicId: parsed.topicId,
      title: parsed.title,
      url: parsed.url || null,
      type: parsed.type,
      currentProgress: parsed.currentProgress || null,
      totalDuration: parsed.totalDuration || null,
      resumePoint: parsed.resumePoint || null,
      notes: parsed.notes || null,
      status: "IN_PROGRESS",
    },
  });

  revalidatePath("/");
  revalidatePath("/learning");
  revalidatePath(`/learning/${topic.learningItemId}`);
  return resource;
}

export async function updateResourceProgressAction(data: z.infer<typeof UpdateResourceProgressSchema>) {
  const user = await requireUser();
  const parsed = UpdateResourceProgressSchema.parse(data);

  const resource = await prisma.learningResource.findUnique({
    where: { id: parsed.resourceId, topic: { learningItem: { userId: user.id } } },
    include: { topic: true },
  });

  if (!resource) throw new Error("Resource not found");

  const updated = await prisma.learningResource.update({
    where: { id: parsed.resourceId },
    data: {
      currentProgress: parsed.currentProgress,
      totalDuration: parsed.totalDuration || resource.totalDuration,
      resumePoint: parsed.resumePoint || resource.resumePoint,
      notes: parsed.notes ?? resource.notes,
      status: parsed.status || resource.status,
    },
  });

  // Also update parent learning item's updatedAt
  await prisma.learningItem.update({
    where: { id: resource.topic.learningItemId },
    data: { updatedAt: new Date() },
  });

  revalidatePath("/");
  revalidatePath("/learning");
  revalidatePath(`/learning/${resource.topic.learningItemId}`);
  return updated;
}

export async function deleteLearningItemAction(id: string) {
  const user = await requireUser();

  await prisma.learningItem.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/");
  revalidatePath("/learning");
}

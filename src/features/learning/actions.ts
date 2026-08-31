"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateLearningSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

const UpdateLearningSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
});

const CreateTopicSchema = z.object({
  learningItemId: z.string(),
  title: z.string().min(1, "Topic title is required"),
  description: z.string().optional(),
  notes: z.string().optional(),
});

const UpdateTopicSchema = z.object({
  id: z.string(),
  learningItemId: z.string(),
  title: z.string().min(1, "Topic title is required"),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.string().optional(),
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

const UpdateResourceSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  type: z.string().default("ARTICLE"),
  url: z.string().optional().nullable(),
  currentProgress: z.string().optional().nullable(),
  totalDuration: z.string().optional().nullable(),
  resumePoint: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.string().optional(),
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

export async function updateLearningItemAction(data: z.infer<typeof UpdateLearningSchema>) {
  const user = await requireUser();
  const parsed = UpdateLearningSchema.parse(data);

  const existing = await prisma.learningItem.findUnique({
    where: { id: parsed.id, userId: user.id },
  });

  if (!existing) throw new Error("Learning roadmap not found");

  const item = await prisma.learningItem.update({
    where: { id: parsed.id },
    data: {
      title: parsed.title,
      description: parsed.description !== undefined ? parsed.description : existing.description,
      status: parsed.status || existing.status,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath("/learning");
  revalidatePath(`/learning/${parsed.id}`);
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

export async function updateLearningTopicAction(data: z.infer<typeof UpdateTopicSchema>) {
  const user = await requireUser();
  const parsed = UpdateTopicSchema.parse(data);

  const existing = await prisma.learningTopic.findUnique({
    where: { id: parsed.id, learningItem: { userId: user.id } },
  });

  if (!existing) throw new Error("Topic not found");

  const topic = await prisma.learningTopic.update({
    where: { id: parsed.id },
    data: {
      title: parsed.title,
      description: parsed.description !== undefined ? parsed.description : existing.description,
      notes: parsed.notes !== undefined ? parsed.notes : existing.notes,
      status: parsed.status || existing.status,
    },
  });

  await prisma.learningItem.update({
    where: { id: parsed.learningItemId },
    data: { updatedAt: new Date() },
  });

  revalidatePath("/");
  revalidatePath("/learning");
  revalidatePath(`/learning/${parsed.learningItemId}`);
  return topic;
}

export async function deleteLearningTopicAction(topicId: string, learningItemId: string) {
  const user = await requireUser();

  const existing = await prisma.learningTopic.findUnique({
    where: { id: topicId, learningItem: { userId: user.id } },
  });

  if (!existing) throw new Error("Topic not found");

  await prisma.learningTopic.delete({
    where: { id: topicId },
  });

  await prisma.learningItem.update({
    where: { id: learningItemId },
    data: { updatedAt: new Date() },
  });

  revalidatePath("/");
  revalidatePath("/learning");
  revalidatePath(`/learning/${learningItemId}`);
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

  await prisma.learningItem.update({
    where: { id: topic.learningItemId },
    data: { updatedAt: new Date() },
  });

  revalidatePath("/");
  revalidatePath("/learning");
  revalidatePath(`/learning/${topic.learningItemId}`);
  return resource;
}

export async function updateLearningResourceAction(data: z.infer<typeof UpdateResourceSchema>) {
  const user = await requireUser();
  const parsed = UpdateResourceSchema.parse(data);

  const resource = await prisma.learningResource.findUnique({
    where: { id: parsed.id, topic: { learningItem: { userId: user.id } } },
    include: { topic: true },
  });

  if (!resource) throw new Error("Resource not found");

  const updated = await prisma.learningResource.update({
    where: { id: parsed.id },
    data: {
      title: parsed.title,
      type: parsed.type,
      url: parsed.url !== undefined ? parsed.url : resource.url,
      currentProgress: parsed.currentProgress !== undefined ? parsed.currentProgress : resource.currentProgress,
      totalDuration: parsed.totalDuration !== undefined ? parsed.totalDuration : resource.totalDuration,
      resumePoint: parsed.resumePoint !== undefined ? parsed.resumePoint : resource.resumePoint,
      notes: parsed.notes !== undefined ? parsed.notes : resource.notes,
      status: parsed.status || resource.status,
    },
  });

  await prisma.learningItem.update({
    where: { id: resource.topic.learningItemId },
    data: { updatedAt: new Date() },
  });

  revalidatePath("/");
  revalidatePath("/learning");
  revalidatePath(`/learning/${resource.topic.learningItemId}`);
  return updated;
}

export async function deleteLearningResourceAction(resourceId: string) {
  const user = await requireUser();

  const resource = await prisma.learningResource.findUnique({
    where: { id: resourceId, topic: { learningItem: { userId: user.id } } },
    include: { topic: true },
  });

  if (!resource) throw new Error("Resource not found");

  await prisma.learningResource.delete({
    where: { id: resourceId },
  });

  await prisma.learningItem.update({
    where: { id: resource.topic.learningItemId },
    data: { updatedAt: new Date() },
  });

  revalidatePath("/");
  revalidatePath("/learning");
  revalidatePath(`/learning/${resource.topic.learningItemId}`);
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

"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateReadingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().optional(),
  type: z.string().default("BOOK"),
  url: z.string().optional(),
  totalPages: z.number().optional(),
  currentPage: z.number().optional(),
  currentChapter: z.string().optional(),
  resumePoint: z.string().optional(),
});

const UpdateReadingProgressSchema = z.object({
  id: z.string(),
  currentPage: z.number().optional(),
  totalPages: z.number().optional(),
  currentChapter: z.string().optional(),
  resumePoint: z.string().optional(),
  progressNotes: z.string().optional(),
  status: z.string().optional(),
});

export async function createReadingItemAction(data: z.infer<typeof CreateReadingSchema>) {
  const user = await requireUser();
  const parsed = CreateReadingSchema.parse(data);

  const item = await prisma.readingItem.create({
    data: {
      userId: user.id,
      title: parsed.title,
      author: parsed.author || null,
      type: parsed.type,
      url: parsed.url || null,
      totalPages: parsed.totalPages || null,
      currentPage: parsed.currentPage || 0,
      currentChapter: parsed.currentChapter || null,
      resumePoint: parsed.resumePoint || null,
      status: "IN_PROGRESS",
      lastRead: new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath("/readings");
  return item;
}

export async function updateReadingProgressAction(data: z.infer<typeof UpdateReadingProgressSchema>) {
  const user = await requireUser();
  const parsed = UpdateReadingProgressSchema.parse(data);

  const item = await prisma.readingItem.findUnique({
    where: { id: parsed.id, userId: user.id },
  });

  if (!item) throw new Error("Reading item not found");

  const updated = await prisma.readingItem.update({
    where: { id: parsed.id },
    data: {
      currentPage: parsed.currentPage !== undefined ? parsed.currentPage : item.currentPage,
      totalPages: parsed.totalPages !== undefined ? parsed.totalPages : item.totalPages,
      currentChapter: parsed.currentChapter ?? item.currentChapter,
      resumePoint: parsed.resumePoint ?? item.resumePoint,
      progressNotes: parsed.progressNotes ?? item.progressNotes,
      status: parsed.status || item.status,
      lastRead: new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath("/readings");
  return updated;
}

export async function deleteReadingItemAction(id: string) {
  const user = await requireUser();

  await prisma.readingItem.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/");
  revalidatePath("/readings");
}

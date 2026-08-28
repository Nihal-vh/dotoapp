import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { LearningPageView } from "@/features/learning/components/LearningPageView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LearningPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const rawLearnings = await prisma.learningItem.findMany({
    where: { userId: user.id },
    include: {
      topics: {
        orderBy: { position: "asc" },
        include: {
          resources: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const learnings = rawLearnings.map((item) => {
    const totalTopics = item.topics.length;
    const completedTopics = item.topics.filter((t) => t.status === "COMPLETED").length;
    const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const currentTopic = item.topics.find((t) => t.status === "IN_PROGRESS") || item.topics[0] || null;
    const activeResource = currentTopic?.resources.find((r) => r.status === "IN_PROGRESS") || currentTopic?.resources[0] || null;

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      updatedAt: item.updatedAt,
      totalTopics,
      completedTopics,
      progressPercent,
      currentTopic: currentTopic
        ? {
            id: currentTopic.id,
            title: currentTopic.title,
            status: currentTopic.status,
            activeResource: activeResource
              ? {
                  id: activeResource.id,
                  title: activeResource.title,
                  type: activeResource.type,
                  currentProgress: activeResource.currentProgress,
                  totalDuration: activeResource.totalDuration,
                  resumePoint: activeResource.resumePoint,
                }
              : null,
          }
        : null,
    };
  });

  return <LearningPageView learnings={learnings} />;
}

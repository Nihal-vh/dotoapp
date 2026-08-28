import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { LearningDetailView } from "@/features/learning/components/LearningDetailView";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface LearningPageProps {
  params: Promise<{ id: string }>;
}

export default async function LearningDetailPage({ params }: LearningPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const learning = await prisma.learningItem.findUnique({
    where: { id, userId: user.id },
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
  });

  if (!learning) {
    notFound();
  }

  return <LearningDetailView learning={learning} />;
}

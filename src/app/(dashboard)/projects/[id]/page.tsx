import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ProjectDetailView } from "@/features/projects/components/ProjectDetailView";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id, userId: user.id },
    include: {
      milestones: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
          },
        },
      },
      sessions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return <ProjectDetailView project={project} />;
}

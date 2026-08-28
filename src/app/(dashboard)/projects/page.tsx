import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ProjectsPageView } from "@/features/projects/components/ProjectsPageView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const rawProjects = await prisma.project.findMany({
    where: { userId: user.id },
    include: {
      milestones: {
        where: { status: "IN_PROGRESS" },
        take: 1,
      },
    },
    orderBy: { lastWorked: "desc" },
  });

  const projects = rawProjects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    startHere: p.startHere,
    lastWorked: p.lastWorked,
    currentMilestone: p.milestones[0]
      ? {
          id: p.milestones[0].id,
          name: p.milestones[0].name,
          status: p.milestones[0].status,
        }
      : null,
  }));

  return <ProjectsPageView projects={projects} />;
}

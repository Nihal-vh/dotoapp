import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ReadingsPageView } from "@/features/readings/components/ReadingsPageView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReadingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const readings = await prisma.readingItem.findMany({
    where: { userId: user.id },
    orderBy: { lastRead: "desc" },
  });

  return <ReadingsPageView readings={readings} />;
}

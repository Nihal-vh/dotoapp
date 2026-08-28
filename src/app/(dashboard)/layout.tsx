import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getTodayDateString } from "@/lib/utils";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const today = getTodayDateString();
  const pendingTodosCount = await prisma.todo.count({
    where: {
      userId: user.id,
      date: today,
      status: "PENDING",
    },
  });

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Desktop Left Sidebar */}
      <DesktopSidebar
        userEmail={user.email}
        userName={user.name}
        pendingTodosCount={pendingTodosCount}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 pb-20 md:pb-8">
        <AppHeader userEmail={user.email} userName={user.name} />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav pendingTodosCount={pendingTodosCount} />
    </div>
  );
}

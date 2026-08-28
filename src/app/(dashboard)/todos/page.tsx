import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getTodayDateString, getTomorrowDateString, getOffsetDateString } from "@/lib/utils";
import { TodosPageView } from "@/features/todos/components/TodosPageView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TodosPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const today = getTodayDateString();

  // Fetch all user todos
  const allTodos = await prisma.todo.findMany({
    where: { userId: user.id },
    include: {
      project: { select: { id: true, name: true } },
      task: { select: { id: true, title: true } },
      learningItem: { select: { id: true, title: true } },
      resource: { select: { id: true, title: true } },
      readingItem: { select: { id: true, title: true } },
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  const todosByDate: Record<string, typeof allTodos> = {};
  const globalTodos: typeof allTodos = [];

  allTodos.forEach((t) => {
    if (t.isGlobal || t.date === "BACKLOG") {
      globalTodos.push(t);
    } else {
      if (!todosByDate[t.date]) todosByDate[t.date] = [];
      todosByDate[t.date].push(t);
    }
  });

  // Overdue
  const overdueTodos = allTodos
    .filter((t) => !t.isGlobal && t.date !== "BACKLOG" && t.date < today && t.status === "PENDING")
    .map((t) => ({ id: t.id, title: t.title, date: t.date }));

  return (
    <TodosPageView
      initialDate={today}
      todosByDate={todosByDate}
      globalTodos={globalTodos}
      overdueTodos={overdueTodos}
    />
  );
}

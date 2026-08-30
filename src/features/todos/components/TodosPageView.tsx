"use client";

import React, { useState } from "react";
import { DateNavigator } from "./DateNavigator";
import { DailyTodoList } from "./DailyTodoList";
import { CarryForwardBanner } from "./CarryForwardBanner";
import { TodoItemData } from "./TodoItem";
import Link from "next/link";

interface TodosPageViewProps {
  initialDate: string;
  todosByDate: Record<string, TodoItemData[]>;
  overdueTodos: { id: string; title: string; date: string }[];
}

export function TodosPageView({
  initialDate,
  todosByDate,
  overdueTodos,
}: TodosPageViewProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const currentTodos = todosByDate[selectedDate] || [];

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Daily Tasks</h1>
        <Link
          href="/todos/plan-tomorrow"
          className="text-xs text-zinc-400 hover:text-white transition-colors"
        >
          Plan Tomorrow &rarr;
        </Link>
      </div>

      {/* Overdue Tasks Banner */}
      <CarryForwardBanner overdueTodos={overdueTodos} />

      {/* Date Navigator */}
      <DateNavigator
        currentDate={selectedDate}
        onSelectDate={(newDate) => setSelectedDate(newDate)}
      />

      {/* Daily Todos List */}
      <div className="pt-2">
        <DailyTodoList date={selectedDate} todos={currentTodos} />
      </div>
    </div>
  );
}

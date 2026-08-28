"use client";

import React from "react";
import { TodoItem, TodoItemData } from "./TodoItem";
import { CreateTodoInline } from "./CreateTodoInline";
import { CheckCircle2, ListTodo } from "lucide-react";

interface DailyTodoListProps {
  date: string;
  todos: TodoItemData[];
}

export function DailyTodoList({ date, todos }: DailyTodoListProps) {
  const pendingTodos = todos.filter((t) => t.status !== "COMPLETED");
  const completedTodos = todos.filter((t) => t.status === "COMPLETED");

  return (
    <div className="space-y-4">
      {/* Create Inline */}
      <CreateTodoInline date={date} />

      {/* Todo List */}
      {todos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/30">
          <ListTodo className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
          <h4 className="text-xs font-semibold text-zinc-300">No tasks scheduled for this day</h4>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Add a quick task above or plan tomorrow from active projects & roadmaps.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pending Tasks */}
          {pendingTodos.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-zinc-400 block px-1">
                To Do ({pendingTodos.length})
              </span>
              <div className="space-y-2">
                {pendingTodos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTodos.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5 px-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" />
                <span>Completed ({completedTodos.length})</span>
              </span>
              <div className="space-y-2">
                {completedTodos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

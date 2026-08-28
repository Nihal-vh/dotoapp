"use client";

import React, { useState } from "react";
import { DateNavigator } from "./DateNavigator";
import { DailyTodoList } from "./DailyTodoList";
import { CarryForwardBanner } from "./CarryForwardBanner";
import { TodoItem, TodoItemData } from "./TodoItem";
import { CreateReminderModal } from "@/features/reminders/components/CreateReminderModal";
import Link from "next/link";
import {
  Calendar,
  Layers,
  Bell,
  Plus,
  Sparkles,
  Download,
  Send,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePwa } from "@/components/pwa/PwaProvider";

interface TodosPageViewProps {
  initialDate: string;
  todosByDate: Record<string, TodoItemData[]>;
  globalTodos: TodoItemData[];
  overdueTodos: { id: string; title: string; date: string }[];
  highlightId?: string;
}

export function TodosPageView({
  initialDate,
  todosByDate,
  globalTodos,
  overdueTodos,
  highlightId,
}: TodosPageViewProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [activeTab, setActiveTab] = useState<"DAILY" | "GLOBAL" | "ALARMS">("DAILY");
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isTestSending, setIsTestSending] = useState(false);

  const {
    notificationPermission,
    requestPushPermission,
    sendTestPush,
    isInstallable,
    installApp,
  } = usePwa();

  const currentTodos = todosByDate[selectedDate] || [];

  // All todos across dates + global that have active alarms
  const allTodosList = Object.values(todosByDate).flat().concat(globalTodos);
  const todosWithAlarms = allTodosList.filter(
    (t) => t.remindAt && t.status !== "COMPLETED"
  );

  const handleTestNotification = async () => {
    setIsTestSending(true);
    try {
      await sendTestPush();
    } finally {
      setIsTestSending(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Tasks & Reminders</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage daily focus, ongoing tasks, deadlines, and push alarm reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsReminderModalOpen(true)}
            variant="default"
            size="sm"
            className="text-xs shrink-0"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Task
          </Button>

          <Link
            href="/todos/plan-tomorrow"
            className="text-xs text-zinc-400 hover:text-white transition-colors ml-1 hidden sm:inline"
          >
            Plan Tomorrow &rarr;
          </Link>
        </div>
      </div>

      {/* Push Notification Bar */}
      {notificationPermission !== "granted" ? (
        <section className="rounded-xl border border-amber-900/40 bg-amber-950/10 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Bell className="h-4 w-4 text-amber-400 shrink-0" />
            <div className="text-xs text-zinc-300 truncate">
              <span className="font-medium text-white">Enable Push Alarms:</span> Receive task reminder notifications on this device.
            </div>
          </div>
          <Button
            onClick={requestPushPermission}
            size="sm"
            variant="default"
            className="text-xs shrink-0 py-1 h-8"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Enable
          </Button>
        </section>
      ) : (
        <div className="flex items-center justify-between px-1 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
            Push notification alarms active
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestNotification}
              disabled={isTestSending}
              className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
            >
              <Send className="h-2.5 w-2.5" />
              {isTestSending ? "Sending..." : "Test Alarm"}
            </button>
            {isInstallable && (
              <button
                onClick={installApp}
                className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 ml-2"
              >
                <Download className="h-2.5 w-2.5" />
                Install App
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("DAILY")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
            activeTab === "DAILY"
              ? "bg-white text-zinc-950 font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Daily Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab("GLOBAL")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
            activeTab === "GLOBAL"
              ? "bg-white text-zinc-950 font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Ongoing / Global ({globalTodos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ALARMS")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
            activeTab === "ALARMS"
              ? "bg-white text-zinc-950 font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Alarms & Reminders ({todosWithAlarms.length})</span>
        </button>
      </div>

      {activeTab === "DAILY" ? (
        <div className="space-y-4">
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
      ) : activeTab === "GLOBAL" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-zinc-400">
              Ongoing tasks persist until completed and can have expiry dates & reminder alarms.
            </p>
            <Button
              onClick={() => setIsReminderModalOpen(true)}
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-300 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Ongoing Task
            </Button>
          </div>

          {globalTodos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/30">
              <Layers className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <h4 className="text-xs font-semibold text-zinc-300">No Ongoing Tasks</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Add tasks that span multiple days with optional deadlines and reminder alarms.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {globalTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-zinc-400">
              Tasks scheduled with active push reminder alarms.
            </p>
          </div>

          {todosWithAlarms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/30">
              <Bell className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <h4 className="text-xs font-semibold text-zinc-300">No Scheduled Alarms</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Hover any task and click the bell icon to set an alarm notification time.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todosWithAlarms.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
          )}
        </div>
      )}

      {isReminderModalOpen && (
        <CreateReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
        />
      )}
    </div>
  );
}

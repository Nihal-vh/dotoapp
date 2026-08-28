"use client";

import React, { useState } from "react";
import {
  Bell,
  Clock,
  Calendar,
  Plus,
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  Send,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ReminderItem, ReminderItemData } from "./ReminderItem";
import { CreateReminderModal } from "./CreateReminderModal";
import { usePwa } from "@/components/pwa/PwaProvider";
import { TodoItem, TodoItemData } from "@/features/todos/components/TodoItem";

interface RemindersPageViewProps {
  reminders: ReminderItemData[];
  globalTodos: TodoItemData[];
  highlightId?: string;
}

export function RemindersPageView({
  reminders,
  globalTodos,
  highlightId,
}: RemindersPageViewProps) {
  const {
    notificationPermission,
    isSubscribed,
    requestPushPermission,
    sendTestPush,
    isInstallable,
    installApp,
  } = usePwa();

  const [activeTab, setActiveTab] = useState<
    "ALL" | "ALARMS" | "GLOBAL_TODOS" | "EXPIRING" | "COMPLETED"
  >("ALL");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const [isTestSending, setIsTestSending] = useState(false);

  const pendingReminders = reminders.filter((r) => r.status !== "COMPLETED");
  const completedReminders = reminders.filter((r) => r.status === "COMPLETED");

  const now = new Date();
  const expiringSoon = reminders.filter(
    (r) =>
      r.dueDate &&
      new Date(r.dueDate).getTime() - now.getTime() < 3 * 24 * 3600 * 1000 &&
      r.status !== "COMPLETED"
  );

  // Filter items based on active tab
  const getFilteredReminders = () => {
    switch (activeTab) {
      case "ALARMS":
        return pendingReminders.sort(
          (a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime()
        );
      case "EXPIRING":
        return expiringSoon;
      case "COMPLETED":
        return completedReminders;
      case "ALL":
      default:
        return reminders;
    }
  };

  const filteredReminders = getFilteredReminders();

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    setIsCreateModalOpen(true);
  };

  const handleTestNotification = async () => {
    setIsTestSending(true);
    try {
      await sendTestPush();
    } finally {
      setIsTestSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-400" />
            Reminders & Global Tasks
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage alarm notifications, due dates, and ongoing tasks across all your devices.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="default"
          size="sm"
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Reminder
        </Button>
      </div>

      {/* Push Notification & PWA Status Card */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                notificationPermission === "granted"
                  ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              <Bell className="h-4 w-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  Push Notifications
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    notificationPermission === "granted"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {notificationPermission === "granted" ? "Enabled & Active" : "Not Enabled"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {notificationPermission === "granted"
                  ? "You will receive system alarm alerts even when DOTO is closed."
                  : "Enable push notifications to get alarms and reminders on your phone & desktop."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {notificationPermission !== "granted" ? (
              <Button
                onClick={requestPushPermission}
                size="sm"
                variant="default"
                className="text-xs"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Enable Push
              </Button>
            ) : (
              <Button
                onClick={handleTestNotification}
                size="sm"
                variant="secondary"
                isLoading={isTestSending}
                className="text-xs"
              >
                <Send className="h-3 w-3 mr-1" />
                Test Alarm
              </Button>
            )}

            {isInstallable && (
              <Button
                onClick={installApp}
                size="sm"
                variant="ghost"
                className="text-xs text-zinc-300 hover:text-white border border-zinc-800"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Install App
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Quick Reminder Input */}
      <form onSubmit={handleQuickAdd} className="relative flex items-center">
        <Plus className="absolute left-3.5 h-4 w-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Quick reminder or ongoing task... (press Enter to set alarm time)"
          className="w-full h-11 pl-10 pr-24 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
        />
        <button
          type="submit"
          className="absolute right-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-medium text-zinc-200 transition-colors"
        >
          Set Alarm &rarr;
        </button>
      </form>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
            activeTab === "ALL"
              ? "bg-white text-zinc-950 font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          All ({reminders.length})
        </button>

        <button
          onClick={() => setActiveTab("ALARMS")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === "ALARMS"
              ? "bg-white text-zinc-950 font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Clock className="h-3 w-3" />
          <span>Active Alarms ({pendingReminders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("GLOBAL_TODOS")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === "GLOBAL_TODOS"
              ? "bg-white text-zinc-950 font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Layers className="h-3 w-3" />
          <span>Global Tasks / Backlog ({globalTodos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("EXPIRING")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === "EXPIRING"
              ? "bg-white text-zinc-950 font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Calendar className="h-3 w-3" />
          <span>Due Soon ({expiringSoon.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
            activeTab === "COMPLETED"
              ? "bg-white text-zinc-950 font-semibold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          Completed ({completedReminders.length})
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === "GLOBAL_TODOS" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              Ongoing Tasks (Not restricted to a single day)
            </span>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-400 hover:text-white"
            >
              <Plus className="h-3 w-3 mr-1" /> Add Global Task
            </Button>
          </div>

          {globalTodos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/30">
              <Layers className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <h4 className="text-xs font-semibold text-zinc-300">No Global Tasks</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Create tasks with due dates that stay open across days until you complete them.
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
        <div className="space-y-3">
          {filteredReminders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/30">
              <Bell className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <h4 className="text-xs font-semibold text-zinc-300">No Reminders Found</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Click &quot;Add Reminder&quot; above to schedule alarms with push notifications.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredReminders.map((reminder) => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  isHighlighted={reminder.id === highlightId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <CreateReminderModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setQuickTitle("");
        }}
        defaultTitle={quickTitle}
      />
    </div>
  );
}

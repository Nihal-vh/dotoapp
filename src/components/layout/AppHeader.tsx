"use client";

import React, { useState } from "react";
import { LogOut, Plus, Download } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { usePwa } from "@/components/pwa/PwaProvider";
import { CreateReminderModal } from "@/features/reminders/components/CreateReminderModal";

interface AppHeaderProps {
  userEmail: string;
  userName?: string | null;
}

export function AppHeader({
  userEmail,
  userName,
}: AppHeaderProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const { isInstallable, installApp } = usePwa();

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <>
      <header className="flex h-12 items-center justify-between px-4 sm:px-6 bg-zinc-950/60 backdrop-blur-md border-b border-zinc-900/40">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-zinc-400">{todayFormatted}</span>

          {isInstallable && (
            <button
              onClick={installApp}
              className="hidden sm:flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              title="Install DOTO as App"
            >
              <Download className="h-3 w-3" />
              <span>Install App</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Add Task with Alarm */}
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            title="Create Task & Set Reminder Alarm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Task</span>
          </button>

          {/* User & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-850">
            <span className="text-xs text-zinc-400 hidden sm:inline">
              {userName || userEmail}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Sign out"
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {isTaskModalOpen && (
        <CreateReminderModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
        />
      )}
    </>
  );
}

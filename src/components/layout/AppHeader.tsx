"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";

interface AppHeaderProps {
  userEmail: string;
  userName?: string | null;
}

export function AppHeader({ userEmail, userName }: AppHeaderProps) {
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="flex h-12 items-center justify-between px-4 sm:px-6 bg-zinc-950/60 backdrop-blur-md">
      <span className="text-xs font-medium text-zinc-400">{todayFormatted}</span>

      <div className="flex items-center gap-3">
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
    </header>
  );
}

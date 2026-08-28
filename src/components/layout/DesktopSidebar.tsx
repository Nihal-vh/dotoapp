"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  FolderKanban,
  GraduationCap,
  BookOpen,
  CheckSquare,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DesktopSidebarProps {
  userEmail?: string;
  userName?: string | null;
  pendingTodosCount?: number;
}

export function DesktopSidebar({
  pendingTodosCount = 0,
}: DesktopSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Focus",
      href: "/",
      icon: Sparkles,
      active: pathname === "/",
    },
    {
      name: "Tasks",
      href: "/todos",
      icon: CheckSquare,
      active: pathname.startsWith("/todos"),
      badge: pendingTodosCount > 0 ? pendingTodosCount : undefined,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: FolderKanban,
      active: pathname.startsWith("/projects"),
    },
    {
      name: "Learn",
      href: "/learning",
      icon: GraduationCap,
      active: pathname.startsWith("/learning"),
    },
    {
      name: "Read",
      href: "/readings",
      icon: BookOpen,
      active: pathname.startsWith("/readings"),
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart2,
      active: pathname.startsWith("/analytics"),
    },
  ];

  return (
    <aside className="hidden md:flex h-screen w-56 flex-col justify-between border-r border-zinc-900 bg-zinc-950 p-4 sticky top-0">
      <div className="space-y-6">
        {/* Minimal Branding */}
        <Link href="/" className="flex items-center gap-2.5 px-2 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-zinc-950 font-bold text-sm">
            d
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            DOTO
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  item.active
                    ? "bg-zinc-900 text-white font-semibold"
                    : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-800 px-1.5 text-[10px] text-zinc-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-2 py-1 text-[11px] text-zinc-500">
        Personal Work OS &bull; PWA
      </div>
    </aside>
  );
}

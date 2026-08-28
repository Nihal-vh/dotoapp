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

interface MobileBottomNavProps {
  pendingTodosCount?: number;
}

export function MobileBottomNav({ pendingTodosCount = 0 }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Focus",
      href: "/",
      icon: Sparkles,
      active: pathname === "/",
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
      name: "Tasks",
      href: "/todos",
      icon: CheckSquare,
      active: pathname.startsWith("/todos"),
      badge: pendingTodosCount > 0 ? pendingTodosCount : undefined,
    },
    {
      name: "Stats",
      href: "/analytics",
      icon: BarChart2,
      active: pathname.startsWith("/analytics"),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-zinc-900 bg-zinc-950/95 px-1 backdrop-blur-lg pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors",
              item.active ? "text-white font-semibold" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <div className="relative">
              <Icon className={cn("h-4 w-4", item.active ? "text-white" : "text-zinc-500")} />
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-white px-0.5 text-[8px] font-bold text-zinc-950">
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

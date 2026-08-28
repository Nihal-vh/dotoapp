import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStringOrDate: string | Date | null | undefined): string {
  if (!dateStringOrDate) return "";
  const date = typeof dateStringOrDate === "string" ? new Date(dateStringOrDate) : dateStringOrDate;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatRelativeTime(dateStringOrDate: string | Date | null | undefined): string {
  if (!dateStringOrDate) return "Never";
  const date = typeof dateStringOrDate === "string" ? new Date(dateStringOrDate) : dateStringOrDate;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function getOffsetDateString(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

export function formatDisplayDate(dateStr: string): string {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();
  const yesterday = getOffsetDateString(-1);

  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  if (dateStr === yesterday) return "Yesterday";

  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTodayDateString, getTomorrowDateString, getOffsetDateString, formatDisplayDate } from "@/lib/utils";

interface DateNavigatorProps {
  currentDate: string;
  onSelectDate: (date: string) => void;
}

export function DateNavigator({ currentDate, onSelectDate }: DateNavigatorProps) {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();
  const yesterday = getOffsetDateString(-1);

  const handlePrevDay = () => {
    const [y, m, d] = currentDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() - 1);
    onSelectDate(dateObj.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const [y, m, d] = currentDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + 1);
    onSelectDate(dateObj.toISOString().split("T")[0]);
  };

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      {/* Quick Filter Buttons */}
      <div className="flex items-center gap-1">
        {[
          { label: "Yesterday", date: yesterday },
          { label: "Today", date: today },
          { label: "Tomorrow", date: tomorrow },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => onSelectDate(item.date)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              currentDate === item.date
                ? "bg-white text-zinc-950 font-semibold"
                : "text-zinc-500 hover:text-zinc-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Date Switcher */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handlePrevDay}
          className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          title="Previous Day"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="text-xs text-zinc-400 font-medium px-1">
          {formatDisplayDate(currentDate)}
        </span>

        <button
          onClick={handleNextDay}
          className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          title="Next Day"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

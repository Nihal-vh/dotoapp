"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TomorrowSummaryCardProps {
  tomorrowTasksCount: number;
}

export function TomorrowSummaryCard({ tomorrowTasksCount }: TomorrowSummaryCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Tomorrow&apos;s Plan</h4>
            <p className="text-[11px] text-zinc-400">
              {tomorrowTasksCount > 0
                ? `${tomorrowTasksCount} task${tomorrowTasksCount === 1 ? "" : "s"} lined up for tomorrow`
                : "No tasks planned yet"}
            </p>
          </div>
        </div>

        <Link href="/todos">
          <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">
            <span>View</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

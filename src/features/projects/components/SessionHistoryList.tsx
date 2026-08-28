import React from "react";
import { formatRelativeTime } from "@/lib/utils";
import { History, Sparkles, Clock, CheckCircle, StopCircle, ArrowRight } from "lucide-react";

interface SessionData {
  id: string;
  workedOn: string;
  completed: string;
  stoppedAt: string;
  nextAction: string;
  durationMins?: number | null;
  createdAt: Date | string;
}

interface SessionHistoryListProps {
  sessions: SessionData[];
}

export function SessionHistoryList({ sessions }: SessionHistoryListProps) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
        No sessions logged yet. Log your first session to track continuity.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
        <History className="h-4 w-4 text-zinc-400" />
        <span>Session History</span>
        <span className="text-xs font-mono text-zinc-500">({sessions.length})</span>
      </div>

      <div className="space-y-3">
        {sessions.map((session, index) => {
          const isLatest = index === 0;

          return (
            <div
              key={session.id}
              className={`rounded-xl border p-4 transition-all ${
                isLatest
                  ? "border-zinc-700 bg-zinc-900/90 start-here-glow shadow-sm"
                  : "border-zinc-800/80 bg-zinc-950/60"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  {isLatest ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono">
                      <Sparkles className="h-2.5 w-2.5" />
                      LATEST SESSION
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-zinc-400">
                      Session #{sessions.length - index}
                    </span>
                  )}
                  {session.durationMins && (
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" />
                      {session.durationMins}m
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-500 font-mono">
                  {formatRelativeTime(session.createdAt)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 font-medium block mb-0.5">What I worked on:</span>
                  <p className="text-zinc-300 bg-zinc-900/60 p-2 rounded border border-zinc-800">
                    {session.workedOn}
                  </p>
                </div>

                <div>
                  <span className="text-zinc-400 font-medium flex items-center gap-1 mb-0.5">
                    <CheckCircle className="h-3 w-3" />
                    What I completed:
                  </span>
                  <p className="text-zinc-300 bg-zinc-900/60 p-2 rounded border border-zinc-800">
                    {session.completed}
                  </p>
                </div>

                <div>
                  <span className="text-zinc-400 font-medium flex items-center gap-1 mb-0.5">
                    <StopCircle className="h-3 w-3" />
                    Where I stopped:
                  </span>
                  <p className="text-zinc-300 bg-zinc-900/60 p-2 rounded border border-zinc-800">
                    {session.stoppedAt}
                  </p>
                </div>

                <div>
                  <span className="text-white font-medium flex items-center gap-1 mb-0.5">
                    <ArrowRight className="h-3 w-3" />
                    NEXT EXACT ACTION:
                  </span>
                  <p className="text-white font-medium bg-zinc-900 p-2 rounded border border-zinc-700">
                    {session.nextAction}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

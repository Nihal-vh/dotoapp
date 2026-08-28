import React from "react";
import { Badge } from "../ui/Badge";

interface StatusPillProps {
  status: string;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case "ACTIVE":
      return <Badge variant="white" className={className}>Active</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="amber" className={className}>In Progress</Badge>;
    case "COMPLETED":
      return <Badge variant="default" className={className}>Completed</Badge>;
    case "PAUSED":
      return <Badge variant="secondary" className={className}>Paused</Badge>;
    case "ARCHIVED":
      return <Badge variant="outline" className={className}>Archived</Badge>;
    case "NOT_STARTED":
    case "TODO":
      return <Badge variant="secondary" className={className}>Todo</Badge>;
    case "SKIPPED":
      return <Badge variant="outline" className={className}>Skipped</Badge>;
    case "CARRIED_FORWARD":
      return <Badge variant="secondary" className={className}>Carried Forward</Badge>;
    default:
      return <Badge variant="secondary" className={className}>{status}</Badge>;
  }
}

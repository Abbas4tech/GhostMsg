"use client";

import type React from "react";
import { Badge } from "@/components/elements/badge";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/elements/toggle-group";
import { cn } from "@/lib/utils";

export type MessageFilterStatus =
  | "all"
  | "unread"
  | "starred"
  | "quarantined"
  | "answered";

export interface MessageFilterCounts {
  all: number;
  answered: number;
  quarantined: number;
  starred: number;
  unread: number;
}

const FILTERS: { label: string; status: MessageFilterStatus }[] = [
  { status: "all", label: "All" },
  { status: "unread", label: "Unread" },
  { status: "starred", label: "Starred" },
  { status: "answered", label: "Answered" },
];

const isFilterStatus = (value: string): value is MessageFilterStatus =>
  value === "quarantined" || FILTERS.some((f) => f.status === value);

export interface FilterBarProps {
  activeStatus: MessageFilterStatus;
  className?: string;
  counts?: MessageFilterCounts;
  onStatusChange: (status: MessageFilterStatus) => void;
}

/**
 * Inbox filter chips (single-select ToggleGroup) with counts. Quarantined
 * only appears when something is in it, so the main view never advertises
 * abuse.
 */
export function FilterBar({
  activeStatus,
  onStatusChange,
  counts,
  className,
}: FilterBarProps): React.JSX.Element {
  const showQuarantined = Boolean(counts?.quarantined);

  return (
    <ToggleGroup
      aria-label="Filter messages"
      className={cn(
        "-mx-4 w-auto flex-nowrap overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0",
        className
      )}
      data-slot="filter-bar"
      // Radix allows deselecting a single toggle; keep one chip on.
      onValueChange={(value) => {
        if (isFilterStatus(value)) {
          onStatusChange(value);
        }
      }}
      size="touch"
      spacing={2}
      type="single"
      value={activeStatus}
      variant="chip"
    >
      {FILTERS.map(({ status, label }) => (
        <ToggleGroupItem key={status} value={status}>
          {label}
          {counts ? <Badge variant="count">{counts[status]}</Badge> : null}
        </ToggleGroupItem>
      ))}
      {showQuarantined ? (
        <ToggleGroupItem value="quarantined">
          Quarantined
          <Badge variant="attention">{counts?.quarantined}</Badge>
        </ToggleGroupItem>
      ) : null}
    </ToggleGroup>
  );
}

export default FilterBar;

"use client";

import type React from "react";
import { useCallback } from "react";
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
  | "answered"
  | "archived";

export interface MessageFilterCounts {
  all: number;
  answered: number;
  /** Optional so callers without archive data still type-check. */
  archived?: number;
  quarantined: number;
  starred: number;
  unread: number;
}

const FILTERS: { label: string; status: MessageFilterStatus }[] = [
  { label: "All", status: "all" },
  { label: "Unread", status: "unread" },
  { label: "Starred", status: "starred" },
  { label: "Answered", status: "answered" },
];

const isFilterStatus = (value: string): value is MessageFilterStatus =>
  value === "quarantined" ||
  value === "archived" ||
  FILTERS.some((f) => f.status === value);

export interface FilterBarProps {
  activeStatus: MessageFilterStatus;
  className?: string;
  counts?: MessageFilterCounts;
  /** Phones' selection mode: chips fade and can't change the view. */
  disabled?: boolean;
  onStatusChange: (status: MessageFilterStatus) => void;
}

/**
 * Inbox filter chips (single-select ToggleGroup) with counts. Quarantined
 * and Archived only appear when something is in them (Quarantined so the
 * main view never advertises abuse), or while you're viewing them.
 */
export function FilterBar({
  activeStatus,
  onStatusChange,
  counts,
  className,
  disabled = false,
}: FilterBarProps): React.JSX.Element {
  const showQuarantined =
    Boolean(counts?.quarantined) || activeStatus === "quarantined";
  const showArchived = Boolean(counts?.archived) || activeStatus === "archived";
  const handleValueChange = useCallback(
    (value: string) => {
      if (isFilterStatus(value)) {
        onStatusChange(value);
      }
    },
    [onStatusChange]
  );

  return (
    <ToggleGroup
      aria-label="Filter messages"
      className={cn(
        "-mx-4 w-auto snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 [scrollbar-width:none] *:shrink-0 *:snap-start data-[variant=chip]:flex-nowrap sm:mx-0 sm:snap-none sm:overflow-visible sm:px-0 sm:data-[variant=chip]:flex-wrap",
        className
      )}
      data-slot="filter-bar"
      disabled={disabled}
      // Radix allows deselecting a single toggle; keep one chip on.
      onValueChange={handleValueChange}
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
      {showArchived ? (
        <ToggleGroupItem value="archived">
          Archived
          <Badge variant="count">{counts?.archived ?? 0}</Badge>
        </ToggleGroupItem>
      ) : null}
    </ToggleGroup>
  );
}

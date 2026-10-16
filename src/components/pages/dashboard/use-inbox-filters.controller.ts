"use client";

import { useCallback, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import type { MessageFilterStatus } from "@/components/patterns/filter-bar";
import { buildInboxHref } from "./inbox.utils";

/** Wait this long after typing before searching on the server. */
export const INBOX_SEARCH_DEBOUNCE_MS = 250;

export interface UseInboxFiltersControllerOptions {
  /** `?q=` from the route. */
  initialQuery?: string;
  /** `?filter=` from the route (also changes on ⌘K and back/forward). */
  initialStatus?: MessageFilterStatus;
}

/** Mirrors the view into the URL without a navigation or a server round trip. */
const writeUrl = (status: MessageFilterStatus, query: string): void => {
  window.history.replaceState(
    null,
    "",
    buildInboxHref(window.location.pathname, status, query)
  );
};

/**
 * Inbox filter + search. Local state is the source of truth for the screen;
 * every change is written to the URL (`?filter=&q=`), so refresh and shared
 * links restore the view. A new `?filter=` from the route (⌘K, back/forward)
 * is adopted during render, without an effect.
 */
export function useInboxFiltersController({
  initialStatus,
  initialQuery = "",
}: UseInboxFiltersControllerOptions = {}) {
  const [activeStatus, setStatusState] = useState<MessageFilterStatus>(
    initialStatus ?? "all"
  );
  const [routeStatus, setRouteStatus] = useState(initialStatus);
  if (routeStatus !== initialStatus) {
    setRouteStatus(initialStatus);
    setStatusState(initialStatus ?? "all");
  }

  const [searchQuery, setSearchState] = useState(initialQuery);
  const [debouncedQuery] = useDebounceValue(
    searchQuery.trim(),
    INBOX_SEARCH_DEBOUNCE_MS
  );

  const setActiveStatus = useCallback(
    (status: MessageFilterStatus) => {
      setStatusState(status);
      writeUrl(status, searchQuery);
    },
    [searchQuery]
  );

  const setSearchQuery = useCallback(
    (query: string) => {
      setSearchState(query);
      writeUrl(activeStatus, query);
    },
    [activeStatus]
  );

  return {
    activeStatus,
    setActiveStatus,
    searchQuery,
    setSearchQuery,
    /** Trimmed, debounced search sent to the server. */
    debouncedQuery,
    /** Identifies the current view; selection belongs to one scope. */
    scope: `${activeStatus}\n${debouncedQuery}`,
  };
}

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { MessageFilterStatus } from "@/components/patterns/filter-bar";
import { useInboxFiltersController } from "./use-inbox-filters.controller";

const currentUrl = () => `${window.location.pathname}${window.location.search}`;

describe("useInboxFiltersController", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/dashboard");
  });

  it("starts from the route's filter and search", () => {
    const { result } = renderHook(() =>
      useInboxFiltersController({
        initialStatus: "starred",
        initialQuery: "hi",
      })
    );

    expect(result.current.activeStatus).toBe("starred");
    expect(result.current.searchQuery).toBe("hi");
  });

  it("writes the view into the URL without navigating", () => {
    window.history.replaceState(null, "", "/dashboard");
    const { result } = renderHook(() => useInboxFiltersController());

    act(() => result.current.setActiveStatus("unread"));
    expect(currentUrl()).toBe("/dashboard?filter=unread");

    act(() => result.current.setSearchQuery("  design "));
    expect(currentUrl()).toBe("/dashboard?filter=unread&q=design");

    act(() => result.current.setActiveStatus("all"));
    expect(currentUrl()).toBe("/dashboard?q=design");
  });

  it("debounces the search sent to the server and scopes the view", async () => {
    const { result } = renderHook(() => useInboxFiltersController());

    act(() => result.current.setSearchQuery(" design "));
    expect(result.current.debouncedQuery).toBe("");

    await waitFor(() => expect(result.current.debouncedQuery).toBe("design"));
    expect(result.current.scope).toBe("all\ndesign");
  });

  it("adopts a new ?filter= from the route (⌘K, back/forward)", () => {
    const { result, rerender } = renderHook(
      ({ status }: { status?: MessageFilterStatus }) =>
        useInboxFiltersController({ initialStatus: status }),
      { initialProps: { status: "all" as MessageFilterStatus | undefined } }
    );

    rerender({ status: "quarantined" });
    expect(result.current.activeStatus).toBe("quarantined");

    rerender({ status: undefined });
    expect(result.current.activeStatus).toBe("all");
  });
});

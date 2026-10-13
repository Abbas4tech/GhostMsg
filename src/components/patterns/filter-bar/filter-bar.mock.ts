import { mixedMessageCounts } from "@/mock/fixtures/messages.fixtures";
import { noop } from "@/mock/noop";
import type { FilterBarProps } from "./filter-bar";

export const defaultFilterBarArgs: FilterBarProps = {
  activeStatus: "all",
  searchQuery: "",
  counts: mixedMessageCounts,
  onStatusChange: noop,
  onSearchChange: noop,
};

export const noQuarantineFilterBarArgs = {
  counts: { ...mixedMessageCounts, quarantined: 0 },
} satisfies Partial<FilterBarProps>;

export const searchingFilterBarArgs = {
  searchQuery: "design",
} satisfies Partial<FilterBarProps>;

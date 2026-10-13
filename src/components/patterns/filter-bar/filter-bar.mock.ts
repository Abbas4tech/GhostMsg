import { mixedMessageCounts } from "@/mock/fixtures/messages.fixtures";
import { noop } from "@/mock/noop";
import type { FilterBarProps } from "./filter-bar";

export const defaultFilterBarArgs: FilterBarProps = {
  activeStatus: "all",
  counts: mixedMessageCounts,
  onStatusChange: noop,
};

export const noQuarantineFilterBarArgs = {
  counts: { ...mixedMessageCounts, quarantined: 0 },
} satisfies Partial<FilterBarProps>;

export const quarantinedActiveFilterBarArgs = {
  activeStatus: "quarantined",
} satisfies Partial<FilterBarProps>;

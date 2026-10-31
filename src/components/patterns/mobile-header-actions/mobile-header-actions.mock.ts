import { noop } from "@/mock/noop";

/** The Inbox's phone top-bar actions (design MobInbox: Search + Select). */
export const mobileHeaderActionsMock = {
  onSearch: noop,
  onSelect: noop,
  searchLabel: "Search messages",
  selectLabel: "Select messages",
};

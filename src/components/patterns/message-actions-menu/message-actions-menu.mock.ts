import { noop } from "@/mock/noop";

/** Labels for the overflow menu story (icons are added in the story). */
export const messageActionsMock = {
  archive: { key: "archive", label: "Archive", onClick: noop },
  block: { key: "block", label: "Block sender", onClick: noop },
  delete: { key: "delete", label: "Delete", onClick: noop, tone: "danger" },
  story: { key: "story", label: "Share as Story Card", onClick: noop },
} as const;

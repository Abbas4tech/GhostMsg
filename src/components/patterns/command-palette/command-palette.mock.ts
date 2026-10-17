import { noop } from "@/mock/noop";
import type { CommandPaletteProps } from "./command-palette";

export const defaultCommandPaletteArgs: CommandPaletteProps = {
  groups: [
    {
      heading: "Actions",
      items: [
        {
          id: "copy-link",
          label: "Copy my Public Profile Link",
          onSelect: noop,
        },
        {
          id: "pause",
          label: "Pause Message Acceptance",
          onSelect: noop,
        },
      ],
    },
    {
      heading: "Go to",
      items: [
        { id: "inbox", label: "Inbox", onSelect: noop, shortcut: "g i" },
        { id: "starred", label: "Inbox · Starred", onSelect: noop },
        { id: "settings", label: "Settings", onSelect: noop, shortcut: "g s" },
      ],
    },
  ],
  onOpenChange: noop,
  open: true,
};

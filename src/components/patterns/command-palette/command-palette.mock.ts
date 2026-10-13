import { noop } from "@/mock/noop";
import type { CommandPaletteProps } from "./command-palette";

export const defaultCommandPaletteArgs: CommandPaletteProps = {
  open: true,
  onOpenChange: noop,
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
        { id: "inbox", label: "Inbox", shortcut: "g i", onSelect: noop },
        { id: "starred", label: "Inbox · Starred", onSelect: noop },
        { id: "settings", label: "Settings", shortcut: "g s", onSelect: noop },
      ],
    },
  ],
};

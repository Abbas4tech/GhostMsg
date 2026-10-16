"use client";

import type React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/elements/command";

export interface CommandItemDefinition {
  icon?: React.ReactNode;
  id: string;
  label: string;
  onSelect: () => void;
  /** Hint shown on the right, e.g. "g s". */
  shortcut?: string;
}

export interface CommandGroupDefinition {
  heading: string;
  items: CommandItemDefinition[];
}

export interface CommandPaletteProps {
  groups: CommandGroupDefinition[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

/**
 * ⌘K palette on shadcn Command (cmdk): type to filter, ↑/↓ to move, Enter to
 * run. Items carry their own callbacks, so the page decides what they do.
 */
/** Case-insensitive substring match: typing narrows, never reshuffles. */
const containsFilter = (value: string, search: string): number =>
  value.toLowerCase().includes(search.trim().toLowerCase()) ? 1 : 0;

export function CommandPalette({
  open,
  onOpenChange,
  groups,
}: CommandPaletteProps): React.JSX.Element {
  return (
    <CommandDialog
      description="Type a command, use the arrow keys and press Enter."
      filter={containsFilter}
      label="Search commands"
      onOpenChange={onOpenChange}
      open={open}
      showCloseButton={false}
      title="Command palette"
    >
      <CommandInput placeholder="Jump to…" />
      <CommandList>
        <CommandEmpty>No commands match.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup heading={group.heading} key={group.heading}>
            {group.items.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => {
                  onOpenChange(false);
                  item.onSelect();
                }}
                value={item.label}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.shortcut ? (
                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

export default CommandPalette;

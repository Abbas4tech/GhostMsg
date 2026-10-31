"use client";

import { MoreVertical } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/elements/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/elements/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/elements/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface MessageAction {
  disabled?: boolean;
  /** Small trailing note on the phone Drawer row, e.g. a shortcut. */
  hint?: string;
  icon: React.ReactNode;
  key: string;
  label: string;
  onClick: () => void;
  /** Visually separates this and the rest of the list from what's above it. */
  startsGroup?: boolean;
  tone?: "danger";
}

export interface MessageActionsMenuProps {
  actions: MessageAction[];
  /** Accessible name for the trigger and the mobile Drawer title. */
  label?: string;
  /** Phones: a one-line summary of the message above the actions. */
  preview?: React.ReactNode;
}

interface DrawerActionButtonProps {
  action: MessageAction;
  onSelect: (actionClick: () => void) => void;
}

function DrawerActionButton({ action, onSelect }: DrawerActionButtonProps) {
  const handleClick = useCallback(
    () => onSelect(action.onClick),
    [action.onClick, onSelect]
  );

  return (
    <button
      className={cn(
        "flex min-h-14 items-center gap-3 px-4 text-left text-title disabled:opacity-50",
        action.startsGroup && "border-t",
        action.tone === "danger" && "text-destructive"
      )}
      disabled={action.disabled}
      onClick={handleClick}
      type="button"
    >
      <span aria-hidden="true" className="[&_svg]:size-5">
        {action.icon}
      </span>
      <span className="flex-1">{action.label}</span>
      {action.hint ? (
        <span className="font-normal text-muted-foreground text-xs">
          {action.hint}
        </span>
      ) : null}
    </button>
  );
}

/** Overflow actions for a message: DropdownMenu on >=768px, bottom Drawer below it. */
export function MessageActionsMenu({
  actions,
  label = "Message actions",
  preview,
}: MessageActionsMenuProps): React.JSX.Element | null {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerAction = useCallback((actionClick: () => void) => {
    setDrawerOpen(false);
    actionClick();
  }, []);

  if (actions.length === 0) {
    return null;
  }

  const trigger = (
    <Button
      aria-label={label}
      className="size-10 rounded-[10px] text-muted-foreground hover:text-foreground sm:size-9"
      size="icon"
      title={label}
      variant="ghost"
    >
      <MoreVertical aria-hidden="true" />
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={setDrawerOpen} open={drawerOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="sr-only">
            <DrawerTitle>{label}</DrawerTitle>
          </DrawerHeader>
          {preview ? (
            <div className="mx-4 flex items-center gap-2.5 border-b px-1 pt-2 pb-3">
              {preview}
            </div>
          ) : null}
          <div className="flex flex-col pb-[env(safe-area-inset-bottom)]">
            {actions.map((action) => (
              <DrawerActionButton
                action={action}
                key={action.key}
                onSelect={handleDrawerAction}
              />
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <span key={action.key}>
            {action.startsGroup ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              disabled={action.disabled}
              onClick={action.onClick}
              variant={action.tone === "danger" ? "destructive" : "default"}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          </span>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import type React from "react";
import { Button } from "@/components/elements/button";
import { Card } from "@/components/elements/card";
import { Spinner } from "@/components/elements/spinner";

export interface UnsavedChangesBarProps {
  isSaving?: boolean;
  isVisible: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

/** Sticky "You have unsaved changes" bar with Discard / Save changes. */
export function UnsavedChangesBar({
  isVisible,
  isSaving = false,
  onDiscard,
  onSave,
}: UnsavedChangesBarProps): React.JSX.Element | null {
  if (!isVisible) {
    return null;
  }

  return (
    <Card
      aria-label="Unsaved changes"
      className="sticky bottom-20 z-20 flex-row flex-wrap items-center gap-3 py-3 pr-3 pl-5 shadow-lift motion-safe:animate-rise md:bottom-4"
      data-slot="unsaved-changes-bar"
      role="region"
      variant="elevated"
    >
      <span aria-hidden="true" className="size-2 rounded-full bg-warning" />
      <b className="flex-1 text-sm">You have unsaved changes</b>
      <Button
        className="rounded-full"
        disabled={isSaving}
        onClick={onDiscard}
        variant="ghost"
      >
        Discard
      </Button>
      <Button className="rounded-full" disabled={isSaving} onClick={onSave}>
        {isSaving ? <Spinner data-icon="inline-start" /> : null}
        Save changes
      </Button>
    </Card>
  );
}

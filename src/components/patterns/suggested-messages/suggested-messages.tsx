import { RefreshCw, Sparkles } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import { Button } from "@/components/elements/button";
import { Skeleton } from "@/components/elements/skeleton";
import { cn } from "@/lib/utils";

export interface SuggestedMessagesProps {
  isLoading?: boolean;
  onRefresh: () => void;
  onSelect: (suggestion: string) => void;
  suggestions: string[];
}

const SKELETON_KEYS = ["a", "b", "c"] as const;

function SuggestionButton({
  suggestion,
  onSelect,
}: {
  onSelect: (suggestion: string) => void;
  suggestion: string;
}): React.JSX.Element {
  const handleClick = useCallback(() => {
    onSelect(suggestion);
  }, [onSelect, suggestion]);

  return (
    <button
      className="flex min-h-11 items-center rounded-2xl border border-input border-dashed bg-card px-3.5 py-2 text-left font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"
      onClick={handleClick}
      type="button"
    >
      {suggestion}
    </button>
  );
}

/** "Need a nudge?": AI Suggested Messages that fill the box when tapped. */
export function SuggestedMessages({
  suggestions,
  isLoading = false,
  onRefresh,
  onSelect,
}: SuggestedMessagesProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2" data-slot="suggested-messages">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-semibold text-sm">
          <Sparkles aria-hidden="true" className="size-4 text-primary" />
          Need a nudge?
        </span>
        <Button
          className="min-h-11 rounded-full"
          disabled={isLoading}
          onClick={onRefresh}
          size="sm"
          type="button"
          variant="ghost"
        >
          <RefreshCw
            aria-hidden="true"
            className={cn(isLoading && "animate-spin")}
          />
          New ideas
        </Button>
      </div>

      {isLoading && suggestions.length === 0 ? (
        <div
          aria-label="Loading ideas"
          className="flex flex-col gap-2"
          role="status"
        >
          {SKELETON_KEYS.map((key) => (
            <Skeleton className="h-11 rounded-2xl" key={key} />
          ))}
        </div>
      ) : null}

      {suggestions.map((suggestion) => (
        <SuggestionButton
          key={suggestion}
          onSelect={onSelect}
          suggestion={suggestion}
        />
      ))}
    </div>
  );
}

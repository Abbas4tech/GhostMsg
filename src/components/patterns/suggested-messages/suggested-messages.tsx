import { RefreshCw } from "lucide-react";
import type React from "react";
import { Button } from "@/components/elements/button";
import { Card, CardContent } from "@/components/elements/card";
import { cn } from "@/lib/utils";

export interface SuggestedMessagesProps {
  isLoading?: boolean;
  onRefresh: () => void;
  onSelect: (suggestion: string) => void;
  suggestions: string[];
}

/** AI-suggested message prompts; clicking one hands the text to the parent. */
export function SuggestedMessages({
  suggestions,
  isLoading = false,
  onRefresh,
  onSelect,
}: SuggestedMessagesProps): React.JSX.Element {
  return (
    <div
      className="mx-auto flex w-full max-w-2xl flex-col items-center"
      data-slot="suggested-messages"
    >
      <Button
        className="my-4"
        disabled={isLoading}
        onClick={onRefresh}
        size="lg"
      >
        <RefreshCw
          className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")}
        />
        Suggest Messages
      </Button>

      {suggestions.length > 0 && (
        <Card className="w-full">
          <CardContent className="flex flex-col gap-4 p-6">
            {suggestions.map((suggestion) => (
              <Button
                className="h-auto justify-start whitespace-normal py-3 text-left"
                key={suggestion}
                onClick={() => onSelect(suggestion)}
                variant="outline"
              >
                {suggestion}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SuggestedMessages;

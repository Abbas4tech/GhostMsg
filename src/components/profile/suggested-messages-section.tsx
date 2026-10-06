"use client";

import { RefreshCw } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSuggestMessagesMutation } from "@/hooks/mutations/use-suggest-messages-mutation";
import { cn } from "@/lib/utils";

interface SuggestedMessagesSectionProps {
  onSelectSuggestion: (message: string) => void;
}

export const SuggestedMessagesSection = ({
  onSelectSuggestion,
}: SuggestedMessagesSectionProps): React.JSX.Element => {
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const { mutateAsync, isPending } = useSuggestMessagesMutation();
  const hasAutoFetchedRef = useRef(false);

  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await mutateAsync();
      if (response?.success) {
        const messages = (response.messages || "")
          .split("||")
          .map((m) => m.trim())
          .filter(Boolean);
        setSuggestedMessages(messages);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to suggest messages");
    }
  }, [mutateAsync]);

  useEffect(() => {
    if (!hasAutoFetchedRef.current) {
      hasAutoFetchedRef.current = true;
      fetchSuggestions();
    }
  }, [fetchSuggestions]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
      <Button
        className="my-4"
        disabled={isPending}
        onClick={fetchSuggestions}
        size={"lg"}
      >
        <RefreshCw
          className={cn("mr-2 h-4 w-4", isPending && "animate-spin")}
        />
        Suggest Messages
      </Button>

      {suggestedMessages.length > 0 && (
        <Card className="w-full">
          <CardContent className="flex flex-col gap-4 p-6">
            {suggestedMessages.map((msg, index) => (
              <Button
                className="h-auto justify-start whitespace-normal py-3 text-left"
                key={`suggest-msg-${index}-${msg.slice(0, 15)}`}
                onClick={() => onSelectSuggestion(msg)}
                variant={"outline"}
              >
                {msg}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuggestedMessagesSection;

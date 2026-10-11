"use client";

import { useQuery } from "@tanstack/react-query";
import type { PublicQaItem } from "@/components/patterns/public-qa-feed";
import { messagesQueries } from "@/queries/messages.queries";

const EMPTY_ANSWERS: PublicQaItem[] = [];

/** Public AMA prompt + published Q&A for a recipient's profile. */
export function usePublicAnswersController(username: string) {
  const { data, isLoading } = useQuery(messagesQueries.publicAnswers(username));

  return {
    amaPrompt: data?.amaPrompt,
    answers: data?.answers ?? EMPTY_ANSWERS,
    isLoading,
  };
}

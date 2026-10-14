"use client";

import { useQuery } from "@tanstack/react-query";
import type { PublicQaItem } from "@/components/patterns/public-qa-feed";
import { ApiError } from "@/data/api-client";
import { messagesQueries } from "@/data/messages/messages.queries";
import type { PublicProfileDto } from "@/types/api";

const EMPTY_ANSWERS: PublicQaItem[] = [];
const MAX_RETRIES = 2;

const isNotFound = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 404;

/**
 * Public profile data: AMA Prompt, published Q&A, Message Acceptance and
 * whether the username exists at all (404 → not-found state, no retries).
 */
export function usePublicAnswersController(
  username: string,
  /** Rendered on the server: shown at once, no loading state, no refetch. */
  initialProfile?: PublicProfileDto | null
) {
  const { data, error, isLoading } = useQuery({
    ...messagesQueries.publicAnswers(username),
    initialData: initialProfile ?? undefined,
    retry: (failureCount, queryError) =>
      !isNotFound(queryError) && failureCount < MAX_RETRIES,
  });

  return {
    amaPrompt: data?.amaPrompt,
    answers: data?.answers ?? EMPTY_ANSWERS,
    isAccepting: data?.isAcceptingMessages ?? true,
    displayName: data?.displayName,
    avatarUrl: data?.avatarUrl ?? null,
    showAmaBanner: data?.showAmaBanner ?? true,
    offerSuggestions: data?.offerSuggestions ?? true,
    isNotFound: isNotFound(error),
    isLoading,
  };
}

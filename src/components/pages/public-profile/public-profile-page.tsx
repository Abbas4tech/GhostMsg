"use client";

import type React from "react";
import { PublicProfile } from "@/components/blocks/public-profile";
import type { PublicProfileDto } from "@/types/api";
import { usePublicAnswersController } from "./use-public-answers.controller";
import { useSendMessageController } from "./use-send-message.controller";

export interface PublicProfilePageProps {
  /** Disable the on-mount AI suggestion fetch (tests / stories). */
  autoFetchSuggestions?: boolean;
  /** Profile loaded by the route on the server (null = not found / skip). */
  initialProfile?: PublicProfileDto | null;
  username: string;
}

/** /u/[username]: send an Anonymous Message, Suggested Messages, Public Q&A. */
export function PublicProfilePage({
  username,
  autoFetchSuggestions,
  initialProfile,
}: PublicProfilePageProps): React.JSX.Element {
  const publicAnswers = usePublicAnswersController(username, initialProfile);
  // Fetch ideas only once we know the recipient offers them.
  const sender = useSendMessageController({
    username,
    autoFetchSuggestions:
      (autoFetchSuggestions ?? true) &&
      !publicAnswers.isLoading &&
      publicAnswers.offerSuggestions,
  });

  return (
    <PublicProfile
      amaPrompt={publicAnswers.amaPrompt}
      answers={{
        items: publicAnswers.answers,
        isLoading: publicAnswers.isLoading,
      }}
      avatarUrl={publicAnswers.avatarUrl}
      displayName={publicAnswers.displayName}
      isAccepting={publicAnswers.isAccepting}
      isNotFound={publicAnswers.isNotFound}
      offerSuggestions={publicAnswers.offerSuggestions}
      sendForm={{
        form: sender.form,
        isSubmitting: sender.isSubmitting,
        isSent: sender.isSent,
        onSendAnother: sender.handleSendAnother,
        onSubmit: sender.handleSubmit,
      }}
      showAmaBanner={publicAnswers.showAmaBanner}
      suggestions={{
        items: sender.suggestions,
        isLoading: sender.isFetchingSuggestions,
        onRefresh: sender.fetchSuggestions,
        onSelect: sender.selectSuggestion,
      }}
      username={username}
    />
  );
}

export default PublicProfilePage;

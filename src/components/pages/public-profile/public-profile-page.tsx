"use client";

import type React from "react";
import { PublicProfile } from "@/components/blocks/public-profile";
import { ThemeTogglerButton } from "@/components/elements/theme-toggler";
import { usePublicAnswersController } from "./use-public-answers.controller";
import { useSendMessageController } from "./use-send-message.controller";

export interface PublicProfilePageProps {
  /** Disable the on-mount AI suggestion fetch (tests / stories). */
  autoFetchSuggestions?: boolean;
  username: string;
}

/** /u/[username]: anonymous message form, AI suggestions and public Q&A. */
export function PublicProfilePage({
  username,
  autoFetchSuggestions,
}: PublicProfilePageProps): React.JSX.Element {
  const sender = useSendMessageController({ username, autoFetchSuggestions });
  const publicAnswers = usePublicAnswersController(username);

  return (
    <div className="container relative mx-auto px-4 py-12">
      <ThemeTogglerButton
        className="absolute top-4 right-4"
        modes={["dark", "light"]}
      />

      <PublicProfile
        amaPrompt={publicAnswers.amaPrompt}
        answers={{
          items: publicAnswers.answers,
          isLoading: publicAnswers.isLoading,
        }}
        sendForm={{
          form: sender.form,
          isSubmitting: sender.isSubmitting,
          onSubmit: sender.handleSubmit,
        }}
        suggestions={{
          items: sender.suggestions,
          isLoading: sender.isFetchingSuggestions,
          onRefresh: sender.fetchSuggestions,
          onSelect: sender.selectSuggestion,
        }}
        username={username}
      />
    </div>
  );
}

export default PublicProfilePage;

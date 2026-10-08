"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageCircleHeart } from "lucide-react";
import { useParams } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { ThemeTogglerButton } from "@/components/animate-ui/components/buttons/theme-toggler";
import { PublicQAFeed } from "@/components/profile/public-qa-feed";
import { SendMessageForm } from "@/components/profile/send-message-form";
import { SuggestedMessagesSection } from "@/components/profile/suggested-messages-section";
import { Text } from "@/components/ui/text";
import { messagesQueries } from "@/queries/messages.queries";

const SendMessagePage = (): React.JSX.Element => {
  const { username } = useParams<{ username: string }>();
  const [selectedMessage, setSelectedMessage] = useState<string>("");

  const { data: answersData } = useQuery(
    messagesQueries.publicAnswers(username || "")
  );

  const amaPrompt =
    answersData?.amaPrompt ||
    "Send me an anonymous message, confession, or question!";

  const handleSelectSuggestion = (message: string) => {
    setSelectedMessage(message);
  };

  const handleMessageSent = () => {
    setSelectedMessage("");
  };

  return (
    <div className="container relative mx-auto flex flex-col gap-10 px-4 py-12">
      <ThemeTogglerButton
        className="absolute top-4 right-4"
        modes={["dark", "light"]}
      />

      {/* Recipient Header & AMA Prompt Banner */}
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-lg">
          <MessageCircleHeart className="h-7 w-7" />
        </div>

        <Text
          as="h1"
          className="font-bold text-2xl tracking-tight sm:text-3xl"
          variant="h1"
        >
          @{username}
        </Text>

        <div className="mt-3 rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-2.5 shadow-xs backdrop-blur-xs">
          <p className="font-medium text-foreground text-sm sm:text-base">
            ✨ {amaPrompt}
          </p>
        </div>
      </div>

      {/* Message Submission Form */}
      <SendMessageForm
        onMessageSent={handleMessageSent}
        selectedContent={selectedMessage}
        username={username || ""}
      />

      {/* Suggested Messages Section */}
      <SuggestedMessagesSection onSelectSuggestion={handleSelectSuggestion} />

      {/* Public Q&A Showcase Feed */}
      <PublicQAFeed username={username || ""} />
    </div>
  );
};

export default SendMessagePage;

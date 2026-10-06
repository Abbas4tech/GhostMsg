"use client";

import { useParams } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { ThemeTogglerButton } from "@/components/animate-ui/components/buttons/theme-toggler";
import { SendMessageForm } from "@/components/profile/send-message-form";
import { SuggestedMessagesSection } from "@/components/profile/suggested-messages-section";
import { Text } from "@/components/ui/text";

const SendMessagePage = (): React.JSX.Element => {
  const { username } = useParams<{ username: string }>();
  const [selectedMessage, setSelectedMessage] = useState<string>("");

  const handleSelectSuggestion = (message: string) => {
    setSelectedMessage(message);
  };

  const handleMessageSent = () => {
    setSelectedMessage("");
  };

  return (
    <div className="container relative mx-auto flex flex-col gap-12 px-4 py-12">
      <ThemeTogglerButton
        className="absolute top-4 right-4"
        modes={["dark", "light"]}
      />
      <Text as={"h1"} className="text-center capitalize" variant={"h1"}>
        public profile link
      </Text>

      <SendMessageForm
        onMessageSent={handleMessageSent}
        selectedContent={selectedMessage}
        username={username || ""}
      />

      <SuggestedMessagesSection onSelectSuggestion={handleSelectSuggestion} />
    </div>
  );
};

export default SendMessagePage;

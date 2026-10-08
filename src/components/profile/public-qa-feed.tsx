"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Sparkles } from "lucide-react";
import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { messagesQueries } from "@/queries/messages.queries";

interface PublicQAFeedProps {
  username: string;
}

const SENTIMENT_BADGES: Record<
  string,
  { label: string; bg: string; text: string; icon: string }
> = {
  sweet: {
    label: "Sweet",
    bg: "bg-pink-500/10",
    text: "text-pink-600 dark:text-pink-400",
    icon: "💖",
  },
  curious: {
    label: "Curious",
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    icon: "🤔",
  },
  spicy: {
    label: "Spicy",
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    icon: "🔥",
  },
  advice: {
    label: "Advice",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: "💡",
  },
  neutral: {
    label: "Note",
    bg: "bg-muted",
    text: "text-muted-foreground",
    icon: "👻",
  },
};

export const PublicQAFeed = ({
  username,
}: PublicQAFeedProps): React.JSX.Element | null => {
  const { data: answersData, isLoading } = useQuery(
    messagesQueries.publicAnswers(username)
  );

  const answers = answersData?.answers || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (answers.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pt-6">
      <div className="flex items-center gap-2 border-b pb-3">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <Text as="h3" variant="h3">
          Public Answers & Confessions
        </Text>
        <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 font-semibold text-purple-600 text-xs dark:text-purple-400">
          {answers.length}
        </span>
      </div>

      <div className="space-y-4">
        {answers.map((item) => {
          const sentiment =
            SENTIMENT_BADGES[item.sentimentTag || "neutral"] ||
            SENTIMENT_BADGES.neutral;

          return (
            <Card className="overflow-hidden shadow-sm" key={item._id}>
              <CardHeader className="bg-muted/30 pb-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-xs ${sentiment.bg} ${sentiment.text}`}
                  >
                    <span>{sentiment.icon}</span>
                    {sentiment.label}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <CardTitle className="pt-2 font-medium text-base text-foreground">
                  "{item.content}"
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-600/10 text-purple-600">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-purple-600 text-xs dark:text-purple-400">
                      @{username}'s Answer:
                    </span>
                    <p className="text-foreground text-sm leading-relaxed">
                      {item.reply.text}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

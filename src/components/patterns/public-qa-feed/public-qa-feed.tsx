import { MessageSquare, Sparkles } from "lucide-react";
import type React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/elements/card";
import { Text } from "@/components/elements/text";
import {
  SentimentBadge,
  type SentimentType,
} from "@/components/patterns/sentiment-badge";

export interface PublicQaItem {
  _id: string;
  content: string;
  createdAt: string | Date;
  reply: { text: string };
  sentimentTag?: SentimentType;
}

export interface PublicQaFeedProps {
  answers: PublicQaItem[];
  isLoading?: boolean;
  username: string;
}

/** Public showcase of answered questions. Renders nothing when empty. */
export function PublicQaFeed({
  answers,
  isLoading = false,
  username,
}: PublicQaFeedProps): React.JSX.Element | null {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8" data-slot="public-qa-feed">
        <div
          aria-label="Loading public answers"
          className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"
          role="status"
        />
      </div>
    );
  }

  if (answers.length === 0) {
    return null;
  }

  return (
    <div
      className="mx-auto w-full max-w-2xl space-y-6 pt-6"
      data-slot="public-qa-feed"
    >
      <div className="flex items-center gap-2 border-b pb-3">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <Text as="h2" variant="h3">
          Public Answers &amp; Confessions
        </Text>
        <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 font-semibold text-purple-600 text-xs dark:text-purple-400">
          {answers.length}
        </span>
      </div>

      <div className="space-y-4">
        {answers.map((item) => (
          <Card className="overflow-hidden shadow-sm" key={item._id}>
            <CardHeader className="bg-muted/30 pb-3">
              <div className="flex items-center justify-between">
                <SentimentBadge sentiment={item.sentimentTag} size="sm" />
                <span className="text-muted-foreground text-xs">
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <CardTitle className="pt-2 font-medium text-base text-foreground">
                &ldquo;{item.content}&rdquo;
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-600/10 text-purple-600">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-purple-600 text-xs dark:text-purple-400">
                    @{username}&apos;s Answer:
                  </span>
                  <p className="text-foreground text-sm leading-relaxed">
                    {item.reply.text}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default PublicQaFeed;

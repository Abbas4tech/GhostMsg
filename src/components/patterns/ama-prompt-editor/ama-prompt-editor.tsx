"use client";

import { SparklesIcon } from "lucide-react";
import type React from "react";
import { useCallback, useId } from "react";
import { Button } from "@/components/elements/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/elements/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/elements/field";
import { Separator } from "@/components/elements/separator";
import { Spinner } from "@/components/elements/spinner";
import { Switch } from "@/components/elements/switch";
import { Textarea } from "@/components/elements/textarea";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/elements/toggle-group";
import { cn } from "@/lib/utils";

export const AMA_PROMPT_MAX_LENGTH = 120;

/** Counter turns to a warning past this many characters. */
const AMA_PROMPT_WARN_AT = 100;

export const AMA_PROMPT_IDEAS = [
  "Ask me anything",
  "Be honest with me",
] as const;

export interface AmaPromptEditorProps {
  /** Extra ideas from "Suggest with AI". */
  aiIdeas?: string[];
  isSuggesting?: boolean;
  onChange: (value: string) => void;
  onShowBannerChange: (show: boolean) => void;
  /** "Suggest with AI" (hidden when not provided). */
  onSuggest?: () => void;
  showBanner: boolean;
  value: string;
}

/** AMA Prompt card: text, quick ideas, AI ideas and "Show the AMA banner". */
export function AmaPromptEditor({
  value,
  aiIdeas = [],
  isSuggesting = false,
  showBanner,
  onChange,
  onSuggest,
  onShowBannerChange,
}: AmaPromptEditorProps): React.JSX.Element {
  const fieldId = useId();
  const counterId = useId();
  const switchId = useId();
  const ideas = [...AMA_PROMPT_IDEAS, ...aiIdeas];
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );
  const handleIdeaChange = useCallback(
    (idea: string) => {
      if (idea) {
        onChange(idea);
      }
    },
    [onChange]
  );

  return (
    <Card data-slot="ama-prompt-editor" variant="elevated">
      <CardHeader>
        <CardTitle>
          <h2 className="text-h2">AMA Prompt</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor={fieldId}>
                What do you want people to ask?
              </FieldLabel>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  value.length >= AMA_PROMPT_WARN_AT
                    ? "font-semibold text-destructive"
                    : "text-muted-foreground"
                )}
                id={counterId}
              >
                {value.length} / {AMA_PROMPT_MAX_LENGTH}
              </span>
            </div>
            <Textarea
              aria-describedby={counterId}
              className="min-h-24 resize-none bg-card text-body"
              id={fieldId}
              maxLength={AMA_PROMPT_MAX_LENGTH}
              onChange={handleChange}
              placeholder="Ask me anything about…"
              rows={3}
              value={value}
            />
          </Field>

          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              aria-label="Prompt ideas"
              onValueChange={handleIdeaChange}
              size="sm"
              spacing={2}
              type="single"
              value={ideas.includes(value) ? value : ""}
              variant="chip"
            >
              {ideas.map((idea) => (
                <ToggleGroupItem key={idea} value={idea}>
                  {idea}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {onSuggest ? (
              <Button
                className="rounded-full"
                disabled={isSuggesting}
                onClick={onSuggest}
                size="sm"
                variant="outline"
              >
                {isSuggesting ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <SparklesIcon data-icon="inline-start" />
                )}
                Suggest with AI
              </Button>
            ) : null}
          </div>

          <Separator />

          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor={switchId}>Show the AMA banner</FieldLabel>
              <FieldDescription>
                Off = your page shows only your name.
              </FieldDescription>
            </FieldContent>
            <Switch
              checked={showBanner}
              id={switchId}
              onCheckedChange={onShowBannerChange}
              size="xl"
            />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

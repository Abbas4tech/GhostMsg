"use client";

import { Loader2, Sparkles } from "lucide-react";
import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/elements/card";
import { Input } from "@/components/elements/input";
import { LiquidButton } from "@/components/elements/liquid-button";

export const AMA_PROMPT_MAX_LENGTH = 120;

export interface AmaPromptEditorProps {
  isSaving?: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
  value: string;
}

/** Editor card for the custom AMA banner shown on the public profile. */
export function AmaPromptEditor({
  value,
  isSaving = false,
  onChange,
  onSave,
}: AmaPromptEditorProps): React.JSX.Element {
  return (
    <Card data-slot="ama-prompt-editor">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Custom Profile Topic / AMA Banner
        </CardTitle>
        <CardDescription>
          Set a custom prompt or question displayed at the top of your public
          profile to inspire visitors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            aria-label="AMA prompt"
            maxLength={AMA_PROMPT_MAX_LENGTH}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., Ask me anything about my job, roast me, or share a secret!"
            value={value}
          />
          <div className="flex justify-between text-muted-foreground text-xs">
            <span>
              Try prompts like: &quot;Compliment or roast me&quot;, &quot;Ask me
              anything about tech&quot;
            </span>
            <span>
              {value.length} / {AMA_PROMPT_MAX_LENGTH}
            </span>
          </div>
        </div>

        <LiquidButton disabled={!value.trim() || isSaving} onClick={onSave}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Topic Banner"
          )}
        </LiquidButton>
      </CardContent>
    </Card>
  );
}

export default AmaPromptEditor;

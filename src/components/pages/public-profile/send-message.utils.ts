/** Separator the `/api/suggest-messages` endpoint uses between prompts. */
export const SUGGESTION_SEPARATOR = "||";

/** Splits the AI response into trimmed, non-empty suggestion prompts. */
export function parseSuggestions(raw: string | undefined | null): string[] {
  return (raw ?? "")
    .split(SUGGESTION_SEPARATOR)
    .map((suggestion) => suggestion.trim())
    .filter(Boolean);
}

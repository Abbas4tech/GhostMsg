import { usernameValidation } from "@/schemas/sign-up-schema";
import { z } from "@/schemas/zod";

// ── Profile (Identity card + AMA banner switch) ──────────────────────────────

export const DISPLAY_NAME_MAX_LENGTH = 40;
/** A 256px WebP/JPEG avatar is ~15–40 KB; the cap leaves headroom. */
export const AVATAR_DATA_URL_MAX_LENGTH = 350_000;
const AVATAR_DATA_URL_PATTERN =
  /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

export const displayNameSchema = z
  .string()
  .trim()
  .max(DISPLAY_NAME_MAX_LENGTH, "Display name must be 40 characters or fewer")
  .openapi({
    description: "Name shown on the public profile (empty = username)",
    example: "Maya",
  });

export const avatarDataUrlSchema = z
  .string()
  .max(AVATAR_DATA_URL_MAX_LENGTH, "Photo is too large")
  .regex(AVATAR_DATA_URL_PATTERN, "Photo must be a PNG, JPEG or WebP image")
  .openapi({
    description: "Square avatar as a base64 data URL (resized in the browser)",
    example: "data:image/webp;base64,UklGR…",
  });

export const userProfileSchema = z
  .object({
    username: z.string().openapi({ example: "maya_writes" }),
    email: z.string().openapi({ example: "maya@example.com" }),
    displayName: z.string().openapi({ example: "Maya" }),
    avatarUrl: z.string().nullable().openapi({ example: null }),
    amaPrompt: z.string().openapi({
      example: "Ask me anything about moving countries for work.",
    }),
    showAmaBanner: z.boolean().openapi({ example: true }),
  })
  .openapi("UserProfile");

export const getUserProfileResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    profile: userProfileSchema,
  })
  .openapi("GetUserProfileResponse");

export const updateUserProfileRequestSchema = z
  .object({
    displayName: displayNameSchema.optional(),
    /** Sent with the rest of the profile so Save is one atomic request. */
    amaPrompt: z.string().trim().min(1).max(120).optional().openapi({
      description: "AMA Prompt shown on the public profile",
      example: "Ask me anything about moving countries for work.",
    }),
    /** `null` removes the photo. */
    avatarUrl: avatarDataUrlSchema.nullable().optional(),
    showAmaBanner: z.boolean().optional(),
  })
  .openapi("UpdateUserProfileRequest");

export const updateUserProfileResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: "Profile updated" }),
    profile: userProfileSchema,
  })
  .openapi("UpdateUserProfileResponse");

export const changeUsernameRequestSchema = z
  .object({ username: usernameValidation })
  .openapi("ChangeUsernameRequest");

export const changeUsernameResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: "Username updated" }),
    username: z.string().openapi({ example: "maya_writes" }),
  })
  .openapi("ChangeUsernameResponse");

// ── Preferences (Messages + Safety sections) ─────────────────────────────────

export const QUARANTINE_SENSITIVITIES = [
  "relaxed",
  "balanced",
  "strict",
] as const;
export type QuarantineSensitivity = (typeof QUARANTINE_SENSITIVITIES)[number];

export const messagePreferencesSchema = z
  .object({
    offerSuggestions: z.boolean().openapi({
      description: "Show AI Suggested Messages to visitors",
      example: true,
    }),
    publishByDefault: z.boolean().openapi({
      description: "Smart Reply starts with 'Show in my Public Q&A' on",
      example: false,
    }),
  })
  .openapi("MessagePreferences");

export const safetySettingsSchema = z
  .object({
    quarantineEnabled: z.boolean().openapi({
      description: "Hold toxic and spam messages in Quarantined",
      example: true,
    }),
    sensitivity: z.enum(QUARANTINE_SENSITIVITIES).openapi({
      description: "How strict quarantine is",
      example: "balanced",
    }),
    blurSpicy: z.boolean().openapi({
      description: "Blur Spicy messages until opened",
      example: false,
    }),
  })
  .openapi("SafetySettings");

export const userPreferencesSchema = z
  .object({
    messages: messagePreferencesSchema,
    safety: safetySettingsSchema,
  })
  .openapi("UserPreferences");

export const getUserPreferencesResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    preferences: userPreferencesSchema,
  })
  .openapi("GetUserPreferencesResponse");

export const updateUserPreferencesRequestSchema = z
  .object({
    messages: messagePreferencesSchema.partial().optional(),
    safety: safetySettingsSchema.partial().optional(),
  })
  .openapi("UpdateUserPreferencesRequest");

export const updateUserPreferencesResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: "Preferences updated" }),
    preferences: userPreferencesSchema,
  })
  .openapi("UpdateUserPreferencesResponse");

// ── Data & account ───────────────────────────────────────────────────────────

export const deleteAllMessagesResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: "All messages deleted" }),
    deletedCount: z.number().int().openapi({ example: 24 }),
  })
  .openapi("DeleteAllMessagesResponse");

export const deleteAccountRequestSchema = z
  .object({
    confirmUsername: z.string().trim().min(1).openapi({
      description: "Must equal the account's username",
      example: "maya_writes",
    }),
  })
  .openapi("DeleteAccountRequest");

export const deleteAccountResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: "Account deleted" }),
  })
  .openapi("DeleteAccountResponse");

// ── AI: AMA prompt ideas ─────────────────────────────────────────────────────

export const amaSuggestionsRequestSchema = z
  .object({
    currentPrompt: z.string().trim().max(120).optional().openapi({
      description: "Riff on this prompt when given",
    }),
  })
  .openapi("AmaSuggestionsRequest");

export const amaSuggestionsResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    suggestions: z.array(z.string()).openapi({
      example: [
        "Ask me anything about switching careers",
        "Roast my music taste",
        "What should I read next?",
      ],
    }),
  })
  .openapi("AmaSuggestionsResponse");

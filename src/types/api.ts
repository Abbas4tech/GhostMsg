/**
 * Client-facing DTOs derived from the generated OpenAPI schema (ADR 0018, Q8).
 * These are the exact JSON shapes the API returns (ISO-string dates). Mongoose
 * model types stay in `src/server/models` and never reach client code.
 */
import type { components } from "@/generated/api-schema";

type Schemas = components["schemas"];

/** Inbox message as returned by `GET /api/get-messages`. */
export type MessageDto = Schemas["MessageItem"];
/** Recipient reply attached to a message (`null` when unanswered). */
export type MessageReplyDto = Schemas["MessageReply"];
/** Published Q&A item on `/u/[username]`. */
export type PublicAnswerDto = Schemas["PublicAnswerItem"];
/** Recipient notification preferences. */
export type NotificationSettingsDto = Schemas["NotificationSettings"];
/** Notification quiet-hours window. */
export type QuietHoursDto = Schemas["QuietHours"];
/** Identity card + AMA banner switch (`GET /api/user/profile`). */
export type UserProfileDto = Schemas["UserProfile"];
/** Messages + Safety settings (`GET /api/user/preferences`). */
export type UserPreferencesDto = Schemas["UserPreferences"];
/** A blocked Sender Hash with its block date (when known). */
export type BlockedSenderDto = Schemas["BlockedSender"];
/** Quarantine strictness. */
export type QuarantineSensitivity = UserPreferencesDto["safety"]["sensitivity"];
/** AI sentiment classification of a message. */
export type SentimentTag = MessageDto["sentimentTag"];

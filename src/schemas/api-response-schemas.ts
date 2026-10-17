import { z } from "@/schemas/zod";
import { messageReplySchema, sentimentTagEnum } from "./message-schema";

export const baseResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Operation successful" }),
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("BaseResponse");

export const errorResponseSchema = z
  .object({
    message: z.string().openapi({ example: "An error occurred" }),
    success: z.literal(false).openapi({ example: false }),
  })
  .openapi("ErrorResponse");

export const usernameUniqueResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Username is unique" }),
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("UsernameUniqueResponse");

export const signUpResponseSchema = z
  .object({
    message: z.string().openapi({
      example: "User registered successfully. Please verify your email",
    }),
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("SignUpResponse");

export const verifyCodeResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Account Verified Successfully!" }),
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("VerifyCodeResponse");

export const sendMessageResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Message sent successfully!" }),
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("SendMessageResponse");

export const suggestedMessagesResponseSchema = z
  .object({
    messages: z.string().openapi({
      example:
        "What is a skill you want to learn?||What is your favorite memory from this year?||If you could travel anywhere tomorrow, where would you go?",
    }),
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("SuggestedMessagesResponse");

export const messageItemSchema = z
  .object({
    _id: z.string().openapi({ example: "660c1d2e1b9d4c001f3e8a1a" }),
    content: z.string().openapi({ example: "Hey! Loved your recent project." }),
    createdAt: z.string().openapi({ example: "2026-10-06T12:00:00.000Z" }),
    isPinned: z.boolean().default(false),
    isQuarantined: z.boolean().default(false),
    isRead: z.boolean().default(false),
    reply: messageReplySchema.nullable().optional(),
    senderHash: z.string().optional(),
    sentimentTag: sentimentTagEnum.default("neutral"),
  })
  .openapi("MessageItem");

export const getMessagesResponseSchema = z
  .object({
    messages: z
      .array(messageItemSchema)
      .openapi({ description: "List of received messages" }),
    nextCursor: z.string().nullable().optional().openapi({
      description: "Pass as `cursor` for the next page; null on the last page",
      example: "2026-10-06T12:00:00.000Z_660c1d2e1b9d4c001f3e8a1a",
    }),
    success: z.boolean().openapi({ example: true }),
    total: z
      .number()
      .optional()
      .openapi({ description: "Messages matching the filter", example: 42 }),
  })
  .openapi("GetMessagesResponse");

export const inboxCountsSchema = z
  .object({
    all: z.number().int().openapi({ example: 24 }),
    answered: z.number().int().openapi({ example: 9 }),
    quarantined: z.number().int().openapi({ example: 2 }),
    starred: z.number().int().openapi({ example: 5 }),
    total: z.number().int().openapi({
      description: "Every message, quarantined included",
      example: 26,
    }),
    unread: z.number().int().openapi({ example: 3 }),
  })
  .openapi("InboxCounts");

export const inboxCountsResponseSchema = z
  .object({
    counts: inboxCountsSchema,
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("InboxCountsResponse");

export const acceptMessageGetResponseSchema = z
  .object({
    isAcceptingMessage: z.boolean().openapi({ example: true }),
    message: z
      .string()
      .openapi({ example: "Message acceptance status fetched successfully!" }),
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("AcceptMessageGetResponse");

export const acceptMessagePostResponseSchema = z
  .object({
    message: z
      .string()
      .openapi({ example: "Message acceptance status updated successfully!" }),
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("AcceptMessagePostResponse");

export const smartReplyResponseSchema = z
  .object({
    reply: z
      .string()
      .openapi({ example: "Haha, thanks for keeping me on my toes! 😉" }),
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("SmartReplyResponse");

export const publicAnswerItemSchema = z
  .object({
    _id: z.string(),
    content: z.string(),
    createdAt: z.string(),
    reply: z.object({
      publishedAt: z.string().optional(),
      text: z.string(),
    }),
    sentimentTag: sentimentTagEnum,
  })
  .openapi("PublicAnswerItem");

export const publicAnswersResponseSchema = z
  .object({
    amaPrompt: z.string().optional(),
    answers: z.array(publicAnswerItemSchema),
    avatarUrl: z.string().nullable().optional().openapi({ example: null }),
    displayName: z.string().optional().openapi({ example: "Maya" }),
    isAcceptingMessages: z.boolean().optional().openapi({
      description: "Message Acceptance: false shows the profile's paused state",
      example: true,
    }),
    offerSuggestions: z.boolean().optional().openapi({ example: true }),
    showAmaBanner: z.boolean().optional().openapi({ example: true }),
    success: z.boolean().openapi({ example: true }),
    username: z.string(),
  })
  .openapi("PublicAnswersResponse");

export const amaPromptResponseSchema = z
  .object({
    amaPrompt: z.string(),
    message: z
      .string()
      .openapi({ example: "AMA prompt updated successfully!" }),
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("AmaPromptResponse");

export const getBlockedSendersResponseSchema = z
  .object({
    blockedSenderHashes: z
      .array(z.string())
      .openapi({ description: "List of blocked sender cryptographic hashes" }),
    blockedSenders: z
      .array(
        z
          .object({
            blockedAt: z.string().optional().openapi({
              description:
                "ISO date (missing for blocks made before dates were kept)",
            }),
            hash: z.string(),
          })
          .openapi("BlockedSender")
      )
      .optional(),
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("GetBlockedSendersResponse");

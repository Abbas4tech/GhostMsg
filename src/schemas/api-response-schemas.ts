import { z } from "@/lib/openapi-zod";
import { messageReplySchema, sentimentTagEnum } from "./message-schema";

export const baseResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: "Operation successful" }),
  })
  .openapi("BaseResponse");

export const errorResponseSchema = z
  .object({
    success: z.literal(false).openapi({ example: false }),
    message: z.string().openapi({ example: "An error occurred" }),
  })
  .openapi("ErrorResponse");

export const usernameUniqueResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: "Username is unique" }),
  })
  .openapi("UsernameUniqueResponse");

export const signUpResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({
      example: "User registered successfully. Please verify your email",
    }),
  })
  .openapi("SignUpResponse");

export const verifyCodeResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: "Account Verified Successfully!" }),
  })
  .openapi("VerifyCodeResponse");

export const sendMessageResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: "Message sent successfully!" }),
  })
  .openapi("SendMessageResponse");

export const suggestedMessagesResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    messages: z.string().openapi({
      example:
        "What is a skill you want to learn?||What is your favorite memory from this year?||If you could travel anywhere tomorrow, where would you go?",
    }),
  })
  .openapi("SuggestedMessagesResponse");

export const messageItemSchema = z
  .object({
    _id: z.string().openapi({ example: "660c1d2e1b9d4c001f3e8a1a" }),
    content: z.string().openapi({ example: "Hey! Loved your recent project." }),
    sentimentTag: sentimentTagEnum.default("neutral"),
    isQuarantined: z.boolean().default(false),
    isPinned: z.boolean().default(false),
    isRead: z.boolean().default(false),
    reply: messageReplySchema.nullable().optional(),
    senderHash: z.string().optional(),
    createdAt: z.string().openapi({ example: "2026-10-06T12:00:00.000Z" }),
  })
  .openapi("MessageItem");

export const getMessagesResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    messages: z
      .array(messageItemSchema)
      .openapi({ description: "List of received messages" }),
    total: z.number().optional().openapi({ example: 42 }),
  })
  .openapi("GetMessagesResponse");

export const acceptMessageGetResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    isAcceptingMessage: z.boolean().openapi({ example: true }),
    message: z
      .string()
      .openapi({ example: "Message acceptance status fetched successfully!" }),
  })
  .openapi("AcceptMessageGetResponse");

export const acceptMessagePostResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z
      .string()
      .openapi({ example: "Message acceptance status updated successfully!" }),
  })
  .openapi("AcceptMessagePostResponse");

export const smartReplyResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    reply: z
      .string()
      .openapi({ example: "Haha, thanks for keeping me on my toes! 😉" }),
  })
  .openapi("SmartReplyResponse");

export const publicAnswerItemSchema = z
  .object({
    _id: z.string(),
    content: z.string(),
    sentimentTag: sentimentTagEnum,
    reply: z.object({
      text: z.string(),
      publishedAt: z.string().optional(),
    }),
    createdAt: z.string(),
  })
  .openapi("PublicAnswerItem");

export const publicAnswersResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    username: z.string(),
    amaPrompt: z.string().optional(),
    answers: z.array(publicAnswerItemSchema),
  })
  .openapi("PublicAnswersResponse");

export const amaPromptResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    amaPrompt: z.string(),
    message: z
      .string()
      .openapi({ example: "AMA prompt updated successfully!" }),
  })
  .openapi("AmaPromptResponse");

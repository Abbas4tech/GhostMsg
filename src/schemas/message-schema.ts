import { z } from "@/lib/openapi-zod";

export const sentimentTagEnum = z
  .enum(["sweet", "curious", "spicy", "advice", "neutral"])
  .openapi({
    description: "Emotional sentiment classification assigned to the message",
    example: "sweet",
  });

export const messageReplySchema = z
  .object({
    text: z.string().trim().min(1).max(1000).openapi({
      description: "Recipient's published reply text",
      example: "Thank you so much! Really appreciate the kind words.",
    }),
    isPublished: z.boolean().default(false).openapi({
      description: "Whether the reply is visible publicly on /u/[username]",
      example: true,
    }),
    publishedAt: z.string().datetime().optional().openapi({
      description: "ISO timestamp when the reply was published",
    }),
  })
  .openapi("MessageReply");

export const messageObjectSchema = z
  .object({
    _id: z.string().openapi({
      description: "Unique Message ID",
      example: "64e0a123bc4567def8901234",
    }),
    recipientId: z
      .string()
      .optional()
      .openapi({ description: "Recipient User ID" }),
    content: z.string().openapi({
      description: "Anonymous message text content",
      example: "You are doing an amazing job!",
    }),
    sentimentTag: sentimentTagEnum,
    isQuarantined: z.boolean().default(false).openapi({
      description:
        "Flag indicating whether the message was isolated by content moderation",
      example: false,
    }),
    isPinned: z.boolean().default(false).openapi({
      description: "Whether the message is starred/pinned by the recipient",
      example: false,
    }),
    isRead: z.boolean().default(false).openapi({
      description: "Whether the message has been viewed by the recipient",
      example: true,
    }),
    reply: messageReplySchema.nullable().optional(),
    senderHash: z.string().optional().openapi({
      description:
        "Cryptographic hash fingerprint of sender for recipient blocklists",
    }),
    createdAt: z.string().datetime().openapi({
      description: "Timestamp when the message was sent",
    }),
    updatedAt: z.string().datetime().optional(),
  })
  .openapi("Message");

export const messageSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(10, "content must be atleast of 10 characters")
      .max(300, "content must not be more than 300 characters")
      .openapi({
        description: "Anonymous message text content (10-300 characters)",
        example: "Hey! Just wanted to say you are doing great work.",
      }),
  })
  .openapi("MessageSchema");

export const sendMessageSchema = z
  .object({
    username: z.string().trim().min(1, "Username is required").openapi({
      description: "Recipient's public username",
      example: "johndoe",
    }),
    content: z
      .string()
      .trim()
      .min(10, "content must be atleast of 10 characters")
      .max(300, "content must not be more than 300 characters")
      .openapi({
        description: "Anonymous message text content (10-300 characters)",
        example: "Hey! Just wanted to say you are doing great work.",
      }),
  })
  .openapi("SendMessageRequest");

export const updateMessageSchema = z
  .object({
    isPinned: z
      .boolean()
      .optional()
      .openapi({ description: "Star/Pin status" }),
    isRead: z.boolean().optional().openapi({ description: "Read status" }),
  })
  .openapi("UpdateMessageRequest");

export const replyMessageSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(1, "Reply text cannot be empty")
      .max(1000)
      .openapi({
        description: "Author's response text",
        example: "Thanks a lot for the support!",
      }),
    isPublished: z.boolean().default(false).openapi({
      description:
        "Whether to publish this response to the public profile showcase",
      example: true,
    }),
  })
  .openapi("ReplyMessageRequest");

export const bulkActionSchema = z
  .object({
    action: z.enum(["delete", "read", "star"]).openapi({
      description: "Bulk operation to execute",
      example: "read",
    }),
    ids: z
      .array(z.string())
      .min(1, "Must select at least one message")
      .openapi({
        description: "Array of message IDs",
        example: ["64e0a123bc4567def8901234"],
      }),
  })
  .openapi("BulkActionRequest");

export const blockSenderSchema = z
  .object({
    senderHash: z.string().min(1, "Sender hash is required").openapi({
      description: "Cryptographic hash of the sender to block",
      example: "a8f5c...921",
    }),
  })
  .openapi("BlockSenderRequest");

export const smartReplySchema = z
  .object({
    content: z.string().min(1).openapi({
      description: "Original anonymous message content",
    }),
    tone: z
      .enum(["witty", "wholesome", "thoughtful"])
      .default("wholesome")
      .openapi({
        description: "Desired tone for the AI generated response",
        example: "witty",
      }),
  })
  .openapi("SmartReplyRequest");

export const amaPromptSchema = z
  .object({
    amaPrompt: z
      .string()
      .trim()
      .max(120, "AMA prompt must not exceed 120 characters")
      .openapi({
        description: "Custom profile banner prompt",
        example: "Ask me anything about tech, design, or life!",
      }),
  })
  .openapi("AmaPromptRequest");

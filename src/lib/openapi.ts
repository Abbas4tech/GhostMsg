import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/openapi-zod";
import { acceptMessageSchema } from "@/schemas/accept-message-schema";
import {
  acceptMessageGetResponseSchema,
  acceptMessagePostResponseSchema,
  amaPromptResponseSchema,
  baseResponseSchema,
  errorResponseSchema,
  getMessagesResponseSchema,
  messageItemSchema,
  publicAnswersResponseSchema,
  sendMessageResponseSchema,
  signUpResponseSchema,
  smartReplyResponseSchema,
  suggestedMessagesResponseSchema,
  usernameUniqueResponseSchema,
  verifyCodeResponseSchema,
} from "@/schemas/api-response-schemas";
import {
  amaPromptSchema,
  blockSenderSchema,
  bulkActionSchema,
  messageSchema,
  replyMessageSchema,
  sendMessageSchema,
  smartReplySchema,
  updateMessageSchema,
} from "@/schemas/message-schema";
import {
  getNotificationsResponseSchema,
  notificationSettingsSchema,
  pushSubscriptionRequestSchema,
  updateNotificationsRequestSchema,
  updateNotificationsResponseSchema,
} from "@/schemas/notification-schema";
import { signUpSchema, usernameQuerySchema } from "@/schemas/sign-up-schema";
import { verifyCodeRequestSchema, verifySchema } from "@/schemas/verify-schema";

const registry = new OpenAPIRegistry();

// Register Schemas
registry.register("BaseResponse", baseResponseSchema);
registry.register("ErrorResponse", errorResponseSchema);
registry.register("UsernameQuery", usernameQuerySchema);
registry.register("SignUpRequest", signUpSchema);
registry.register("SignUpResponse", signUpResponseSchema);
registry.register("VerifySchema", verifySchema);
registry.register("VerifyCodeRequest", verifyCodeRequestSchema);
registry.register("VerifyCodeResponse", verifyCodeResponseSchema);
registry.register("MessageSchema", messageSchema);
registry.register("SendMessageRequest", sendMessageSchema);
registry.register("SendMessageResponse", sendMessageResponseSchema);
registry.register("SuggestedMessagesResponse", suggestedMessagesResponseSchema);
registry.register("MessageItem", messageItemSchema);
registry.register("GetMessagesResponse", getMessagesResponseSchema);
registry.register("AcceptMessageRequest", acceptMessageSchema);
registry.register("AcceptMessageGetResponse", acceptMessageGetResponseSchema);
registry.register("AcceptMessagePostResponse", acceptMessagePostResponseSchema);
registry.register("UpdateMessageRequest", updateMessageSchema);
registry.register("ReplyMessageRequest", replyMessageSchema);
registry.register("BulkActionRequest", bulkActionSchema);
registry.register("BlockSenderRequest", blockSenderSchema);
registry.register("SmartReplyRequest", smartReplySchema);
registry.register("SmartReplyResponse", smartReplyResponseSchema);
registry.register("PublicAnswersResponse", publicAnswersResponseSchema);
registry.register("AmaPromptRequest", amaPromptSchema);
registry.register("AmaPromptResponse", amaPromptResponseSchema);
registry.register("NotificationSettings", notificationSettingsSchema);
registry.register("GetNotificationsResponse", getNotificationsResponseSchema);
registry.register(
  "UpdateNotificationsRequest",
  updateNotificationsRequestSchema
);
registry.register(
  "UpdateNotificationsResponse",
  updateNotificationsResponseSchema
);
registry.register("PushSubscriptionRequest", pushSubscriptionRequestSchema);

// Security Scheme for NextAuth session
const bearerAuth = registry.registerComponent(
  "securitySchemes",
  "SessionCookie",
  {
    type: "apiKey",
    in: "cookie",
    name: "next-auth.session-token",
    description: "NextAuth session cookie token",
  }
);

// 1. GET /api/check-username-unique
registry.registerPath({
  method: "get",
  path: "/api/check-username-unique",
  summary: "Check Username Uniqueness",
  description:
    "Check whether a prospective username is already taken by a verified user.",
  tags: ["Authentication & Verification"],
  request: {
    query: z.object({
      username: z.string().openapi({
        description: "Prospective username to check",
        example: "johndoe",
      }),
    }),
  },
  responses: {
    200: {
      description: "Username is available",
      content: {
        "application/json": {
          schema: usernameUniqueResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid format or username is already taken",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// 2. POST /api/sign-up
registry.registerPath({
  method: "post",
  path: "/api/sign-up",
  summary: "User Registration",
  description:
    "Register a new user account with credentials and dispatch a 6-digit verification email.",
  tags: ["Authentication & Verification"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: signUpSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
      content: {
        "application/json": {
          schema: signUpResponseSchema,
        },
      },
    },
    400: {
      description: "Username or email already taken",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: "Email dispatch failed or internal error",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// 3. POST /api/verify-code
registry.registerPath({
  method: "post",
  path: "/api/verify-code",
  summary: "Verify Email Code",
  description:
    "Validate the 6-digit verification code sent to the recipient's email.",
  tags: ["Authentication & Verification"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: verifyCodeRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Account verified successfully",
      content: {
        "application/json": {
          schema: verifyCodeResponseSchema,
        },
      },
    },
    400: {
      description: "Verification code expired",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// 4. POST /api/send-message
registry.registerPath({
  method: "post",
  path: "/api/send-message",
  summary: "Send Anonymous Message",
  description:
    "Submit an anonymous message with rate limiting, AI moderation, and sentiment analysis.",
  tags: ["Anonymous Messaging"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: sendMessageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Message delivered successfully",
      content: {
        "application/json": {
          schema: sendMessageResponseSchema,
        },
      },
    },
    429: {
      description: "Rate limit exceeded (Max 5 messages per 10 minutes)",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    404: {
      description: "Recipient not found or not accepting messages",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// 5. GET /api/suggest-messages
registry.registerPath({
  method: "get",
  path: "/api/suggest-messages",
  summary: "Get AI Suggested Prompts",
  description:
    "Generate 3 conversation-starter prompts via Gemini 2.5 Flash Lite on Edge runtime.",
  tags: ["Anonymous Messaging"],
  responses: {
    200: {
      description: "Suggested prompts returned successfully",
      content: {
        "application/json": {
          schema: suggestedMessagesResponseSchema,
        },
      },
    },
    500: {
      description: "AI generation failure",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// 6. GET /api/get-messages
registry.registerPath({
  method: "get",
  path: "/api/get-messages",
  summary: "Get User Inbox Messages",
  description:
    "Fetch received anonymous messages with search, filter, and pagination support.",
  tags: ["Dashboard & Inbox"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    query: z.object({
      status: z
        .enum(["all", "unread", "starred", "quarantined", "answered"])
        .optional()
        .openapi({ description: "Filter by message category", example: "all" }),
      q: z
        .string()
        .optional()
        .openapi({ description: "Search query string", example: "project" }),
      limit: z
        .string()
        .optional()
        .openapi({ description: "Limit number of results", example: "20" }),
      cursor: z
        .string()
        .optional()
        .openapi({ description: "Cursor for pagination" }),
    }),
  },
  responses: {
    200: {
      description: "List of messages sorted chronologically",
      content: {
        "application/json": {
          schema: getMessagesResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// 7. DELETE /api/delete-message/{messageId}
registry.registerPath({
  method: "delete",
  path: "/api/delete-message/{messageId}",
  summary: "Delete Inbox Message",
  description:
    "Delete a single anonymous message from the recipient inbox by its ID.",
  tags: ["Dashboard & Inbox"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      messageId: z.string().openapi({
        description: "MongoDB ObjectId of the message",
        example: "660c1d2e1b9d4c001f3e8a1a",
      }),
    }),
  },
  responses: {
    200: {
      description: "Message deleted successfully",
      content: {
        "application/json": {
          schema: baseResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    404: {
      description: "Message not found or already deleted",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// 8. PATCH /api/messages/{messageId}
registry.registerPath({
  method: "patch",
  path: "/api/messages/{messageId}",
  summary: "Update Message Attributes",
  description: "Update star (pin) or read status of a message.",
  tags: ["Dashboard & Inbox"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      messageId: z.string().openapi({ example: "660c1d2e1b9d4c001f3e8a1a" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateMessageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Message updated successfully",
      content: {
        "application/json": {
          schema: baseResponseSchema,
        },
      },
    },
    401: { description: "Unauthorized" },
    404: { description: "Message not found" },
    500: { description: "Internal server error" },
  },
});

// 9. POST /api/messages/{messageId}/reply
registry.registerPath({
  method: "post",
  path: "/api/messages/{messageId}/reply",
  summary: "Author & Publish Message Reply",
  description:
    "Author a reply to an anonymous message and optionally publish to public profile.",
  tags: ["Public Q&A"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      messageId: z.string().openapi({ example: "660c1d2e1b9d4c001f3e8a1a" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: replyMessageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Reply saved successfully",
      content: {
        "application/json": {
          schema: baseResponseSchema,
        },
      },
    },
    401: { description: "Unauthorized" },
    404: { description: "Message not found" },
    500: { description: "Internal server error" },
  },
});

// 10. POST /api/messages/bulk
registry.registerPath({
  method: "post",
  path: "/api/messages/bulk",
  summary: "Bulk Message Operations",
  description:
    "Batch mark as read, star, or delete multiple messages simultaneously.",
  tags: ["Dashboard & Inbox"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: bulkActionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Bulk operation executed successfully",
      content: {
        "application/json": {
          schema: baseResponseSchema,
        },
      },
    },
    400: { description: "Bad request" },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
});

// 11. POST /api/block-sender
registry.registerPath({
  method: "post",
  path: "/api/block-sender",
  summary: "Block Sender Fingerprint",
  description:
    "Add a cryptographic sender hash to the recipient's blocked list.",
  tags: ["Abuse Prevention"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: blockSenderSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Sender blocked successfully",
      content: {
        "application/json": {
          schema: baseResponseSchema,
        },
      },
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
});

// 12. GET /api/public/{username}/answers
registry.registerPath({
  method: "get",
  path: "/api/public/{username}/answers",
  summary: "Get Public Q&A Answers Feed",
  description:
    "Retrieve all published responses for a user's public profile link.",
  tags: ["Public Q&A"],
  request: {
    params: z.object({
      username: z.string().openapi({ example: "johndoe" }),
    }),
  },
  responses: {
    200: {
      description: "Public answers fetched successfully",
      content: {
        "application/json": {
          schema: publicAnswersResponseSchema,
        },
      },
    },
    404: { description: "User not found" },
    500: { description: "Internal server error" },
  },
});

// 13. POST /api/ai/smart-reply
registry.registerPath({
  method: "post",
  path: "/api/ai/smart-reply",
  summary: "Generate AI Smart Reply Draft",
  description:
    "Generate witty, wholesome, or thoughtful reply drafts via Gemini 2.5 Flash Lite.",
  tags: ["AI Assistant"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: smartReplySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Smart reply generated successfully",
      content: {
        "application/json": {
          schema: smartReplyResponseSchema,
        },
      },
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
});

// 14. PATCH /api/user/ama-prompt
registry.registerPath({
  method: "patch",
  path: "/api/user/ama-prompt",
  summary: "Update Custom AMA Prompt Banner",
  description:
    "Set the custom topic/banner displayed to visitors on /u/[username].",
  tags: ["Dashboard & Inbox"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: amaPromptSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "AMA prompt updated successfully",
      content: {
        "application/json": {
          schema: amaPromptResponseSchema,
        },
      },
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
});

// 15. GET /api/accept-message
registry.registerPath({
  method: "get",
  path: "/api/accept-message",
  summary: "Get Message Acceptance Status",
  description:
    "Check if the authenticated user is currently accepting anonymous messages.",
  tags: ["Dashboard & Inbox"],
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: "Acceptance status fetched successfully",
      content: {
        "application/json": {
          schema: acceptMessageGetResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// 16. POST /api/accept-message
registry.registerPath({
  method: "post",
  path: "/api/accept-message",
  summary: "Update Message Acceptance Status",
  description:
    "Toggle whether the recipient's profile is accepting anonymous messages.",
  tags: ["Dashboard & Inbox"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: acceptMessageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Status updated successfully",
      content: {
        "application/json": {
          schema: acceptMessagePostResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid payload",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// 17. GET /api/user/notifications
registry.registerPath({
  method: "get",
  path: "/api/user/notifications",
  summary: "Get Notification Settings",
  description:
    "Fetch the authenticated user's email alert and web push notification preferences.",
  tags: ["Dashboard & Inbox"],
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: "Notification settings fetched successfully",
      content: {
        "application/json": {
          schema: getNotificationsResponseSchema,
        },
      },
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
});

// 18. PATCH /api/user/notifications
registry.registerPath({
  method: "patch",
  path: "/api/user/notifications",
  summary: "Update Notification Settings",
  description:
    "Update email alert frequency (instant/daily/off) or toggle web push notifications.",
  tags: ["Dashboard & Inbox"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateNotificationsRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Notification settings updated successfully",
      content: {
        "application/json": {
          schema: updateNotificationsResponseSchema,
        },
      },
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
});

// 19. POST /api/user/push-subscription
registry.registerPath({
  method: "post",
  path: "/api/user/push-subscription",
  summary: "Register Web Push Subscription",
  description:
    "Store the browser's PushSubscription object so the server can dispatch push notifications.",
  tags: ["Dashboard & Inbox"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: pushSubscriptionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Push subscription registered successfully",
      content: {
        "application/json": {
          schema: baseResponseSchema,
        },
      },
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
});

export function getOpenApiSpec() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "GhostMsg API Reference",
      version: "2.2.1",
      description:
        "Comprehensive REST API documentation for GhostMsg anonymous messaging platform.",
      contact: {
        name: "GhostMsg Support",
      },
    },
    servers: [
      {
        url: "",
        description: "Current origin server",
      },
    ],
  });
}

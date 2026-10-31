import "server-only";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import { acceptMessageSchema } from "@/schemas/accept-message-schema";
import {
  acceptMessageGetResponseSchema,
  acceptMessagePostResponseSchema,
  amaPromptResponseSchema,
  baseResponseSchema,
  errorResponseSchema,
  getBlockedSendersResponseSchema,
  getMessagesResponseSchema,
  inboxCountsResponseSchema,
  messageItemSchema,
  publicAnswersResponseSchema,
  resendCodeResponseSchema,
  sendMessageResponseSchema,
  signUpResponseSchema,
  smartReplyDraftSchema,
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
  dailyDigestRunResponseSchema,
  getNotificationsResponseSchema,
  notificationSettingsSchema,
  pushSubscriptionRequestSchema,
  pushUnsubscribeRequestSchema,
  updateNotificationsRequestSchema,
  updateNotificationsResponseSchema,
} from "@/schemas/notification-schema";
import { signUpSchema, usernameQuerySchema } from "@/schemas/sign-up-schema";
import {
  amaSuggestionsRequestSchema,
  amaSuggestionsResponseSchema,
  changeUsernameRequestSchema,
  changeUsernameResponseSchema,
  deleteAccountRequestSchema,
  deleteAccountResponseSchema,
  deleteAllMessagesResponseSchema,
  getUserPreferencesResponseSchema,
  getUserProfileResponseSchema,
  updateUserPreferencesRequestSchema,
  updateUserPreferencesResponseSchema,
  updateUserProfileRequestSchema,
  updateUserProfileResponseSchema,
} from "@/schemas/user-settings-schema";
import {
  resendCodeRequestSchema,
  verifyCodeRequestSchema,
  verifySchema,
} from "@/schemas/verify-schema";
import { z } from "@/schemas/zod";

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
registry.register("ResendCodeRequest", resendCodeRequestSchema);
registry.register("ResendCodeResponse", resendCodeResponseSchema);
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
registry.register("SmartReplyDraft", smartReplyDraftSchema);
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
registry.register("PushUnsubscribeRequest", pushUnsubscribeRequestSchema);
registry.register("GetBlockedSendersResponse", getBlockedSendersResponseSchema);

// Security Scheme for NextAuth session
const bearerAuth = registry.registerComponent(
  "securitySchemes",
  "SessionCookie",
  {
    description: "NextAuth session cookie token",
    in: "cookie",
    name: "next-auth.session-token",
    type: "apiKey",
  }
);

// 1. GET /api/check-username-unique
registry.registerPath({
  description:
    "Check whether a prospective username is already taken by a verified user.",
  method: "get",
  path: "/api/check-username-unique",
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
      content: {
        "application/json": {
          schema: usernameUniqueResponseSchema,
        },
      },
      description: "Username is available",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Invalid format or username is already taken",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal Server Error",
    },
  },
  summary: "Check Username Uniqueness",
  tags: ["Authentication & Verification"],
});

// 2. POST /api/sign-up
registry.registerPath({
  description:
    "Register a new user account with credentials and dispatch a 6-digit verification email.",
  method: "post",
  path: "/api/sign-up",
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
      content: {
        "application/json": {
          schema: signUpResponseSchema,
        },
      },
      description: "User registered successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Username or email already taken",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Email dispatch failed or internal error",
    },
  },
  summary: "User Registration",
  tags: ["Authentication & Verification"],
});

// 3. POST /api/verify-code
registry.registerPath({
  description:
    "Validate the 6-digit verification code sent to the recipient's email.",
  method: "post",
  path: "/api/verify-code",
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
      content: {
        "application/json": {
          schema: verifyCodeResponseSchema,
        },
      },
      description: "Account verified successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Verification code expired",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "User not found",
    },
    429: {
      content: {
        "application/json": {
          schema: verifyCodeResponseSchema,
        },
      },
      description: "No tries left for this code: request a new one",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
  summary: "Verify Email Code",
  tags: ["Authentication & Verification"],
});

// 3b. POST /api/verify-code/resend
registry.registerPath({
  description:
    "Email a new Verification Code and reset the tries. At most once a minute (429 with retryAfterSeconds).",
  method: "post",
  path: "/api/verify-code/resend",
  request: {
    body: {
      content: {
        "application/json": {
          schema: resendCodeRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: resendCodeResponseSchema,
        },
      },
      description: "New code sent",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Missing username or already verified",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "User not found",
    },
    429: {
      content: {
        "application/json": {
          schema: resendCodeResponseSchema,
        },
      },
      description: "Too soon or too many: wait retryAfterSeconds",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Email dispatch failed or internal error",
    },
  },
  summary: "Resend Verification Code",
  tags: ["Authentication & Verification"],
});

// 4. POST /api/send-message
registry.registerPath({
  description:
    "Submit an anonymous message with rate limiting, AI moderation, and sentiment analysis.",
  method: "post",
  path: "/api/send-message",
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
      content: {
        "application/json": {
          schema: sendMessageResponseSchema,
        },
      },
      description: "Message delivered successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Recipient not found or not accepting messages",
    },
    429: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Rate limit exceeded (Max 5 messages per 10 minutes)",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
  summary: "Send Anonymous Message",
  tags: ["Anonymous Messaging"],
});

// 5. GET /api/suggest-messages
registry.registerPath({
  description:
    "Generate 3 conversation-starter prompts via Gemini 2.5 Flash Lite on Edge runtime.",
  method: "get",
  path: "/api/suggest-messages",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: suggestedMessagesResponseSchema,
        },
      },
      description: "Suggested prompts returned successfully",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "AI generation failure",
    },
  },
  summary: "Get AI Suggested Prompts",
  tags: ["Anonymous Messaging"],
});

// 6. GET /api/get-messages
registry.registerPath({
  description:
    "Fetch received anonymous messages with search, filter, and pagination support.",
  method: "get",
  path: "/api/get-messages",
  request: {
    query: z.object({
      cursor: z
        .string()
        .optional()
        .openapi({ description: "`nextCursor` from the previous page" }),
      limit: z.string().optional().openapi({
        description: "Page size 1-100 (default 12)",
        example: "30",
      }),
      q: z
        .string()
        .optional()
        .openapi({ description: "Search query string", example: "project" }),
      status: z
        .enum([
          "all",
          "unread",
          "starred",
          "quarantined",
          "answered",
          "archived",
          "any",
        ])
        .optional()
        .openapi({
          description:
            "Inbox filter (default all = not quarantined); any = every message",
          example: "all",
        }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: getMessagesResponseSchema,
        },
      },
      description: "List of messages sorted chronologically",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Get User Inbox Messages",
  tags: ["Dashboard & Inbox"],
});

// 7. DELETE /api/delete-message/{messageId}
registry.registerPath({
  description:
    "Delete a single anonymous message from the recipient inbox by its ID.",
  method: "delete",
  path: "/api/delete-message/{messageId}",
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
      content: {
        "application/json": {
          schema: baseResponseSchema,
        },
      },
      description: "Message deleted successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Message not found or already deleted",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Delete Inbox Message",
  tags: ["Dashboard & Inbox"],
});

// 8. PATCH /api/messages/{messageId}
registry.registerPath({
  description: "Update star (pin) or read status of a message.",
  method: "patch",
  path: "/api/messages/{messageId}",
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateMessageSchema,
        },
      },
    },
    params: z.object({
      messageId: z.string().openapi({ example: "660c1d2e1b9d4c001f3e8a1a" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: baseResponseSchema,
        },
      },
      description: "Message updated successfully",
    },
    401: { description: "Unauthorized" },
    404: { description: "Message not found" },
    500: { description: "Internal server error" },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Update Message Attributes",
  tags: ["Dashboard & Inbox"],
});

// 9. POST /api/messages/{messageId}/reply
registry.registerPath({
  description:
    "Author a reply to an anonymous message and optionally publish to public profile. Answering also marks the message read.",
  method: "post",
  path: "/api/messages/{messageId}/reply",
  request: {
    body: {
      content: {
        "application/json": {
          schema: replyMessageSchema,
        },
      },
    },
    params: z.object({
      messageId: z.string().openapi({ example: "660c1d2e1b9d4c001f3e8a1a" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: baseResponseSchema,
        },
      },
      description: "Reply saved successfully",
    },
    401: { description: "Unauthorized" },
    404: { description: "Message not found" },
    500: { description: "Internal server error" },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Author & Publish Message Reply",
  tags: ["Public Q&A"],
});

// 10. POST /api/messages/bulk
registry.registerPath({
  description:
    "Batch mark as read, star, or delete multiple messages simultaneously.",
  method: "post",
  path: "/api/messages/bulk",
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
      content: {
        "application/json": {
          schema: baseResponseSchema,
        },
      },
      description: "Bulk operation executed successfully",
    },
    400: { description: "Bad request" },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Bulk Message Operations",
  tags: ["Dashboard & Inbox"],
});

// 11a. GET /api/block-sender
registry.registerPath({
  description:
    "Retrieve list of all blocked sender hashes for the authenticated recipient.",
  method: "get",
  path: "/api/block-sender",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: getBlockedSendersResponseSchema,
        },
      },
      description: "Blocked senders fetched successfully",
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Get Blocked Sender Fingerprints",
  tags: ["Abuse Prevention"],
});

// 11b. POST /api/block-sender
registry.registerPath({
  description:
    "Add a cryptographic sender hash to the recipient's blocked list.",
  method: "post",
  path: "/api/block-sender",
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
      content: {
        "application/json": {
          schema: baseResponseSchema,
        },
      },
      description: "Sender blocked successfully",
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Block Sender Fingerprint",
  tags: ["Abuse Prevention"],
});

// 11c. DELETE /api/block-sender
registry.registerPath({
  description:
    "Remove a cryptographic sender hash from the recipient's blocked list, or pass 'ALL' to clear all.",
  method: "delete",
  path: "/api/block-sender",
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
      content: {
        "application/json": {
          schema: baseResponseSchema,
        },
      },
      description: "Sender unblocked successfully",
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Unblock Sender Fingerprint",
  tags: ["Abuse Prevention"],
});

// 12. GET /api/public/{username}/answers
registry.registerPath({
  description:
    "Public profile (display name, photo, AMA Prompt, acceptance, banner and suggestion settings) plus up to 50 published answers, newest published first.",
  method: "get",
  path: "/api/public/{username}/answers",
  request: {
    params: z.object({
      username: z.string().openapi({ example: "johndoe" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: publicAnswersResponseSchema,
        },
      },
      description: "Public answers fetched successfully",
    },
    404: { description: "User not found" },
    500: { description: "Internal server error" },
  },
  summary: "Get Public Q&A Answers Feed",
  tags: ["Public Q&A"],
});

// 13. POST /api/ai/smart-reply
registry.registerPath({
  description:
    "Generate three Smart Reply drafts (thoughtful, witty, wholesome) in one Gemini 2.5 Flash Lite call. Falls back to stock drafts when AI is unavailable.",
  method: "post",
  path: "/api/ai/smart-reply",
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
      content: {
        "application/json": {
          schema: smartReplyResponseSchema,
        },
      },
      description: "Three drafts, one per tone",
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Generate AI Smart Reply Drafts",
  tags: ["AI Assistant"],
});

// 14. PATCH /api/user/ama-prompt
registry.registerPath({
  description:
    "Legacy: set the AMA Prompt shown to visitors on /u/[username]. The app saves it with PATCH /api/user/profile (amaPrompt) instead.",
  method: "patch",
  path: "/api/user/ama-prompt",
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
      content: {
        "application/json": {
          schema: amaPromptResponseSchema,
        },
      },
      description: "AMA prompt updated successfully",
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Update Custom AMA Prompt Banner",
  tags: ["Dashboard & Inbox"],
});

// 15. GET /api/accept-message
registry.registerPath({
  description:
    "Check if the authenticated user is currently accepting anonymous messages.",
  method: "get",
  path: "/api/accept-message",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: acceptMessageGetResponseSchema,
        },
      },
      description: "Acceptance status fetched successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "User not found",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Get Message Acceptance Status",
  tags: ["Dashboard & Inbox"],
});

// 16. POST /api/accept-message
registry.registerPath({
  description:
    "Toggle whether the recipient's profile is accepting anonymous messages.",
  method: "post",
  path: "/api/accept-message",
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
      content: {
        "application/json": {
          schema: acceptMessagePostResponseSchema,
        },
      },
      description: "Status updated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Invalid payload",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Update Message Acceptance Status",
  tags: ["Dashboard & Inbox"],
});

// 17. GET /api/user/notifications
registry.registerPath({
  description:
    "Fetch the authenticated user's email alert and web push notification preferences.",
  method: "get",
  path: "/api/user/notifications",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: getNotificationsResponseSchema,
        },
      },
      description: "Notification settings fetched successfully",
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Get Notification Settings",
  tags: ["Dashboard & Inbox"],
});

// 18. PATCH /api/user/notifications
registry.registerPath({
  description:
    "Update email alert frequency (instant/daily/off) or toggle web push notifications.",
  method: "patch",
  path: "/api/user/notifications",
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
      content: {
        "application/json": {
          schema: updateNotificationsResponseSchema,
        },
      },
      description: "Notification settings updated successfully",
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Update Notification Settings",
  tags: ["Dashboard & Inbox"],
});

// 19. POST /api/user/push-subscription
registry.registerPath({
  description:
    "Store the browser's PushSubscription object so the server can dispatch push notifications.",
  method: "post",
  path: "/api/user/push-subscription",
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
      content: {
        "application/json": {
          schema: baseResponseSchema,
        },
      },
      description: "Push subscription registered successfully",
    },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Register Web Push Subscription",
  tags: ["Dashboard & Inbox"],
});

// 20. DELETE /api/user/push-subscription
registry.registerPath({
  description:
    "Forget this device's PushSubscription so the server stops sending it notifications. When no device is left, notificationSettings.webPushEnabled becomes false.",
  method: "delete",
  path: "/api/user/push-subscription",
  request: {
    body: {
      content: {
        "application/json": {
          schema: pushUnsubscribeRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: baseResponseSchema,
        },
      },
      description: "Push subscription removed",
    },
    400: { description: "Invalid payload" },
    401: { description: "Unauthorized" },
    500: { description: "Internal server error" },
  },
  security: [{ [bearerAuth.name]: [] }],
  summary: "Remove Web Push Subscription",
  tags: ["Dashboard & Inbox"],
});

// ── Profile & Settings (ADR 0022) ────────────────────────────────────────────

const authed = { security: [{ [bearerAuth.name]: [] }] };
const json = <T extends z.ZodType>(schema: T) => ({
  content: { "application/json": { schema } },
});
const AUTH_ERRORS = {
  401: { description: "Unauthorized" },
  500: { description: "Internal server error" },
};

// 21. GET /api/user/profile
registry.registerPath({
  description: "Identity card fields and the AMA banner switch.",
  method: "get",
  path: "/api/user/profile",
  summary: "Get Profile",
  tags: ["Profile & Settings"],
  ...authed,
  responses: {
    200: { description: "Profile", ...json(getUserProfileResponseSchema) },
    404: { description: "User not found" },
    ...AUTH_ERRORS,
  },
});

// 22. PATCH /api/user/profile
registry.registerPath({
  description:
    "Partial update in one request: display name, photo (data URL, or null to remove), AMA Prompt and AMA banner switch.",
  method: "patch",
  path: "/api/user/profile",
  summary: "Update Profile",
  tags: ["Profile & Settings"],
  ...authed,
  request: { body: json(updateUserProfileRequestSchema) },
  responses: {
    200: {
      description: "Profile updated",
      ...json(updateUserProfileResponseSchema),
    },
    400: { description: "Invalid payload" },
    ...AUTH_ERRORS,
  },
});

// 23. PATCH /api/user/username
registry.registerPath({
  description: "Changes the username and so the Public Profile Link.",
  method: "patch",
  path: "/api/user/username",
  summary: "Change Username",
  tags: ["Profile & Settings"],
  ...authed,
  request: { body: json(changeUsernameRequestSchema) },
  responses: {
    200: {
      description: "Username updated",
      ...json(changeUsernameResponseSchema),
    },
    400: { description: "Invalid username" },
    409: { description: "Username already taken" },
    ...AUTH_ERRORS,
  },
});

// 24. GET /api/user/preferences
registry.registerPath({
  description: "Messages and Safety settings.",
  method: "get",
  path: "/api/user/preferences",
  summary: "Get Preferences",
  tags: ["Profile & Settings"],
  ...authed,
  responses: {
    200: {
      description: "Preferences",
      ...json(getUserPreferencesResponseSchema),
    },
    ...AUTH_ERRORS,
  },
});

// 25. PATCH /api/user/preferences
registry.registerPath({
  description: "Partial update of Messages and Safety settings.",
  method: "patch",
  path: "/api/user/preferences",
  summary: "Update Preferences",
  tags: ["Profile & Settings"],
  ...authed,
  request: { body: json(updateUserPreferencesRequestSchema) },
  responses: {
    200: {
      description: "Preferences updated",
      ...json(updateUserPreferencesResponseSchema),
    },
    400: { description: "Invalid payload" },
    ...AUTH_ERRORS,
  },
});

// 26. DELETE /api/messages
registry.registerPath({
  description: "Danger zone: deletes every message and so every public answer.",
  method: "delete",
  path: "/api/messages",
  summary: "Delete All Messages",
  tags: ["Profile & Settings"],
  ...authed,
  responses: {
    200: {
      description: "Messages deleted",
      ...json(deleteAllMessagesResponseSchema),
    },
    ...AUTH_ERRORS,
  },
});

// 27. DELETE /api/user
registry.registerPath({
  description:
    "Deletes the account, its link and messages. Requires the typed username.",
  method: "delete",
  path: "/api/user",
  summary: "Delete Account",
  tags: ["Profile & Settings"],
  ...authed,
  request: { body: json(deleteAccountRequestSchema) },
  responses: {
    200: {
      description: "Account deleted",
      ...json(deleteAccountResponseSchema),
    },
    400: { description: "Username did not match" },
    404: { description: "User not found" },
    ...AUTH_ERRORS,
  },
});

// 28. POST /api/ai/ama-suggestions
registry.registerPath({
  description:
    "Three short AMA Prompt ideas from Gemini (fixed ideas without a key).",
  method: "post",
  path: "/api/ai/ama-suggestions",
  summary: "Suggest AMA Prompts",
  tags: ["AI Assistant"],
  ...authed,
  request: { body: json(amaSuggestionsRequestSchema) },
  responses: {
    200: { description: "Suggestions", ...json(amaSuggestionsResponseSchema) },
    ...AUTH_ERRORS,
  },
});

// 30. GET /api/messages/counts
registry.registerPath({
  description:
    "Count of messages for every inbox filter plus the overall total, independent of paging.",
  method: "get",
  path: "/api/messages/counts",
  summary: "Get Inbox Counts",
  tags: ["Dashboard & Inbox"],
  ...authed,
  responses: {
    200: { description: "Counts", ...json(inboxCountsResponseSchema) },
    ...AUTH_ERRORS,
  },
});

// ── Operations (scheduler only, ADR 0029) ────────────────────────────────────

const cronAuth = registry.registerComponent("securitySchemes", "CronSecret", {
  description: "`Authorization: Bearer <CRON_SECRET>` (sent by Vercel Cron)",
  scheme: "bearer",
  type: "http",
});

// 29. GET /api/cron/daily-digest
registry.registerPath({
  description:
    "Emails a summary to every recipient with emailAlerts = daily: new non-quarantined messages since their last digest, text only when they show message text. Skips recipients inside quiet hours. Scheduler only.",
  method: "get",
  path: "/api/cron/daily-digest",
  responses: {
    200: { description: "Run summary", ...json(dailyDigestRunResponseSchema) },
    401: { description: "Missing or wrong bearer secret" },
    500: { description: "Internal server error" },
    503: { description: "CRON_SECRET is not configured" },
  },
  security: [{ [cronAuth.name]: [] }],
  summary: "Run Daily Digest",
  tags: ["Operations"],
});

export function getOpenApiSpec() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    info: {
      contact: {
        name: "GhostMsg Support",
      },
      description:
        "Comprehensive REST API documentation for GhostMsg anonymous messaging platform.",
      title: "GhostMsg API Reference",
      version: "2.2.1",
    },
    openapi: "3.1.0",
    servers: [
      {
        description: "Current origin server",
        url: "",
      },
    ],
  });
}

/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY.
 * Generated from src/lib/openapi.ts by openapi-typescript.
 * Run "npm run typegen" to regenerate.
 */

export interface paths {
  "/api/accept-message": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Message Acceptance Status
     * @description Check if the authenticated user is currently accepting anonymous messages.
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Acceptance status fetched successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["AcceptMessageGetResponse"];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description User not found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
    put?: never;
    /**
     * Update Message Acceptance Status
     * @description Toggle whether the recipient's profile is accepting anonymous messages.
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["AcceptMessageRequest"];
        };
      };
      responses: {
        /** @description Status updated successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["AcceptMessagePostResponse"];
          };
        };
        /** @description Invalid payload */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/ai/smart-reply": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Generate AI Smart Reply Draft
     * @description Generate witty, wholesome, or thoughtful reply drafts via Gemini 2.5 Flash Lite.
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["SmartReplyRequest"];
        };
      };
      responses: {
        /** @description Smart reply generated successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["SmartReplyResponse"];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/block-sender": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Block Sender Fingerprint
     * @description Add a cryptographic sender hash to the recipient's blocked list.
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["BlockSenderRequest"];
        };
      };
      responses: {
        /** @description Sender blocked successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["BaseResponse"];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/check-username-unique": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Check Username Uniqueness
     * @description Check whether a prospective username is already taken by a verified user.
     */
    get: {
      parameters: {
        query: {
          /** @description Prospective username to check */
          username: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Username is available */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["UsernameUniqueResponse"];
          };
        };
        /** @description Invalid format or username is already taken */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Internal Server Error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/delete-message/{messageId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /**
     * Delete Inbox Message
     * @description Delete a single anonymous message from the recipient inbox by its ID.
     */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description MongoDB ObjectId of the message */
          messageId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Message deleted successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["BaseResponse"];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Message not found or already deleted */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/get-messages": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get User Inbox Messages
     * @description Fetch received anonymous messages with search, filter, and pagination support.
     */
    get: {
      parameters: {
        query?: {
          /** @description Filter by message category */
          status?: "all" | "unread" | "starred" | "quarantined" | "answered";
          /** @description Search query string */
          q?: string;
          /** @description Limit number of results */
          limit?: string;
          /** @description Cursor for pagination */
          cursor?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description List of messages sorted chronologically */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["GetMessagesResponse"];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/messages/{messageId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /**
     * Update Message Attributes
     * @description Update star (pin) or read status of a message.
     */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          messageId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["UpdateMessageRequest"];
        };
      };
      responses: {
        /** @description Message updated successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["BaseResponse"];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Message not found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    trace?: never;
  };
  "/api/messages/{messageId}/reply": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Author & Publish Message Reply
     * @description Author a reply to an anonymous message and optionally publish to public profile.
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          messageId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["ReplyMessageRequest"];
        };
      };
      responses: {
        /** @description Reply saved successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["BaseResponse"];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Message not found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/messages/bulk": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Bulk Message Operations
     * @description Batch mark as read, star, or delete multiple messages simultaneously.
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["BulkActionRequest"];
        };
      };
      responses: {
        /** @description Bulk operation executed successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["BaseResponse"];
          };
        };
        /** @description Bad request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/public/{username}/answers": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Public Q&A Answers Feed
     * @description Retrieve all published responses for a user's public profile link.
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          username: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Public answers fetched successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["PublicAnswersResponse"];
          };
        };
        /** @description User not found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/send-message": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Send Anonymous Message
     * @description Submit an anonymous message with rate limiting, AI moderation, and sentiment analysis.
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["SendMessageRequest"];
        };
      };
      responses: {
        /** @description Message delivered successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["SendMessageResponse"];
          };
        };
        /** @description Recipient not found or not accepting messages */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Rate limit exceeded (Max 5 messages per 10 minutes) */
        429: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/sign-up": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * User Registration
     * @description Register a new user account with credentials and dispatch a 6-digit verification email.
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["SignUpRequest"];
        };
      };
      responses: {
        /** @description User registered successfully */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["SignUpResponse"];
          };
        };
        /** @description Username or email already taken */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Email dispatch failed or internal error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/suggest-messages": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get AI Suggested Prompts
     * @description Generate 3 conversation-starter prompts via Gemini 2.5 Flash Lite on Edge runtime.
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Suggested prompts returned successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["SuggestedMessagesResponse"];
          };
        };
        /** @description AI generation failure */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/user/ama-prompt": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /**
     * Update Custom AMA Prompt Banner
     * @description Set the custom topic/banner displayed to visitors on /u/[username].
     */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["AmaPromptRequest"];
        };
      };
      responses: {
        /** @description AMA prompt updated successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["AmaPromptResponse"];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    trace?: never;
  };
  "/api/user/notifications": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Notification Settings
     * @description Fetch the authenticated user's email alert and web push notification preferences.
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Notification settings fetched successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["GetNotificationsResponse"];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /**
     * Update Notification Settings
     * @description Update email alert frequency (instant/daily/off) or toggle web push notifications.
     */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["UpdateNotificationsRequest"];
        };
      };
      responses: {
        /** @description Notification settings updated successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["UpdateNotificationsResponse"];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    trace?: never;
  };
  "/api/user/push-subscription": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Register Web Push Subscription
     * @description Store the browser's PushSubscription object so the server can dispatch push notifications.
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["PushSubscriptionRequest"];
        };
      };
      responses: {
        /** @description Push subscription registered successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["BaseResponse"];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/verify-code": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Verify Email Code
     * @description Validate the 6-digit verification code sent to the recipient's email.
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["VerifyCodeRequest"];
        };
      };
      responses: {
        /** @description Account verified successfully */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["VerifyCodeResponse"];
          };
        };
        /** @description Verification code expired */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description User not found */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Internal server error */
        500: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  headers: never;
  parameters: never;
  pathItems: never;
  requestBodies: never;
  responses: never;
  schemas: {
    BaseResponse: {
      /** @example true */
      success: boolean;
      /** @example Operation successful */
      message: string;
    };
    ErrorResponse: {
      /**
       * @example false
       * @enum {boolean}
       */
      success: false;
      /** @example An error occurred */
      message: string;
    };
    UsernameQuery: {
      /**
       * @description Unique username (alphanumeric and underscore, 2-20 characters)
       * @example johndoe
       */
      username: string;
    };
    SignUpRequest: {
      /**
       * @description Unique username (alphanumeric and underscore, 2-20 characters)
       * @example johndoe
       */
      username: string;
      /**
       * Format: email
       * @description User's email address
       * @example johndoe@example.com
       */
      email: string;
      /**
       * @description Password (minimum 6 characters)
       * @example SecurePass123!
       */
      password: string;
    };
    SignUpResponse: {
      /** @example true */
      success: boolean;
      /** @example User registered successfully. Please verify your email */
      message: string;
    };
    VerifySchema: {
      /**
       * @description 6-digit numerical verification code
       * @example 123456
       */
      code: string;
    };
    VerifyCodeRequest: {
      /**
       * @description Username to verify
       * @example johndoe
       */
      username: string;
      /**
       * @description 6-digit numerical verification code
       * @example 123456
       */
      code: string;
    };
    VerifyCodeResponse: {
      /** @example true */
      success: boolean;
      /** @example Account Verified Successfully! */
      message: string;
    };
    MessageSchema: {
      /**
       * @description Anonymous message text content (10-300 characters)
       * @example Hey! Just wanted to say you are doing great work.
       */
      content: string;
    };
    SendMessageRequest: {
      /**
       * @description Recipient's public username
       * @example johndoe
       */
      username: string;
      /**
       * @description Anonymous message text content (10-300 characters)
       * @example Hey! Just wanted to say you are doing great work.
       */
      content: string;
    };
    SendMessageResponse: {
      /** @example true */
      success: boolean;
      /** @example Message sent successfully! */
      message: string;
    };
    SuggestedMessagesResponse: {
      /** @example true */
      success: boolean;
      /** @example What is a skill you want to learn?||What is your favorite memory from this year?||If you could travel anywhere tomorrow, where would you go? */
      messages: string;
    };
    MessageItem: {
      /** @example 660c1d2e1b9d4c001f3e8a1a */
      _id: string;
      /** @example Hey! Loved your recent project. */
      content: string;
      /**
       * @description Emotional sentiment classification assigned to the message
       * @default neutral
       * @example sweet
       * @enum {string}
       */
      sentimentTag: "sweet" | "curious" | "spicy" | "advice" | "neutral";
      /** @default false */
      isQuarantined: boolean;
      /** @default false */
      isPinned: boolean;
      /** @default false */
      isRead: boolean;
      reply?: components["schemas"]["MessageReply"];
      senderHash?: string;
      /** @example 2026-10-06T12:00:00.000Z */
      createdAt: string;
    };
    MessageReply: {
      /**
       * @description Recipient's published reply text
       * @example Thank you so much! Really appreciate the kind words.
       */
      text: string;
      /**
       * @description Whether the reply is visible publicly on /u/[username]
       * @default false
       * @example true
       */
      isPublished: boolean;
      /**
       * Format: date-time
       * @description ISO timestamp when the reply was published
       */
      publishedAt?: string;
    } | null;
    GetMessagesResponse: {
      /** @example true */
      success: boolean;
      /** @description List of received messages */
      messages: components["schemas"]["MessageItem"][];
      /** @example 42 */
      total?: number;
    };
    AcceptMessageRequest: {
      /**
       * @description Whether the user's public profile is open to receiving messages
       * @example true
       */
      acceptMessages: boolean;
    };
    AcceptMessageGetResponse: {
      /** @example true */
      success: boolean;
      /** @example true */
      isAcceptingMessage: boolean;
      /** @example Message acceptance status fetched successfully! */
      message: string;
    };
    AcceptMessagePostResponse: {
      /** @example true */
      success: boolean;
      /** @example Message acceptance status updated successfully! */
      message: string;
    };
    UpdateMessageRequest: {
      /** @description Star/Pin status */
      isPinned?: boolean;
      /** @description Read status */
      isRead?: boolean;
    };
    ReplyMessageRequest: {
      /**
       * @description Author's response text
       * @example Thanks a lot for the support!
       */
      text: string;
      /**
       * @description Whether to publish this response to the public profile showcase
       * @default false
       * @example true
       */
      isPublished: boolean;
    };
    BulkActionRequest: {
      /**
       * @description Bulk operation to execute
       * @example read
       * @enum {string}
       */
      action: "delete" | "read" | "star";
      /**
       * @description Array of message IDs
       * @example [
       *       "64e0a123bc4567def8901234"
       *     ]
       */
      ids: string[];
    };
    BlockSenderRequest: {
      /**
       * @description Cryptographic hash of the sender to block
       * @example a8f5c...921
       */
      senderHash: string;
    };
    SmartReplyRequest: {
      /** @description Original anonymous message content */
      content: string;
      /**
       * @description Desired tone for the AI generated response
       * @default wholesome
       * @example witty
       * @enum {string}
       */
      tone: "witty" | "wholesome" | "thoughtful";
    };
    SmartReplyResponse: {
      /** @example true */
      success: boolean;
      /** @example Haha, thanks for keeping me on my toes! 😉 */
      reply: string;
    };
    PublicAnswersResponse: {
      /** @example true */
      success: boolean;
      username: string;
      amaPrompt?: string;
      answers: components["schemas"]["PublicAnswerItem"][];
    };
    PublicAnswerItem: {
      _id: string;
      content: string;
      /**
       * @description Emotional sentiment classification assigned to the message
       * @example sweet
       * @enum {string}
       */
      sentimentTag: "sweet" | "curious" | "spicy" | "advice" | "neutral";
      reply: {
        text: string;
        publishedAt?: string;
      };
      createdAt: string;
    };
    AmaPromptRequest: {
      /**
       * @description Custom profile banner prompt
       * @example Ask me anything about tech, design, or life!
       */
      amaPrompt: string;
    };
    AmaPromptResponse: {
      /** @example true */
      success: boolean;
      amaPrompt: string;
      /** @example AMA prompt updated successfully! */
      message: string;
    };
    NotificationSettings: {
      /**
       * @description Email alert frequency preference
       * @default instant
       * @example instant
       * @enum {string}
       */
      emailAlerts: "instant" | "daily" | "off";
      /**
       * @description Whether browser push notifications are enabled on this device
       * @default false
       * @example false
       */
      webPushEnabled: boolean;
    };
    GetNotificationsResponse: {
      /** @example true */
      success: boolean;
      notificationSettings: components["schemas"]["NotificationSettings"];
      isAcceptingMessage?: boolean;
    };
    UpdateNotificationsRequest: {
      /**
       * @description Email alert frequency preference
       * @enum {string}
       */
      emailAlerts?: "instant" | "daily" | "off";
      /** @description Enable/disable browser push notifications */
      webPushEnabled?: boolean;
    };
    UpdateNotificationsResponse: {
      /** @example true */
      success: boolean;
      /** @example Notification settings updated successfully! */
      message: string;
      notificationSettings?: components["schemas"]["NotificationSettings"];
    };
    PushSubscriptionRequest: {
      /**
       * Format: uri
       * @description Push service endpoint URL provided by the browser
       * @example https://fcm.googleapis.com/fcm/send/...
       */
      endpoint: string;
      keys?: {
        /** @description ECDH public key */
        p256dh: string;
        /** @description Authentication secret */
        auth: string;
      };
    };
    UsernameUniqueResponse: {
      /** @example true */
      success: boolean;
      /** @example Username is unique */
      message: string;
    };
  };
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;

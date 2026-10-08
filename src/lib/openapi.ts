import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/openapi-zod";
import { acceptMessageSchema } from "@/schemas/accept-message-schema";
import {
  acceptMessageGetResponseSchema,
  acceptMessagePostResponseSchema,
  baseResponseSchema,
  errorResponseSchema,
  getMessagesResponseSchema,
  messageItemSchema,
  sendMessageResponseSchema,
  signUpResponseSchema,
  suggestedMessagesResponseSchema,
  usernameUniqueResponseSchema,
  verifyCodeResponseSchema,
} from "@/schemas/api-response-schemas";
import { messageSchema, sendMessageSchema } from "@/schemas/message-schema";
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
    "Submit an anonymous message to a recipient's public profile link.",
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
    "Fetch all received anonymous messages for the authenticated user.",
  tags: ["Dashboard & Inbox"],
  security: [{ [bearerAuth.name]: [] }],
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
      description: "Unauthorized - User not logged in",
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

// 8. GET /api/accept-message
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

// 9. POST /api/accept-message
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

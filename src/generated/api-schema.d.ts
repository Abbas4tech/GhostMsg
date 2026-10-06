/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY.
 * Generated from src/lib/openapi.ts by openapi-typescript.
 * Run "npm run typegen" to regenerate.
 */

export interface paths {
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
         * @description Submit an anonymous message to a recipient's public profile link.
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
    "/api/get-messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get User Inbox Messages
         * @description Fetch all received anonymous messages for the authenticated user.
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
                /** @description List of messages sorted chronologically */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GetMessagesResponse"];
                    };
                };
                /** @description Unauthorized - User not logged in */
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
}
export type webhooks = Record<string, never>;
export interface components {
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
            /** @example 2026-10-06T12:00:00.000Z */
            createdAt: string;
        };
        GetMessagesResponse: {
            /** @example true */
            success: boolean;
            /** @description List of received messages */
            messages: components["schemas"]["MessageItem"][];
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
        UsernameUniqueResponse: {
            /** @example true */
            success: boolean;
            /** @example Username is unique */
            message: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;


import { z } from "@/lib/openapi-zod";

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
    username: z.string().trim().openapi({
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

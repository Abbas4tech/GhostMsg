import { z } from "@/schemas/zod";

export const acceptMessageSchema = z
  .object({
    acceptMessages: z.boolean().openapi({
      description:
        "Whether the user's public profile is open to receiving messages",
      example: true,
    }),
  })
  .openapi("AcceptMessageRequest");

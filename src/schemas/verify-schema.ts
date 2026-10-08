import { z } from "@/lib/openapi-zod";

export const verifySchema = z
  .object({
    code: z.string().length(6, "Verification code must be 6 digits").openapi({
      description: "6-digit numerical verification code",
      example: "123456",
    }),
  })
  .openapi("VerifySchema");

export const verifyCodeRequestSchema = z
  .object({
    username: z.string().trim().openapi({
      description: "Username to verify",
      example: "johndoe",
    }),
    code: z.string().length(6, "Verification code must be 6 digits").openapi({
      description: "6-digit numerical verification code",
      example: "123456",
    }),
  })
  .openapi("VerifyCodeRequest");

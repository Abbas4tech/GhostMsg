import { z } from "@/schemas/zod";

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
    code: z.string().length(6, "Verification code must be 6 digits").openapi({
      description: "6-digit numerical verification code",
      example: "123456",
    }),
    username: z.string().trim().openapi({
      description: "Username to verify",
      example: "johndoe",
    }),
  })
  .openapi("VerifyCodeRequest");

export const resendCodeRequestSchema = z
  .object({
    username: z.string().trim().min(1).openapi({
      description: "Username whose Verification Code to resend",
      example: "johndoe",
    }),
  })
  .openapi("ResendCodeRequest");

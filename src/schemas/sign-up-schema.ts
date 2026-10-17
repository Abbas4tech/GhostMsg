import { z } from "@/schemas/zod";

export const usernameValidation = z
  .string()
  .trim()
  .min(2, "Username must be atleast 2 characters")
  .max(20, "Username must be no more than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters")
  .openapi({
    description:
      "Unique username (alphanumeric and underscore, 2-20 characters)",
    example: "johndoe",
  });

export const usernameQuerySchema = z
  .object({
    username: usernameValidation,
  })
  .openapi("UsernameQuery");

export const signUpSchema = z
  .object({
    email: z.string().trim().email("Invalid email address").openapi({
      description: "User's email address",
      example: "johndoe@example.com",
    }),
    password: z
      .string()
      .trim()
      .min(6, "password must be atleast 6 characters")
      .openapi({
        description: "Password (minimum 6 characters)",
        example: "SecurePass123!",
      }),
    username: usernameValidation,
  })
  .openapi("SignUpRequest");

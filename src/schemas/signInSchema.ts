import z from "zod";

export const signInSchema = z.object({
  identifier: z.string().trim(),
  password: z.string().trim().min(6, "password must be atleast 6 characters"),
});

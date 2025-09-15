import z from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(10, "content must be atleast of 10 characters")
    .max(300, "content must not be more than 300 characters"),
});

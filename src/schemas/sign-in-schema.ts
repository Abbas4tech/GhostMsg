import z from "zod";

export const signInSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Username or email is required")
    .superRefine((val, ctx) => {
      if (val.includes("@")) {
        if (!z.string().email().safeParse(val).success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid email address",
          });
        }
      } else if (val.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Username must be at least 2 characters",
        });
      }
    }),
  password: z.string().trim().min(6, "password must be atleast 6 characters"),
});

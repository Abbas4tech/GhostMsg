"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { VerifyCodeValues } from "@/components/patterns/verify-code-form";
import { useVerifyCodeMutation } from "@/data/auth/use-verify-code-mutation";
import { verifySchema } from "@/schemas/verify-schema";

export function useVerifyController(username: string) {
  const router = useRouter();
  const verifyMutation = useVerifyCodeMutation();

  const form = useForm<VerifyCodeValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
    mode: "onSubmit",
  });

  const { mutateAsync } = verifyMutation;
  const handleSubmit = useCallback(
    async ({ code }: VerifyCodeValues) => {
      try {
        const res = await mutateAsync({ username, code });
        if (res?.success) {
          toast.success(res.message);
          router.replace("/sign-in");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        toast.error(message || "Verification failed");
      }
    },
    [mutateAsync, router, username]
  );

  return {
    form,
    handleSubmit,
    isSubmitting: verifyMutation.isPending,
  };
}

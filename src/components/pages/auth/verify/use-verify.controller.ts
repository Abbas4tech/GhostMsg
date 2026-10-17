"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { VerifyCodeValues } from "@/components/patterns/verify-code-form";
import { useVerifyCodeMutation } from "@/data/auth/use-verify-code-mutation";
import { verifySchema } from "@/schemas/verify-schema";

export function useVerifyController(username: string) {
  const router = useRouter();
  const verifyMutation = useVerifyCodeMutation();
  const [codeError, setCodeError] = useState<string | null>(null);

  const form = useForm<VerifyCodeValues>({
    defaultValues: { code: "" },
    mode: "onChange",
    resolver: zodResolver(verifySchema),
  });

  const codeValue = form.watch("code");
  // biome-ignore lint/correctness/useExhaustiveDependencies: codeValue drives the reset, intentionally unread in the body
  useEffect(() => {
    setCodeError(null);
  }, [codeValue]);

  const { mutateAsync } = verifyMutation;
  const handleSubmit = useCallback(
    async ({ code }: VerifyCodeValues) => {
      setCodeError(null);
      try {
        const res = await mutateAsync({ code, username });
        if (res?.success) {
          toast.success(res.message);
          router.replace("/sign-in");
        } else {
          const errorMsg = res?.message || "That code isn't right.";
          setCodeError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        const errorMsg = message || "That code isn't right.";
        setCodeError(errorMsg);
        toast.error(errorMsg);
      }
    },
    [mutateAsync, router, username]
  );

  return {
    codeError,
    form,
    handleSubmit,
    isSubmitting: verifyMutation.isPending,
  };
}

import { useCallback, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";

interface useAcceptMessageReturn {
  form: UseFormReturn<
    {
      acceptMessages: boolean;
    },
    unknown,
    {
      acceptMessages: boolean;
    }
  >;
  toggleAcceptMessage: () => Promise<void>;
}

export const useAcceptMessage = (): useAcceptMessageReturn => {
  const form = useForm<z.infer<typeof acceptMessageSchema>>({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: {
      acceptMessages: true,
    },
  });

  const fetchInitialStatus = useCallback(async () => {
    try {
      const res = await axios.get<ApiResponse>("/api/accept-message");

      form.setValue("acceptMessages", Boolean(res.data.isAcceptingMessage));
    } catch (error) {
      const e = error as AxiosError<ApiResponse>;
      toast.error(e.response?.data.message || "Failed to update status");
    }
  }, [form]);

  useEffect(() => {
    fetchInitialStatus();
  }, []);

  const toggleAcceptMessage = useCallback(async () => {
    try {
      const acceptMessages = form.getValues("acceptMessages");
      const res = await axios.post<ApiResponse>("/api/accept-message", {
        acceptMessages: !acceptMessages,
      });

      form.setValue("acceptMessages", !acceptMessages);
      toast.success(res.data.message);
    } catch (error) {
      const e = error as AxiosError<ApiResponse>;
      toast.error(e.response?.data.message || "Failed to update status");
    }
  }, [form]);

  return { form, toggleAcceptMessage };
};

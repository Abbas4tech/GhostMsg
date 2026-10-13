import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";
import type { components } from "@/generated/api-schema";

type UpdatePreferencesBody =
  components["schemas"]["UpdateUserPreferencesRequest"];
type PreferencesResponse = components["schemas"]["GetUserPreferencesResponse"];

/** Messages + Safety switches. Optimistic so switches move at once. */
export function useUpdatePreferencesMutation() {
  const queryClient = useQueryClient();
  const key = queryKeys.user.preferences();

  return useMutation({
    mutationFn: (body: UpdatePreferencesBody) =>
      clientFetch(api.PATCH("/api/user/preferences", { body })),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<PreferencesResponse>(key);
      if (previous) {
        queryClient.setQueryData<PreferencesResponse>(key, {
          ...previous,
          preferences: {
            messages: { ...previous.preferences.messages, ...body.messages },
            safety: { ...previous.preferences.safety, ...body.safety },
          },
        });
      }
      return { previous };
    },
    onError: (error, _body, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
      toast.error(error.message || "Couldn't save that setting");
    },
    onSuccess: (data) => {
      queryClient.setQueryData<PreferencesResponse>(key, {
        success: true,
        preferences: data.preferences,
      });
    },
  });
}

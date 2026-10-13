import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";
import type { components } from "@/generated/api-schema";

type UpdateProfileBody = components["schemas"]["UpdateUserProfileRequest"];
type ProfileResponse = components["schemas"]["GetUserProfileResponse"];

/** Display name, photo and "Show the AMA banner". Optimistic, rolls back. */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const key = queryKeys.user.profile();

  return useMutation({
    mutationFn: (body: UpdateProfileBody) =>
      clientFetch(api.PATCH("/api/user/profile", { body })),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ProfileResponse>(key);
      if (previous) {
        queryClient.setQueryData<ProfileResponse>(key, {
          ...previous,
          profile: { ...previous.profile, ...body },
        });
      }
      return { previous };
    },
    onError: (error, _body, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
      toast.error(error.message || "Couldn't save your profile");
    },
    onSuccess: (data) => {
      queryClient.setQueryData<ProfileResponse>(key, {
        success: true,
        profile: data.profile,
      });
    },
    onSettled: () => {
      // The public profile shows the same fields.
      queryClient.invalidateQueries({ queryKey: queryKeys.public.all });
    },
  });
}

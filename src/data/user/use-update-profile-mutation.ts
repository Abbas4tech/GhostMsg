import { api, clientFetch } from "@/data/api-client";
import { useOptimisticResourceMutation } from "@/data/optimistic-resource-mutation";
import { queryKeys } from "@/data/query-keys";
import type { components } from "@/generated/api-schema";

export type UpdateProfileBody =
  components["schemas"]["UpdateUserProfileRequest"];
type ProfileResponse = components["schemas"]["GetUserProfileResponse"];

/**
 * Display name, photo, AMA Prompt and "Show the AMA banner" in one atomic
 * request. Optimistic with rollback; refreshes the public profile too.
 */
export const useUpdateProfileMutation = () =>
  useOptimisticResourceMutation<ProfileResponse, UpdateProfileBody, unknown>({
    queryKey: queryKeys.user.profile(),
    scopeId: "user-profile",
    mutationFn: (body) => clientFetch(api.PATCH("/api/user/profile", { body })),
    merge: (data, body) => ({ ...data, profile: { ...data.profile, ...body } }),
    errorMessage: "Couldn't save your profile",
    successMessage: () => "Profile saved",
    alsoInvalidate: [queryKeys.public.all],
  });

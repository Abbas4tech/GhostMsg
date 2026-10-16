import { api, clientFetch } from "@/data/api-client";
import { useOptimisticResourceMutation } from "@/data/optimistic-resource-mutation";
import { queryKeys } from "@/data/query-keys";
import type { components } from "@/generated/api-schema";

type UpdatePreferencesBody =
  components["schemas"]["UpdateUserPreferencesRequest"];
type PreferencesResponse = components["schemas"]["GetUserPreferencesResponse"];

/** Messages + Safety switches. Optimistic so switches move at once; silent. */
export const useUpdatePreferencesMutation = () =>
  useOptimisticResourceMutation<
    PreferencesResponse,
    UpdatePreferencesBody,
    unknown
  >({
    queryKey: queryKeys.user.preferences(),
    scopeId: "user-preferences",
    mutationFn: (body) =>
      clientFetch(api.PATCH("/api/user/preferences", { body })),
    merge: (data, body) => ({
      ...data,
      preferences: {
        messages: { ...data.preferences.messages, ...body.messages },
        safety: { ...data.preferences.safety, ...body.safety },
      },
    }),
    errorMessage: "Couldn't save that setting",
    // Suggestions on/off changes what visitors see.
    alsoInvalidate: [queryKeys.public.all],
  });

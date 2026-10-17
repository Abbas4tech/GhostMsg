import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export interface OptimisticResourceMutationOptions<TData, TVariables, TResult> {
  /** Extra caches to refresh once this resource has settled (e.g. public pages). */
  alsoInvalidate?: QueryKey[];
  /** Toast when the server rejects the change (the server message wins). */
  errorMessage: string;
  /** Applies the change to the cached resource. Pure. */
  merge: (data: TData, variables: TVariables) => TData;
  mutationFn: (variables: TVariables) => Promise<TResult>;
  /** The cached resource this mutation edits. */
  queryKey: QueryKey;
  /**
   * Serialises every mutation of this resource (TanStack `scope`): each change
   * shows at once (optimistic), but requests reach the server in order.
   */
  scopeId: string;
  /** Optional confirmation toast; switches and drafts stay silent. */
  successMessage?: (result: TResult) => string | undefined;
}

/**
 * The one shape for optimistic edits of a single cached resource (settings
 * switches, profile, Message Acceptance):
 *
 * 1. `onMutate` cancels in-flight reads, snapshots, applies `merge`.
 * 2. `onError` rolls back to the snapshot only if no later change of the
 *    same resource is still pending (it would otherwise erase that change);
 *    the final refetch reconciles instead.
 * 3. `onSettled` refetches only when the last pending change has settled,
 *    so rapid toggles don't flicker through intermediate server states.
 */
export function useOptimisticResourceMutation<TData, TVariables, TResult>({
  queryKey,
  scopeId,
  mutationFn,
  merge,
  errorMessage,
  successMessage,
  alsoInvalidate = [],
}: OptimisticResourceMutationOptions<TData, TVariables, TResult>) {
  const queryClient = useQueryClient();
  const mutationKey = ["optimistic-resource", scopeId];
  // During onError/onSettled the current mutation still counts as pending.
  const isLastPending = () => queryClient.isMutating({ mutationKey }) <= 1;

  return useMutation({
    mutationFn,
    mutationKey,
    onError: (error, _variables, context) => {
      if (isLastPending() && context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(error.message || errorMessage);
    },
    onMutate: async (variables: TVariables) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TData>(queryKey);
      if (previous !== undefined) {
        queryClient.setQueryData<TData>(queryKey, merge(previous, variables));
      }
      return { previous };
    },
    onSettled: async () => {
      if (!isLastPending()) {
        return;
      }
      await Promise.all(
        [queryKey, ...alsoInvalidate].map((key) =>
          queryClient.invalidateQueries({ queryKey: key })
        )
      );
    },
    onSuccess: (result) => {
      const message = successMessage?.(result);
      if (message) {
        toast.success(message);
      }
    },
    scope: { id: scopeId },
  });
}

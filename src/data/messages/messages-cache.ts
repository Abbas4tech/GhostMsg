import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { queryKeys } from "@/data/query-keys";
import type { MessageDto } from "@/types/api";

interface MessagesListData {
  messages: MessageDto[];
  success: boolean;
  total?: number;
}

export type MessagesCacheSnapshot = [QueryKey, MessagesListData | undefined][];

/** Every cached inbox list (any filter combination). */
const LIST_FILTER = { queryKey: [...queryKeys.messages.all, "list"] };

/**
 * Optimistically rewrites every cached inbox list and returns a snapshot for
 * rollback. In-flight list fetches are cancelled first so they can't overwrite
 * the optimistic state with stale server data.
 */
export async function updateCachedMessages(
  queryClient: QueryClient,
  update: (messages: MessageDto[]) => MessageDto[]
): Promise<MessagesCacheSnapshot> {
  await queryClient.cancelQueries(LIST_FILTER);
  const snapshot = queryClient.getQueriesData<MessagesListData>(LIST_FILTER);

  queryClient.setQueriesData<MessagesListData>(LIST_FILTER, (data) => {
    if (!data?.messages) {
      return data;
    }
    const messages = update(data.messages);
    const removed = data.messages.length - messages.length;
    return {
      ...data,
      messages,
      total: data.total === undefined ? undefined : data.total - removed,
    };
  });

  return snapshot;
}

/** Restores the lists captured by `updateCachedMessages`. */
export function restoreCachedMessages(
  queryClient: QueryClient,
  snapshot: MessagesCacheSnapshot | undefined
): void {
  for (const [key, data] of snapshot ?? []) {
    queryClient.setQueryData(key, data);
  }
}

/** Re-syncs every inbox list with the server after a mutation settles. */
export function invalidateCachedMessages(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
}

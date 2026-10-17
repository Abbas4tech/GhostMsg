import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { queryKeys } from "@/data/query-keys";
import type { MessageDto, MessagesPageDto } from "@/types/api";

/** A cached inbox list: paged (`useInfiniteQuery`) or a single page. */
type MessagesListData = InfiniteData<MessagesPageDto> | MessagesPageDto;

export type MessagesCacheSnapshot = [QueryKey, MessagesListData | undefined][];

/** Every cached inbox list (any filter combination). */
const LIST_FILTER = { queryKey: [...queryKeys.messages.all, "list"] };

const isPaged = (
  data: MessagesListData
): data is InfiniteData<MessagesPageDto> => "pages" in data;

/** Applies `update` to every page and keeps each page's `total` in step. */
function updateListData(
  data: MessagesListData | undefined,
  update: (messages: MessageDto[]) => MessageDto[]
): MessagesListData | undefined {
  if (!data) {
    return data;
  }
  const pages = isPaged(data) ? data.pages : [data];
  const updatedPages = pages.map((page) => ({
    messages: update(page.messages ?? []),
    page,
  }));
  const removed = updatedPages.reduce(
    (sum, { page, messages }) => sum + (page.messages.length - messages.length),
    0
  );
  const nextPages = updatedPages.map(({ page, messages }) => ({
    ...page,
    messages,
    total: page.total === undefined ? undefined : page.total - removed,
  }));
  return isPaged(data) ? { ...data, pages: nextPages } : nextPages[0];
}

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

  queryClient.setQueriesData<MessagesListData>(LIST_FILTER, (data) =>
    updateListData(data, update)
  );

  return snapshot;
}

/** Applies `patch` to one message in every cached list. */
export const patchCachedMessage = (
  queryClient: QueryClient,
  messageId: string,
  patch: Partial<MessageDto>
): Promise<MessagesCacheSnapshot> =>
  updateCachedMessages(queryClient, (messages) =>
    messages.map((message) =>
      String(message._id) === messageId ? { ...message, ...patch } : message
    )
  );

/** Restores the lists captured by `updateCachedMessages`. */
export function restoreCachedMessages(
  queryClient: QueryClient,
  snapshot: MessagesCacheSnapshot | undefined
): void {
  for (const [key, data] of snapshot ?? []) {
    queryClient.setQueryData(key, data);
  }
}

/** Re-syncs every inbox list and the counts with the server. */
export function invalidateCachedMessages(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
}

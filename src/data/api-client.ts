import createClient from "openapi-fetch";
import type { paths } from "@/generated/api-schema";

export class ApiError extends Error {
  readonly details?: unknown;
  readonly status: number;

  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export const api = createClient<paths>({
  baseUrl: "",
});

export type ApiPaths = paths;

/**
 * Type-safe unwrapper for openapi-fetch calls.
 * Returns the response data directly on success, or throws an ApiError with HTTP status.
 */
export async function clientFetch<TData, TError extends { message?: string }>(
  requestPromise: Promise<{
    data?: TData;
    error?: TError;
    response: Response;
  }>
): Promise<TData> {
  const { data, error, response } = await requestPromise;

  if (error || !data) {
    const message =
      error?.message || `HTTP ${response?.status || 500}: Request failed`;
    throw new ApiError(message, response?.status ?? 500, error);
  }

  return data;
}

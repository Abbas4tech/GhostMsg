import { delay, HttpResponse } from "msw";
import type { paths } from "@/generated/api-schema";

type HttpMethod = "get" | "post" | "patch" | "delete";

/**
 * The 200 JSON body for an OpenAPI path + method. Handlers are typed with this,
 * so an API contract change breaks the handler at compile time (ADR 0016, Q10).
 */
export type ApiOk<
  P extends keyof paths,
  M extends HttpMethod,
> = paths[P][M] extends {
  responses: { 200: { content: { "application/json": infer Body } } };
}
  ? Body
  : never;

/** The 201 JSON body for an OpenAPI path + method (e.g. `POST /api/sign-up`). */
export type ApiCreated<
  P extends keyof paths,
  M extends HttpMethod,
> = paths[P][M] extends {
  responses: { 201: { content: { "application/json": infer Body } } };
}
  ? Body
  : never;

const PATH_PARAM_REGEX = /\{(\w+)\}/g;

/** Converts an OpenAPI path (`/api/messages/{messageId}`) to an MSW path (`/api/messages/:messageId`). */
export const mswPath = (path: keyof paths): string =>
  path.replace(PATH_PARAM_REGEX, ":$1");

/** Typed JSON 200 response for a path + method. */
export const ok = <P extends keyof paths, M extends HttpMethod>(
  _path: P,
  _method: M,
  body: ApiOk<P, M>
) => HttpResponse.json(body as Record<string, unknown>);

/** Typed JSON 201 response for a path + method. */
export const created = <P extends keyof paths, M extends HttpMethod>(
  _path: P,
  _method: M,
  body: ApiCreated<P, M>
) => HttpResponse.json(body as Record<string, unknown>, { status: 201 });

/** Standard `ErrorResponse` body with a status code. */
export const apiError = (status: number, message: string) =>
  HttpResponse.json({ message, success: false }, { status });

export interface ScenarioOptions {
  /** Artificial latency in ms (use `"infinite"` to keep loading states on screen). */
  latency?: number | "infinite";
}

export const applyLatency = async ({ latency }: ScenarioOptions = {}) => {
  if (latency === undefined) {
    return;
  }
  await delay(latency);
};

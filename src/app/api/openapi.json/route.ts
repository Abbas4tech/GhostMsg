import { NextResponse } from "next/server";
import { getOpenApiSpec } from "@/server/openapi/openapi";

export function GET(): Response {
  const spec = getOpenApiSpec();
  return NextResponse.json(spec, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

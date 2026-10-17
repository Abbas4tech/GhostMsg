import { NextResponse } from "next/server";
import { getOpenApiSpec } from "@/server/openapi/openapi";

export function GET(): Response {
  const spec = getOpenApiSpec();
  return NextResponse.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Type": "application/json",
    },
  });
}

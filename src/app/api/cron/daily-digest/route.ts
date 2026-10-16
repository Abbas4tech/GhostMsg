import type { NextRequest } from "next/server";
import dbConnect from "@/server/db/db-connect";
import { runDailyDigest } from "@/server/notifications/daily-digest";
import { createMongoDigestDeps } from "@/server/notifications/daily-digest-store";
import { isBearerTokenValid } from "@/server/security/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sends the "Daily digest" emails (ADR 0029). Called by the scheduler only
 * (Vercel Cron, see vercel.json) with `Authorization: Bearer ${CRON_SECRET}`.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json(
      { success: false, message: "Daily digest is not configured" },
      { status: 503 }
    );
  }
  if (!isBearerTokenValid(request.headers.get("authorization"), secret)) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await dbConnect();
    const result = await runDailyDigest(createMongoDigestDeps());
    return Response.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    console.error("Daily digest run failed:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

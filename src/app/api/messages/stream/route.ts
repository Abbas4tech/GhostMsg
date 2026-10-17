import type { NextRequest } from "next/server";
import { getSessionUserId } from "@/server/auth/session";
import { subscribeToMessages } from "@/server/realtime/event-bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  const userId = await getSessionUserId();

  if (!userId) {
    // Not the route's own JSON envelope: this is an EventSource connection,
    // not a fetch the client parses as JSON.
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial keep-alive ping
      controller.enqueue(
        encoder.encode(
          `: connected\n\nevent: ping\ndata: ${JSON.stringify({ time: Date.now() })}\n\n`
        )
      );

      const unsubscribe = subscribeToMessages(userId, (newMsg: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(
              `event: new_message\ndata: ${JSON.stringify(newMsg)}\n\n`
            )
          );
        } catch {
          // Stream closed
        }
      });

      // Keep connection active with 30s heartbeat
      const interval = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(
              `event: ping\ndata: ${JSON.stringify({ time: Date.now() })}\n\n`
            )
          );
        } catch {
          clearInterval(interval);
        }
      }, 30_000);

      req.signal.addEventListener("abort", () => {
        unsubscribe();
        clearInterval(interval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}

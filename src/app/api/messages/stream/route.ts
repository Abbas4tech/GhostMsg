import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { subscribeToMessages } from "@/lib/event-bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  const session = await getServerSession(authOptions);
  const user = session?.user as User;

  if (!user?._id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = String(user._id);
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
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

import { getSuggestedMessages } from "@/server/ai/suggested-messages";

export const runtime = "edge";

export async function GET(): Promise<Response> {
  const messages = await getSuggestedMessages();
  return Response.json({ success: true, messages }, { status: 200 });
}

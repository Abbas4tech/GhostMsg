import type { NextRequest } from "next/server";
import { getPublicProfile } from "@/server/users/public-profile";

/** Public profile + published Q&A for `/u/[username]` (no auth). */
export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ username: string }> }
): Promise<Response> {
  const { username } = await props.params;

  try {
    const profile = await getPublicProfile(username);
    if (!profile) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    return Response.json(profile, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch public answers:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

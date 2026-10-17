import "server-only";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

/** The signed-in recipient's id from the session, or null when signed out. */
export async function getSessionUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as User | undefined;
  return user?._id ? String(user._id) : null;
}

/** The standard 401 body every JSON route answers with when signed out. */
export const unauthorizedResponse = (): Response =>
  Response.json(
    { message: "Not authenticated", success: false },
    { status: 401 }
  );

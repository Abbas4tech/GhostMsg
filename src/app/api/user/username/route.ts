import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { changeUsernameRequestSchema } from "@/schemas/user-settings-schema";
import dbConnect from "@/server/db/db-connect";
import UserModel from "@/server/models/user.model";

/**
 * Changes the username, and with it the Public Profile Link. The client
 * refreshes the session (NextAuth `update`) after a 200.
 */
export async function PATCH(request: NextRequest): Promise<Response> {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;
    if (!user?._id) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const parsed = changeUsernameRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid username",
        },
        { status: 400 }
      );
    }

    const { username } = parsed.data;
    const taken = await UserModel.exists({
      username,
      _id: { $ne: user._id },
    });
    if (taken) {
      return Response.json(
        { success: false, message: "Username is already taken" },
        { status: 409 }
      );
    }

    await UserModel.updateOne({ _id: user._id }, { $set: { username } });

    return Response.json(
      { success: true, message: "Username updated", username },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to change username:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

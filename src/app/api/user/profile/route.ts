import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { updateUserProfileRequestSchema } from "@/schemas/user-settings-schema";
import dbConnect from "@/server/db/db-connect";
import UserModel from "@/server/models/user.model";
import { toUserProfile } from "@/server/users/user-dto";

const PROFILE_FIELDS =
  "username email displayName avatarUrl amaPrompt showAmaBanner";

const unauthorized = () =>
  Response.json(
    { success: false, message: "Not authenticated" },
    { status: 401 }
  );

/** Identity card + AMA banner switch for the signed-in recipient. */
export async function GET(): Promise<Response> {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;
    if (!user?._id) {
      return unauthorized();
    }

    const userDoc = await UserModel.findById(user._id).select(PROFILE_FIELDS);
    if (!userDoc) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, profile: toUserProfile(userDoc) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/** Display name, photo (data URL or null) and "Show the AMA banner". */
export async function PATCH(request: NextRequest): Promise<Response> {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;
    if (!user?._id) {
      return unauthorized();
    }

    const parsed = updateUserProfileRequestSchema.safeParse(
      await request.json()
    );
    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid profile",
        },
        { status: 400 }
      );
    }

    const { displayName, avatarUrl, showAmaBanner } = parsed.data;
    const update: Record<string, unknown> = {};
    if (displayName !== undefined) {
      update.displayName = displayName;
    }
    if (avatarUrl !== undefined) {
      update.avatarUrl = avatarUrl;
    }
    if (showAmaBanner !== undefined) {
      update.showAmaBanner = showAmaBanner;
    }

    const updated = await UserModel.findByIdAndUpdate(
      user._id,
      { $set: update },
      { new: true }
    ).select(PROFILE_FIELDS);

    return Response.json(
      {
        success: true,
        message: "Profile updated",
        profile: toUserProfile(updated ?? {}),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update profile:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

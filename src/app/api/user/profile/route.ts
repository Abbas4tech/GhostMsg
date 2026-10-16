import type { NextRequest } from "next/server";
import { updateUserProfileRequestSchema } from "@/schemas/user-settings-schema";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import UserModel from "@/server/models/user.model";
import { toUserProfile } from "@/server/users/user-dto";

const PROFILE_FIELDS =
  "username email displayName avatarUrl amaPrompt showAmaBanner";

/** Identity card + AMA banner switch for the signed-in recipient. */
export async function GET(): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    const userDoc = await UserModel.findById(userId).select(PROFILE_FIELDS);
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

/** Display name, photo (data URL or null), AMA Prompt and "Show the AMA banner". */
export async function PATCH(request: NextRequest): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();
    if (!userId) {
      return unauthorizedResponse();
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

    const { displayName, avatarUrl, showAmaBanner, amaPrompt } = parsed.data;
    const update: Record<string, unknown> = {};
    if (displayName !== undefined) {
      update.displayName = displayName;
    }
    if (amaPrompt !== undefined) {
      update.amaPrompt = amaPrompt;
    }
    if (avatarUrl !== undefined) {
      update.avatarUrl = avatarUrl;
    }
    if (showAmaBanner !== undefined) {
      update.showAmaBanner = showAmaBanner;
    }

    const updated = await UserModel.findByIdAndUpdate(
      userId,
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

import type { NextRequest } from "next/server";
import { updateUserPreferencesRequestSchema } from "@/schemas/user-settings-schema";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import UserModel from "@/server/models/user.model";
import { toUserPreferences } from "@/server/users/user-dto";

const PREFERENCE_FIELDS = "messagePreferences safetySettings";

/** Messages + Safety settings (suggestions, publish default, quarantine). */
export async function GET(): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    const userDoc = await UserModel.findById(userId).select(PREFERENCE_FIELDS);
    return Response.json(
      { preferences: toUserPreferences(userDoc ?? {}), success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch preferences:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    const parsed = updateUserPreferencesRequestSchema.safeParse(
      await request.json()
    );
    if (!parsed.success) {
      return Response.json(
        { message: "Invalid preferences", success: false },
        { status: 400 }
      );
    }

    // Dot paths so one switch never resets its siblings.
    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data.messages ?? {})) {
      update[`messagePreferences.${key}`] = value;
    }
    for (const [key, value] of Object.entries(parsed.data.safety ?? {})) {
      update[`safetySettings.${key}`] = value;
    }

    const updated = await UserModel.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true }
    ).select(PREFERENCE_FIELDS);

    return Response.json(
      {
        message: "Preferences updated",
        preferences: toUserPreferences(updated ?? {}),
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update preferences:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

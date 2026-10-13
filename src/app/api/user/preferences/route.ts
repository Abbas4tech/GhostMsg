import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { updateUserPreferencesRequestSchema } from "@/schemas/user-settings-schema";
import dbConnect from "@/server/db/db-connect";
import UserModel from "@/server/models/user.model";
import { toUserPreferences } from "@/server/users/user-dto";

const PREFERENCE_FIELDS = "messagePreferences safetySettings";

const unauthorized = () =>
  Response.json(
    { success: false, message: "Not authenticated" },
    { status: 401 }
  );

/** Messages + Safety settings (suggestions, publish default, quarantine). */
export async function GET(): Promise<Response> {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;
    if (!user?._id) {
      return unauthorized();
    }

    const userDoc = await UserModel.findById(user._id).select(
      PREFERENCE_FIELDS
    );
    return Response.json(
      { success: true, preferences: toUserPreferences(userDoc ?? {}) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch preferences:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest): Promise<Response> {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;
    if (!user?._id) {
      return unauthorized();
    }

    const parsed = updateUserPreferencesRequestSchema.safeParse(
      await request.json()
    );
    if (!parsed.success) {
      return Response.json(
        { success: false, message: "Invalid preferences" },
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
      user._id,
      { $set: update },
      { new: true }
    ).select(PREFERENCE_FIELDS);

    return Response.json(
      {
        success: true,
        message: "Preferences updated",
        preferences: toUserPreferences(updated ?? {}),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update preferences:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

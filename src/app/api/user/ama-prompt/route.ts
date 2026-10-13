import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db-connect";
import UserModel from "@/model/user.model";
import { amaPromptSchema } from "@/schemas/message-schema";

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

    const body = await request.json();
    const parseResult = amaPromptSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { success: false, message: "Invalid AMA prompt payload" },
        { status: 400 }
      );
    }

    const { amaPrompt } = parseResult.data;

    await UserModel.updateOne({ _id: user._id }, { $set: { amaPrompt } });

    return Response.json(
      {
        success: true,
        amaPrompt,
        message: "AMA prompt updated successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update AMA prompt:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/server/db/db-connect";
import MessageModel from "@/server/models/message.model";

/** Danger zone: deletes every message (and so every public answer). */
export async function DELETE(): Promise<Response> {
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

    const { deletedCount } = await MessageModel.deleteMany({
      recipientId: user._id,
    });

    return Response.json(
      { success: true, message: "All messages deleted", deletedCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete all messages:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

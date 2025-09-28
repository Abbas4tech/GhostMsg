"use server";
import { getServerSession, User } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const getCurrentUser = async (): Promise<Response | User> => {
  const session = await getServerSession(authOptions);
  const user = session?.user as User;

  if (!user || !session?.user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated, Please login first!",
      },
      {
        status: 401,
      }
    );
  }
  return user;
};

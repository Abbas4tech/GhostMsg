import bcrypt from "bcryptjs";
import type { User } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";

import dbConnect from "@/lib/db-connect";
import UserModel from "@/model/user.model";

export const controlGoogleSignInFlow = async (
  user: User | AdapterUser
): Promise<boolean> => {
  await dbConnect();
  try {
    const existingUser = await UserModel.findOne({
      email: user.email,
    });

    if (existingUser) {
      user._id = existingUser._id.toString();
      user.isVerified = existingUser.isVerified;
      user.isAcceptingMessage = existingUser.isAcceptingMessage;
      user.username = existingUser.username;
    } else {
      const newUser = new UserModel({
        email: user.email,
        username: user.email?.split("@")[0],
        isVerified: true,
        isAcceptingMessages: true,
        password: await bcrypt.hash(Math.random().toString(36).slice(-12), 10),
        verifyCode: Math.floor(100_000 + Math.random() * 900_000).toString(),
        verifyCodeExpiry: new Date(Date.now() + 3_600_000),
      });
      const savedUser = await newUser.save();
      user._id = savedUser._id.toString();
      user.isVerified = savedUser.isVerified;
      user.isAcceptingMessage = savedUser.isAcceptingMessage;
      user.username = savedUser.username;
    }
    return true;
  } catch (error) {
    console.error("Error handling Google sign-in:", error);
    return false;
  }
};

import { User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const controlGoogleSignInFlow = async (
  user: User | AdapterUser
): Promise<boolean> => {
  await dbConnect();
  try {
    const existingUser = await UserModel.findOne({
      email: user.email,
    });

    if (!existingUser) {
      const newUser = new UserModel({
        email: user.email,
        username: user.email?.split("@")[0],
        isVerified: true,
        isAcceptingMessages: true,
        password: await bcrypt.hash(Math.random().toString(36).slice(-12), 10),
        verifyCode: Math.floor(100000 + Math.random() * 900000).toString(),
        verifyCodeExpiry: new Date(Date.now() + 3600000),
      });
      const savedUser = await newUser.save();
      user._id = savedUser._id.toString();
    } else {
      user._id = existingUser._id.toString();
      user.isVerified = existingUser.isVerified;
      user.isAcceptingMessage = existingUser.isAcceptingMessage;
      user.username = existingUser.username;
    }
    return true;
  } catch (error) {
    console.error("Error handling Google sign-in:", error);
    return false;
  }
};

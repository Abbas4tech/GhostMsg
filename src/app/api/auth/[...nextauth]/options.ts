/* eslint-disable @typescript-eslint/no-explicit-any */
import CredentialProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "jsmith@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();

        try {
          const user = await UserModel.findOne({
            $or: [
              {
                email: credentials.identifier,
              },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            throw new Error("No User found with this email or username");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account first before login");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Password is incorrect, Please try again");
          }
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXT_AUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
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
              password: await bcrypt.hash(
                Math.random().toString(36).slice(-12),
                10
              ),
              verifyCode: Math.floor(
                100000 + Math.random() * 900000
              ).toString(),
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
        } catch (error) {
          console.error("Error handling Google sign-in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
        session.user.username = token.username;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessage;
        token.username = user.username;
      }
      return token;
    },
  },
};

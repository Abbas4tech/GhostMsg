import bcrypt from "bcryptjs";
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import dbConnect from "@/lib/db-connect";
import UserModel from "@/model/user.model";

import { controlGoogleSignInFlow } from "./controller/google-signin";

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
      async authorize(
        credentials: Record<string, string> | undefined
      ): Promise<NextAuthUser | null> {
        if (!(credentials?.identifier && credentials?.password)) {
          throw new Error("Identifier and password are required");
        }

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

          if (!user.password) {
            throw new Error("Please sign in with Google for this account");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            return user as unknown as NextAuthUser;
          }
          throw new Error("Password is incorrect, Please try again");
        } catch (error) {
          throw new Error(
            error instanceof Error ? error.message : "Authentication error"
          );
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
        return await controlGoogleSignInFlow(user);
      }
      return true;
    },
    session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
        session.user.username = token.username;
      }
      return session;
    },
    jwt({ token, user }) {
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

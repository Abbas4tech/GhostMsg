import "server-only";
import mongoose, { type Document, Schema, type Types } from "mongoose";

export type { Message } from "./message.model";

export interface NotificationSettings {
  emailAlerts: "instant" | "daily" | "off";
  webPushEnabled: boolean;
}

/** A browser PushSubscription (one per device) used to deliver Web Push. */
export interface PushSubscriptionRecord {
  createdAt: Date;
  endpoint: string;
  keys: { auth: string; p256dh: string };
}

export interface User extends Document {
  _id: Types.ObjectId;
  amaPrompt?: string;
  blockedSenderHashes: string[];
  createdAt: Date;
  email: string;
  isAcceptingMessage: boolean;
  isVerified: boolean;
  notificationSettings: NotificationSettings;
  password?: string;
  pushSubscriptions: PushSubscriptionRecord[];
  updatedAt: Date;
  username: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
}

const PushSubscriptionSchema = new Schema<PushSubscriptionRecord>(
  {
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const NotificationSettingsSchema = new Schema<NotificationSettings>(
  {
    emailAlerts: {
      type: String,
      enum: ["instant", "daily", "off"],
      default: "instant",
    },
    webPushEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const UserSchema: Schema<User> = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/.+@.+\..+/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: false,
    },
    verifyCode: {
      type: String,
      required: [true, "Verify code is required"],
    },
    verifyCodeExpiry: {
      type: Date,
      required: [true, "Verify code Expiry is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAcceptingMessage: {
      type: Boolean,
      default: true,
    },
    amaPrompt: {
      type: String,
      maxlength: 120,
      default: "Send me an anonymous message!",
    },
    blockedSenderHashes: {
      type: [String],
      default: [],
    },
    pushSubscriptions: {
      type: [PushSubscriptionSchema],
      default: [],
    },
    notificationSettings: {
      type: NotificationSettingsSchema,
      default: () => ({
        emailAlerts: "instant",
        webPushEnabled: false,
      }),
    },
  },
  {
    timestamps: true,
  }
);

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;

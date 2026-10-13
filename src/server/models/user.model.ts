import "server-only";
import mongoose, { type Document, Schema, type Types } from "mongoose";

export type { Message } from "./message.model";

export interface QuietHours {
  enabled: boolean;
  /** "HH:MM" in `timeZone`. */
  end: string;
  start: string;
  timeZone: string;
}

export interface NotificationSettings {
  emailAlerts: "instant" | "daily" | "off";
  hideMessageText: boolean;
  quietHours?: QuietHours;
  webPushEnabled: boolean;
}

export interface MessagePreferences {
  offerSuggestions: boolean;
  publishByDefault: boolean;
}

export type QuarantineSensitivity = "relaxed" | "balanced" | "strict";

export interface SafetySettings {
  blurSpicy: boolean;
  quarantineEnabled: boolean;
  sensitivity: QuarantineSensitivity;
}

/** A blocked Sender Hash with when it was blocked (Settings table). */
export interface BlockedSenderRecord {
  blockedAt: Date;
  hash: string;
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
  /** Square avatar as a base64 data URL; absent = initials. */
  avatarUrl?: string | null;
  blockedSenderHashes: string[];
  /** Dates for blocks; `blockedSenderHashes` stays the lookup source. */
  blockedSenders: BlockedSenderRecord[];
  createdAt: Date;
  displayName?: string;
  email: string;
  isAcceptingMessage: boolean;
  isVerified: boolean;
  /** When the last daily digest email went out (null = never). */
  lastDigestSentAt?: Date | null;
  messagePreferences: MessagePreferences;
  notificationSettings: NotificationSettings;
  password?: string;
  pushSubscriptions: PushSubscriptionRecord[];
  safetySettings: SafetySettings;
  showAmaBanner: boolean;
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
    hideMessageText: {
      type: Boolean,
      default: true,
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: "22:00" },
      end: { type: String, default: "08:00" },
      timeZone: { type: String, default: "UTC" },
    },
  },
  { _id: false }
);

const MessagePreferencesSchema = new Schema<MessagePreferences>(
  {
    offerSuggestions: { type: Boolean, default: true },
    publishByDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const SafetySettingsSchema = new Schema<SafetySettings>(
  {
    quarantineEnabled: { type: Boolean, default: true },
    sensitivity: {
      type: String,
      enum: ["relaxed", "balanced", "strict"],
      default: "balanced",
    },
    blurSpicy: { type: Boolean, default: false },
  },
  { _id: false }
);

const BlockedSenderSchema = new Schema<BlockedSenderRecord>(
  {
    hash: { type: String, required: true },
    blockedAt: { type: Date, default: Date.now },
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
    displayName: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    showAmaBanner: {
      type: Boolean,
      default: true,
    },
    messagePreferences: {
      type: MessagePreferencesSchema,
      default: () => ({}),
    },
    safetySettings: {
      type: SafetySettingsSchema,
      default: () => ({}),
    },
    blockedSenders: {
      type: [BlockedSenderSchema],
      default: [],
    },
    blockedSenderHashes: {
      type: [String],
      default: [],
    },
    pushSubscriptions: {
      type: [PushSubscriptionSchema],
      default: [],
    },
    lastDigestSentAt: {
      type: Date,
      default: null,
    },
    notificationSettings: {
      type: NotificationSettingsSchema,
      default: () => ({
        emailAlerts: "instant",
        webPushEnabled: false,
        hideMessageText: true,
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

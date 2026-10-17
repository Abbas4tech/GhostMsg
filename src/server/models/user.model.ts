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
    createdAt: { default: Date.now, type: Date },
    endpoint: { required: true, type: String },
    keys: {
      auth: { required: true, type: String },
      p256dh: { required: true, type: String },
    },
  },
  { _id: false }
);

const NotificationSettingsSchema = new Schema<NotificationSettings>(
  {
    emailAlerts: {
      default: "instant",
      enum: ["instant", "daily", "off"],
      type: String,
    },
    hideMessageText: {
      default: true,
      type: Boolean,
    },
    quietHours: {
      enabled: { default: false, type: Boolean },
      end: { default: "08:00", type: String },
      start: { default: "22:00", type: String },
      timeZone: { default: "UTC", type: String },
    },
    webPushEnabled: {
      default: false,
      type: Boolean,
    },
  },
  { _id: false }
);

const MessagePreferencesSchema = new Schema<MessagePreferences>(
  {
    offerSuggestions: { default: true, type: Boolean },
    publishByDefault: { default: false, type: Boolean },
  },
  { _id: false }
);

const SafetySettingsSchema = new Schema<SafetySettings>(
  {
    blurSpicy: { default: false, type: Boolean },
    quarantineEnabled: { default: true, type: Boolean },
    sensitivity: {
      default: "balanced",
      enum: ["relaxed", "balanced", "strict"],
      type: String,
    },
  },
  { _id: false }
);

const BlockedSenderSchema = new Schema<BlockedSenderRecord>(
  {
    blockedAt: { default: Date.now, type: Date },
    hash: { required: true, type: String },
  },
  { _id: false }
);

const UserSchema: Schema<User> = new Schema(
  {
    amaPrompt: {
      default: "Send me an anonymous message!",
      maxlength: 120,
      type: String,
    },
    avatarUrl: {
      default: null,
      type: String,
    },
    blockedSenderHashes: {
      default: [],
      type: [String],
    },
    blockedSenders: {
      default: [],
      type: [BlockedSenderSchema],
    },
    displayName: {
      default: "",
      maxlength: 40,
      trim: true,
      type: String,
    },
    email: {
      match: [/.+@.+\..+/, "Please use a valid email address"],
      required: [true, "Email is required"],
      type: String,
      unique: true,
    },
    isAcceptingMessage: {
      default: true,
      type: Boolean,
    },
    isVerified: {
      default: false,
      type: Boolean,
    },
    lastDigestSentAt: {
      default: null,
      type: Date,
    },
    messagePreferences: {
      default: () => ({}),
      type: MessagePreferencesSchema,
    },
    notificationSettings: {
      default: () => ({
        emailAlerts: "instant",
        hideMessageText: true,
        webPushEnabled: false,
      }),
      type: NotificationSettingsSchema,
    },
    password: {
      required: false,
      type: String,
    },
    pushSubscriptions: {
      default: [],
      type: [PushSubscriptionSchema],
    },
    safetySettings: {
      default: () => ({}),
      type: SafetySettingsSchema,
    },
    showAmaBanner: {
      default: true,
      type: Boolean,
    },
    username: {
      required: [true, "Username is required"],
      trim: true,
      type: String,
      unique: true,
    },
    verifyCode: {
      required: [true, "Verify code is required"],
      type: String,
    },
    verifyCodeExpiry: {
      required: [true, "Verify code Expiry is required"],
      type: Date,
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

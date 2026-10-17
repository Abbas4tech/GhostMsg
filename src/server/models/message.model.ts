import "server-only";
import mongoose, { type Document, Schema, type Types } from "mongoose";

export type SentimentTag = "sweet" | "curious" | "spicy" | "advice" | "neutral";

export interface IMessageReply {
  isPublished: boolean;
  publishedAt?: Date | string;
  text: string;
}

export interface Message {
  _id: Types.ObjectId | string;
  content: string;
  createdAt: Date | string;
  isPinned?: boolean;
  isQuarantined?: boolean;
  isRead?: boolean;
  recipientId?: Types.ObjectId | string;
  reply?: IMessageReply | null;
  senderHash?: string;
  sentimentTag?: SentimentTag;
  updatedAt?: Date | string;
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  content: string;
  createdAt: Date;
  isPinned: boolean;
  isQuarantined: boolean;
  isRead: boolean;
  recipientId: Types.ObjectId;
  reply?: IMessageReply | null;
  senderHash: string;
  sentimentTag: SentimentTag;
  updatedAt: Date;
}

const MessageReplySchema = new Schema<IMessageReply>(
  {
    isPublished: { default: false, type: Boolean },
    publishedAt: { type: Date },
    text: { maxlength: 1000, required: true, type: String },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    content: {
      maxlength: 300,
      minlength: 10,
      required: true,
      trim: true,
      type: String,
    },
    isPinned: {
      default: false,
      index: true,
      type: Boolean,
    },
    isQuarantined: {
      default: false,
      index: true,
      type: Boolean,
    },
    isRead: {
      default: false,
      index: true,
      type: Boolean,
    },
    recipientId: {
      index: true,
      ref: "User",
      required: true,
      type: Schema.Types.ObjectId,
    },
    reply: {
      default: null,
      type: MessageReplySchema,
    },
    senderHash: {
      index: true,
      required: true,
      type: String,
    },
    sentimentTag: {
      default: "neutral",
      enum: ["sweet", "curious", "spicy", "advice", "neutral"],
      required: true,
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ createdAt: -1, isQuarantined: 1, recipientId: 1 });
MessageSchema.index({ createdAt: -1, isPinned: 1, recipientId: 1 });
MessageSchema.index({ createdAt: -1, recipientId: 1, "reply.isPublished": 1 });

const MessageModel =
  (mongoose.models.Message as mongoose.Model<IMessage>) ||
  mongoose.model<IMessage>("Message", MessageSchema);

export default MessageModel;

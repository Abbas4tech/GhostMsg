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
    text: { type: String, required: true, maxlength: 1000 },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 300,
      trim: true,
    },
    sentimentTag: {
      type: String,
      enum: ["sweet", "curious", "spicy", "advice", "neutral"],
      default: "neutral",
      required: true,
    },
    isQuarantined: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    reply: {
      type: MessageReplySchema,
      default: null,
    },
    senderHash: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ recipientId: 1, isQuarantined: 1, createdAt: -1 });
MessageSchema.index({ recipientId: 1, isPinned: 1, createdAt: -1 });
MessageSchema.index({ recipientId: 1, "reply.isPublished": 1, createdAt: -1 });

const MessageModel =
  (mongoose.models.Message as mongoose.Model<IMessage>) ||
  mongoose.model<IMessage>("Message", MessageSchema);

export default MessageModel;

import { describe, expect, it } from "vitest";
import {
  blockSenderSchema,
  bulkActionSchema,
  messageSchema,
  sendMessageSchema,
} from "../message-schema";

describe("message-schema.ts", () => {
  describe("messageSchema", () => {
    it("should accept valid content between 10 and 300 characters", () => {
      const result = messageSchema.safeParse({
        content: "Hello! This is a valid anonymous message.",
      });
      expect(result.success).toBe(true);
    });

    it("should reject content under 10 characters", () => {
      const result = messageSchema.safeParse({
        content: "Too short",
      });
      expect(result.success).toBe(false);
    });

    it("should reject content over 300 characters", () => {
      const longText = "a".repeat(301);
      const result = messageSchema.safeParse({
        content: longText,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("sendMessageSchema", () => {
    it("should require both username and content", () => {
      const result = sendMessageSchema.safeParse({
        username: "johndoe",
        content: "Hey John! Loved your recent portfolio update.",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty username", () => {
      const result = sendMessageSchema.safeParse({
        username: "",
        content: "Hey John! Loved your recent portfolio update.",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("blockSenderSchema", () => {
    it("should accept valid senderHash", () => {
      const result = blockSenderSchema.safeParse({
        senderHash: "a8f5c921000b",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty senderHash", () => {
      const result = blockSenderSchema.safeParse({
        senderHash: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("bulkActionSchema", () => {
    it("should accept valid bulk action (delete, read, star) with non-empty ids", () => {
      const result = bulkActionSchema.safeParse({
        action: "read",
        ids: ["msg1", "msg2"],
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid bulk action name", () => {
      const result = bulkActionSchema.safeParse({
        action: "invalid_action",
        ids: ["msg1"],
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty ids array", () => {
      const result = bulkActionSchema.safeParse({
        action: "delete",
        ids: [],
      });
      expect(result.success).toBe(false);
    });
  });
});

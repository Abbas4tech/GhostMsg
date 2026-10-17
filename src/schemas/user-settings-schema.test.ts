import { describe, expect, it } from "vitest";
import {
  avatarDataUrlSchema,
  changeUsernameRequestSchema,
  deleteAccountRequestSchema,
  displayNameSchema,
  updateUserPreferencesRequestSchema,
  updateUserProfileRequestSchema,
} from "./user-settings-schema";

describe("user-settings-schema", () => {
  it("trims and caps the display name", () => {
    expect(displayNameSchema.parse("  Maya  ")).toBe("Maya");
    expect(displayNameSchema.safeParse("x".repeat(41)).success).toBe(false);
  });

  it("accepts only small base64 image data URLs as avatars", () => {
    expect(
      avatarDataUrlSchema.safeParse("data:image/webp;base64,UklGRg==").success
    ).toBe(true);
    expect(
      avatarDataUrlSchema.safeParse("https://evil.example/a.png").success
    ).toBe(false);
    expect(
      avatarDataUrlSchema.safeParse("data:image/svg+xml;base64,PHN2Zz4=")
        .success
    ).toBe(false);
  });

  it("lets the profile update remove the photo with null", () => {
    expect(
      updateUserProfileRequestSchema.safeParse({ avatarUrl: null }).success
    ).toBe(true);
  });

  it("validates usernames like sign-up does", () => {
    expect(
      changeUsernameRequestSchema.safeParse({ username: "maya_2" }).success
    ).toBe(true);
    expect(
      changeUsernameRequestSchema.safeParse({ username: "bad name" }).success
    ).toBe(false);
  });

  it("accepts partial preference updates and rejects unknown sensitivity", () => {
    expect(
      updateUserPreferencesRequestSchema.safeParse({
        safety: { sensitivity: "strict" },
      }).success
    ).toBe(true);
    expect(
      updateUserPreferencesRequestSchema.safeParse({
        safety: { sensitivity: "paranoid" },
      }).success
    ).toBe(false);
  });

  it("requires a typed username to delete the account", () => {
    expect(
      deleteAccountRequestSchema.safeParse({ confirmUsername: "" }).success
    ).toBe(false);
  });
});

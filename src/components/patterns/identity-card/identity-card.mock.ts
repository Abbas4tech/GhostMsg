import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { IdentityCardProps } from "./identity-card";

/** 1×1 lavender PNG, so the photo state renders without a network image. */
export const FIXTURE_AVATAR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8+P9/PQAJZAPm1iBb+gAAAABJRU5ErkJggg==";

export const defaultIdentityCardArgs: IdentityCardProps = {
  username: FIXTURE_USERNAME,
  displayName: "John",
  avatarUrl: null,
  linkPrefix: "ghostmsg.app/u/",
  isPhotoProcessing: false,
  onChangeUsername: noop,
  onDisplayNameChange: noop,
  onPhotoRemove: noop,
  onPhotoSelect: noop,
};

export const withPhotoIdentityCardArgs = {
  avatarUrl: FIXTURE_AVATAR_DATA_URL,
} satisfies Partial<IdentityCardProps>;

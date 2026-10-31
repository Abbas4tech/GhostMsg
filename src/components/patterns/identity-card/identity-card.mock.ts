import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { IdentityCardProps, IdentitySummaryProps } from "./identity-card";

/** 1×1 lavender PNG, so the photo state renders without a network image. */
export const FIXTURE_AVATAR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8+P9/PQAJZAPm1iBb+gAAAABJRU5ErkJggg==";

export const defaultIdentityCardArgs: IdentityCardProps = {
  avatarUrl: null,
  displayName: "John",
  isPhotoProcessing: false,
  linkPrefix: "ghostmsg.app/u/",
  onChangeUsername: noop,
  onDisplayNameChange: noop,
  onPhotoRemove: noop,
  onPhotoSelect: noop,
  username: FIXTURE_USERNAME,
};

export const withPhotoIdentityCardArgs = {
  avatarUrl: FIXTURE_AVATAR_DATA_URL,
} satisfies Partial<IdentityCardProps>;

/** Design MobProfile: the collapsed identity row. */
export const defaultIdentitySummaryArgs: IdentitySummaryProps = {
  avatarUrl: null,
  displayName: "John",
  onEdit: noop,
  username: FIXTURE_USERNAME,
};

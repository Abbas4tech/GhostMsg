import type { SettingsSectionProps } from "./settings-section";

export const SETTINGS_SECTION_VARIANTS = [
  "card",
  "grouped",
  "minimal",
  "row",
] as const;
export const SETTINGS_SECTION_SIZES = ["sm", "md", "lg"] as const;

export const defaultSettingsSectionArgs: Omit<
  SettingsSectionProps,
  "controlSlot"
> = {
  title: "Accept Messages",
  description: "Your public profile is active and accepting messages",
  variant: "row",
  size: "md",
  controlId: "accept-messages",
};

export const cardSettingsSectionArgs = {
  title: "Message Acceptance",
  description:
    "Control whether visitors can send anonymous messages to your link.",
  variant: "card",
} satisfies Partial<SettingsSectionProps>;

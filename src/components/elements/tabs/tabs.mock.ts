export const tabsMockItems = [
  { content: "Your inbox appears here.", label: "Messages", value: "messages" },
  { content: "Share your profile link.", label: "Profile", value: "profile" },
  { content: "Manage notifications.", label: "Settings", value: "settings" },
] as const;

export const defaultTabsArgs = {
  defaultValue: "messages",
};

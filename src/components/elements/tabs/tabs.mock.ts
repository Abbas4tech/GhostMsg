export const tabsMockItems = [
  { value: "messages", label: "Messages", content: "Your inbox appears here." },
  { value: "profile", label: "Profile", content: "Share your profile link." },
  { value: "settings", label: "Settings", content: "Manage notifications." },
] as const;

export const defaultTabsArgs = {
  defaultValue: "messages",
};

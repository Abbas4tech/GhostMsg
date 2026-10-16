import type { SectionNavProps } from "./section-nav";

export const defaultSectionNavArgs: SectionNavProps = {
  items: [
    { id: "messages", label: "Messages" },
    { id: "safety", label: "Safety & blocking" },
    { id: "notifications", label: "Notifications" },
    { id: "appearance", label: "Appearance" },
  ],
  activeId: "safety",
};

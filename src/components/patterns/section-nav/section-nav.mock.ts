import type { SectionNavProps } from "./section-nav";

export const defaultSectionNavArgs: SectionNavProps = {
  activeId: "safety",
  items: [
    { id: "messages", label: "Messages" },
    { id: "safety", label: "Safety & blocking" },
    { id: "notifications", label: "Notifications" },
    { id: "appearance", label: "Appearance" },
  ],
};

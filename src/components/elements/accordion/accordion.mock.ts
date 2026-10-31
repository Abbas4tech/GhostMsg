/** Settings accordion copy (design MobSettings: one section per row). */
export const accordionMockItems = [
  {
    content: "Message Acceptance, Suggested Messages and Public Q&A defaults.",
    title: "Messages",
    value: "messages",
  },
  {
    content: "Quarantine sensitivity and blocked Sender Hashes.",
    title: "Safety & blocking",
    value: "safety",
  },
  {
    content: "Email digests, push and quiet hours.",
    title: "Notifications",
    value: "notifications",
  },
] as const;

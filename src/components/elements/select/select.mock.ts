export const SELECT_TRIGGER_SIZES = ["sm", "default", "lg"] as const;

export const selectMockContent = {
  label: "Email frequency",
  options: [
    { label: "Instant", value: "instant" },
    { label: "Daily digest", value: "daily" },
    { label: "Off", value: "off" },
  ],
};

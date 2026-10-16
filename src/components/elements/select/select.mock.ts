export const SELECT_TRIGGER_SIZES = ["sm", "default", "lg"] as const;

export const selectMockContent = {
  label: "Email frequency",
  options: [
    { value: "instant", label: "Instant" },
    { value: "daily", label: "Daily digest" },
    { value: "off", label: "Off" },
  ],
};

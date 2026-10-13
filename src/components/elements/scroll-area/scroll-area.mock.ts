export const scrollAreaMockContent = {
  label: "Blocked senders",
  rows: Array.from(
    { length: 30 },
    (_, i) => `Sender #${(i + 1).toString(16).padStart(4, "0")}`
  ),
};

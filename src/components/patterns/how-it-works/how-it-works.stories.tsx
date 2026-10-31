import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { HowItWorks } from "./how-it-works";
import { defaultHowItWorksArgs } from "./how-it-works.mock";

const meta = {
  args: defaultHowItWorksArgs,
  argTypes: {
    answer: { control: "text", description: "Example answer" },
    message: { control: "text", description: "Example Anonymous Message" },
    profileLabel: { control: "text", description: "Example link" },
    sentiment: {
      control: "select",
      description: "Sentiment Tag of the example",
      options: ["sweet", "curious", "spicy", "advice", "neutral"],
    },
  },
  component: HowItWorks,
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="max-w-xl">
      <HowItWorks {...args} />
    </div>
  ),
  tags: ["autodocs"],
  title: "Patterns/HowItWorks",
} satisfies Meta<typeof HowItWorks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FourSteps: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("list", { name: "How GhostMsg works in four steps" })
    ).toBeVisible();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(4);
    await expect(canvas.queryByRole("button")).toBeNull();
  },
};

/** Design MobLanding: "How it works", a step counter and one card plus a peek. */
export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 2, name: "How it works" })
    ).toBeVisible();
    await expect(canvas.getByText("1 / 4")).toBeVisible();
    await expect(canvas.getByText("Step 1 · Share your link")).toBeVisible();
  },
};

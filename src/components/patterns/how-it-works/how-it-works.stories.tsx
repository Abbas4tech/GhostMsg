import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { HowItWorks } from "./how-it-works";
import { defaultHowItWorksArgs } from "./how-it-works.mock";

const meta = {
  title: "Patterns/HowItWorks",
  component: HowItWorks,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: defaultHowItWorksArgs,
  argTypes: {
    profileLabel: { control: "text", description: "Example link" },
    message: { control: "text", description: "Example Anonymous Message" },
    answer: { control: "text", description: "Example answer" },
    sentiment: {
      control: "select",
      options: ["sweet", "curious", "spicy", "advice", "neutral"],
      description: "Sentiment Tag of the example",
    },
  },
  render: (args) => (
    <div className="max-w-xl">
      <HowItWorks {...args} />
    </div>
  ),
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

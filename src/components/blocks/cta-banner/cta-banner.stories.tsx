import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { CtaBanner } from "./cta-banner";
import { defaultCtaBannerArgs } from "./cta-banner.mock";

const meta = {
  args: defaultCtaBannerArgs,
  argTypes: {
    actionHref: { control: "text", description: "Button target" },
    actionLabel: { control: "text", description: "Button label" },
    title: { control: "text", description: "Headline" },
  },
  component: CtaBanner,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "Blocks/CtaBanner",
} satisfies Meta<typeof CtaBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GetYourLink: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: "Get your link" })
    ).toHaveAttribute("href", "/sign-up");
  },
};

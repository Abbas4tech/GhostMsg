import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { CtaBanner } from "./cta-banner";
import { defaultCtaBannerArgs } from "./cta-banner.mock";

const meta = {
  args: defaultCtaBannerArgs,
  argTypes: {
    actionHref: { control: "text", description: "Button target" },
    actionLabel: { control: "text", description: "Button label" },
    subtitle: {
      control: "text",
      description: "Second sentence (own line on phones)",
    },
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

/** Design MobLanding: short heading, the subtitle on its own line, full-width button. */
export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", {
        level: 2,
        name: "Your friends have things to say.",
      })
    ).toBeVisible();
    const subtitles = canvas.getAllByText("Give them a safe place to say it.");
    await expect(subtitles.some((node) => node.tagName === "P")).toBe(true);
    await expect(subtitles.find((node) => node.tagName === "P")).toBeVisible();
  },
};

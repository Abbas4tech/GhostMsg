import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { ClaimLinkForm } from "@/components/patterns/claim-link-form";
import { defaultClaimLinkFormArgs } from "@/components/patterns/claim-link-form/claim-link-form.mock";
import { HowItWorks } from "@/components/patterns/how-it-works";
import { defaultHowItWorksArgs } from "@/components/patterns/how-it-works/how-it-works.mock";
import { Hero } from "./hero";
import { defaultHeroArgs } from "./hero.mock";

const meta = {
  args: defaultHeroArgs,
  argTypes: {
    children: { control: false, description: "Call to action slot" },
    description: { control: "text", description: "Lead paragraph" },
    eyebrow: { control: false, description: "Pill above the headline" },
    showcase: { control: false, description: "Right-hand illustration" },
    title: { control: "text", description: "Page h1" },
  },
  component: Hero,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "Blocks/Hero",
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Landing: Story = {
  args: {
    children: <ClaimLinkForm {...defaultClaimLinkFormArgs} />,
    showcase: <HowItWorks {...defaultHowItWorksArgs} />,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", {
        level: 1,
        name: defaultHeroArgs.title as string,
      })
    ).toBeVisible();
    await expect(
      canvas.getByText(defaultHeroArgs.description as string)
    ).toBeVisible();
    await expect(
      canvas.getByRole("form", { name: "Claim your link" })
    ).toBeVisible();
  },
};

export const CopyOnly: Story = {};

export const Mobile: Story = {
  args: Landing.args,
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
